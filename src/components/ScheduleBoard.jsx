import React, { useState, useEffect, useCallback, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../ManageSchedule.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getEmployeeStatusToday,
  setEmployeeAbsent,
  createEmployeeLeave,
  getAvailableStaff,
  getPendingLeaves,
  approveEmployeeLeave,
  rejectEmployeeLeave,
  getScheduleMonthSummary,
} from "../callapi/call_api_employee";
import {
  getScheduleByDate,
  assignBookingStaff,
  randomReassignBooking,
  updateBookingStatus,
  updateBooking,
  updateBookingServices,
  getAffectedBookings,
} from "../callapi/call_api_booking";
import { fetchServicesByStore } from "../callapi/call_api_manageservices";

const STATUS_LABELS = {
  1: "พร้อมให้บริการ",
  2: "กำลังให้บริการ",
  3: "พัก",
  4: "ลา",
  5: "ไม่มาทำงาน",
  6: "วันหยุด",
};

const BOOKING_STATUS = {
  1: { label: "รอยืนยัน", cls: "qstatus-pending" },
  2: { label: "ยืนยันแล้ว", cls: "qstatus-confirmed" },
  3: { label: "เสร็จสิ้น", cls: "qstatus-done" },
  4: { label: "ยกเลิก", cls: "qstatus-cancelled" },
};

function statusEmoji(emp) {
  if (emp.on_absent_today) return "🔴";
  if (emp.on_leave_today) return "🟡";
  if (emp.current_status_id === 1) return "🟢";
  return "⚪";
}

function toDateStr(date) {
  return date.toISOString().split("T")[0];
}

/**
 * ตารางงานพนักงาน -- ใช้ร่วมกันระหว่างหน้า Admin (ManageSchedule) และหน้าช่าง
 * (MySchedule) โดย backend เป็นผู้กรองข้อมูลให้เหลือเฉพาะของช่างคนนั้นเองเมื่อ
 * mode="employee" (ผ่าน token) -- ฝั่งนี้แค่ซ่อนปุ่มจัดการที่ช่างไม่ควรเห็น
 */
export default function ScheduleBoard({ mode = "admin", storeId, embedded = false }) {
  const navigate = useNavigate();
  const isAdmin = mode === "admin";

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [scheduleDays, setScheduleDays] = useState(new Set());
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [statusToday, setStatusToday] = useState([]);
  const [staffFilter, setStaffFilter] = useState("all");
  const [reassignChoices, setReassignChoices] = useState({}); // booking_id -> [{employee_id, fullname}]
  const [leaveForm, setLeaveForm] = useState(null); // { employee }
  const [affectedModal, setAffectedModal] = useState(null); // { employee, bookings }
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [services, setServices] = useState([]);

  const dateStr = toDateStr(selectedDate);

  const dayStats = useMemo(() => ({
    totalQueue: todaySchedule.length,
    available: statusToday.filter((e) => !e.on_leave_today && !e.on_absent_today && e.current_status_id === 1).length,
    leave: statusToday.filter((e) => e.on_leave_today).length,
    absent: statusToday.filter((e) => e.on_absent_today).length,
  }), [todaySchedule, statusToday]);

  const filteredSchedule = useMemo(() => {
    if (!isAdmin || staffFilter === "all") return todaySchedule;
    return todaySchedule.filter((item) => String(item.employee_id) === staffFilter);
  }, [todaySchedule, staffFilter, isAdmin]);

  const serviceNameById = useMemo(() => {
    const map = new Map();
    services.forEach((s) => map.set(s.service_id, s.service_name));
    return map;
  }, [services]);

  const loadSchedule = useCallback(async () => {
    if (!storeId) return;
    try {
      const data = await getScheduleByDate(storeId, dateStr);
      setTodaySchedule(
        data.map((item) => ({
          booking_id: item.booking_id,
          time: item.booking_time,
          customer_name: item.customer_name,
          employee: item.employee_name,
          employee_id: item.employee_id,
          total_minutes: item.total_minutes,
          status_booking_id: item.status_booking_id,
          service_ids: item.service_ids ? String(item.service_ids).split(",").map(Number) : [],
        }))
      );
    } catch (err) {
      console.error(err);
    }
  }, [storeId, dateStr]);

  const loadStatusToday = useCallback(async () => {
    if (!storeId) return;
    try {
      const data = await getEmployeeStatusToday(storeId);
      setStatusToday(data);
    } catch (err) {
      console.error(err);
    }
  }, [storeId]);

  const loadMonthSummary = useCallback(async () => {
    if (!storeId) return;
    try {
      const year = activeStartDate.getFullYear();
      const month = activeStartDate.getMonth() + 1;
      const data = await getScheduleMonthSummary(storeId, year, month);
      setScheduleDays(new Set(data.map((d) => String(d.date))));
    } catch (err) {
      console.error(err);
    }
  }, [storeId, activeStartDate]);

  useEffect(() => { loadSchedule(); }, [loadSchedule]);
  useEffect(() => { loadStatusToday(); }, [loadStatusToday]);
  useEffect(() => { loadMonthSummary(); }, [loadMonthSummary]);

  const loadPendingLeaves = useCallback(async () => {
    if (!storeId || !isAdmin) return;
    try {
      const data = await getPendingLeaves(storeId);
      setPendingLeaves(data);
    } catch (err) {
      console.error(err);
    }
  }, [storeId, isAdmin]);

  useEffect(() => { loadPendingLeaves(); }, [loadPendingLeaves]);

  useEffect(() => {
    if (!storeId) return;
    fetchServicesByStore(storeId)
      .then(setServices)
      .catch((err) => console.error(err));
  }, [storeId]);

  // ===== มอบหมายพนักงานให้คิวที่ยังไม่มีช่าง (ตรวจ eligibility ที่ backend แล้ว) =====
  const assignEmployee = async (bookingId, employeeId) => {
    if (!employeeId) return;
    try {
      await assignBookingStaff(bookingId, {
        employee_id: Number(employeeId),
        reason: "ADMIN_CHANGE",
        changed_by: "admin",
      });
      await loadSchedule();
    } catch (err) {
      Swal.fire("ไม่สามารถมอบหมายช่างได้", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  // โหลดรายชื่อช่างที่ "ว่างจริง" สำหรับคิวหนึ่ง ๆ (ใช้ตอนกดเปิด dropdown)
  const loadReassignChoices = async (booking) => {
    try {
      const list = await getAvailableStaff(storeId, {
        date: dateStr,
        time: booking.time,
        minutes: booking.total_minutes,
        service_ids: booking.service_ids.join(","),
      });
      setReassignChoices((prev) => ({ ...prev, [booking.booking_id]: list }));
    } catch (err) {
      console.error(err);
    }
  };

  // ===== แจ้งลา =====
  const submitLeave = async () => {
    if (!leaveForm) return;
    try {
      await createEmployeeLeave(leaveForm.employee.employee_id, {
        leave_scope: leaveForm.leave_scope,
        absence_date: leaveForm.absence_date,
        start_time: leaveForm.leave_scope === "HALF_DAY" ? leaveForm.start_time : undefined,
        end_time: leaveForm.leave_scope === "HALF_DAY" ? leaveForm.end_time : undefined,
        reason: leaveForm.reason,
        changed_by: "admin",
      });
      setLeaveForm(null);
      await loadPendingLeaves();
      Swal.fire("ส่งคำขอลาแล้ว", "รอการอนุมัติจากผู้จัดการก่อนจึงจะมีผล", "success");
    } catch (err) {
      Swal.fire("บันทึกการลาไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const approveLeaveRequest = async (leave) => {
    try {
      await approveEmployeeLeave(leave.employee_id, leave.absence_id, "admin");
      await Promise.all([loadPendingLeaves(), loadStatusToday(), loadSchedule()]);
    } catch (err) {
      Swal.fire("อนุมัติไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const rejectLeaveRequest = async (leave) => {
    try {
      await rejectEmployeeLeave(leave.employee_id, leave.absence_id, "admin");
      await loadPendingLeaves();
    } catch (err) {
      Swal.fire("ปฏิเสธไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  // ===== แจ้งขาดงานกะทันหัน (จุดเริ่ม flow หลัก) =====
  const handleMarkAbsent = async (employee) => {
    const confirm = await Swal.fire({
      title: `ยืนยันว่า ${employee.fullname} ไม่สามารถมาทำงานได้ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await setEmployeeAbsent(employee.employee_id, {
        absence_date: dateStr,
        reason: "แจ้งขาดงานกะทันหันโดยแอดมิน",
        changed_by: "admin",
      });

      await loadStatusToday();
      await loadSchedule();

      await Swal.fire(
        "บันทึกแล้ว",
        `${employee.fullname} ไม่สามารถมาทำงานได้ มีคิวที่ได้รับผลกระทบ ${res.affected_count} คิว`,
        "info"
      );

      if (res.affected_count > 0) {
        setAffectedModal({ employee, bookings: res.affected_bookings });
      }
    } catch (err) {
      Swal.fire("ไม่สามารถบันทึกได้", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const refreshAffectedModal = async () => {
    if (!affectedModal) return;
    try {
      const res = await getAffectedBookings(affectedModal.employee.employee_id, dateStr);
      if (res.affected_bookings.length === 0) {
        setAffectedModal(null);
      } else {
        setAffectedModal((prev) => ({ ...prev, bookings: res.affected_bookings }));
      }
    } catch (err) {
      console.error(err);
    }
    await loadSchedule();
  };

  const affectedReassign = async (booking, employeeId) => {
    if (!employeeId) return;
    try {
      await assignBookingStaff(booking.booking_id, {
        employee_id: Number(employeeId),
        reason: "STAFF_ABSENT",
        changed_by: "admin",
      });
      await refreshAffectedModal();
    } catch (err) {
      Swal.fire("เปลี่ยนช่างไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const affectedRandom = async (booking) => {
    try {
      const res = await randomReassignBooking(booking.booking_id, {
        reason: "STAFF_ABSENT",
        changed_by: "admin",
      });
      if (res.eligible === false) {
        Swal.fire("ไม่พบช่างที่สามารถให้บริการในช่วงเวลานี้", "", "warning");
        return;
      }
      await refreshAffectedModal();
    } catch (err) {
      Swal.fire("สุ่มช่างไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const affectedReschedule = async (booking) => {
    const { value: formValues } = await Swal.fire({
      title: "เปลี่ยนวัน/เวลานัดหมาย",
      html:
        `<label style="display:block;text-align:left;font-size:0.85rem;margin-bottom:4px;">วันที่</label>` +
        `<input id="swal-resched-date" type="date" class="swal2-input" value="${dateStr}">` +
        `<label style="display:block;text-align:left;font-size:0.85rem;margin:8px 0 4px;">เวลา</label>` +
        `<input id="swal-resched-time" type="time" class="swal2-input" value="${booking.booking_time}">`,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        const date = document.getElementById("swal-resched-date").value;
        const time = document.getElementById("swal-resched-time").value;
        if (!date || !time) {
          Swal.showValidationMessage("กรุณาเลือกวันและเวลา");
          return false;
        }
        return { date, time };
      },
    });
    if (!formValues) return;

    try {
      await updateBooking(booking.booking_id, {
        booking_date: formValues.date,
        booking_time: `${formValues.time}:00`,
      });
      await refreshAffectedModal();
    } catch (err) {
      Swal.fire("เปลี่ยนวัน/เวลาไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const affectedChangeService = async (booking) => {
    const currentIds = booking.service_ids
      ? String(booking.service_ids).split(",").map(Number)
      : [];

    const checklistHtml = services
      .map(
        (s) =>
          `<label style="display:flex;align-items:center;gap:6px;text-align:left;margin:4px 0;">` +
          `<input type="checkbox" value="${s.service_id}" ${currentIds.includes(s.service_id) ? "checked" : ""} />` +
          `${s.service_name}</label>`
      )
      .join("");

    const { value: selectedIds } = await Swal.fire({
      title: "เปลี่ยนบริการของคิว",
      html: `<div id="swal-service-list" style="max-height:260px;overflow-y:auto;">${checklistHtml || "ไม่มีบริการในร้านนี้"}</div>`,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        const checked = Array.from(
          document.querySelectorAll("#swal-service-list input[type=checkbox]:checked")
        ).map((el) => Number(el.value));
        if (checked.length === 0) {
          Swal.showValidationMessage("กรุณาเลือกอย่างน้อย 1 บริการ");
          return false;
        }
        return checked;
      },
    });
    if (!selectedIds) return;

    const chosenServices = services
      .filter((s) => selectedIds.includes(s.service_id))
      .map((s) => ({
        service_id: s.service_id,
        name: s.service_name,
        price: s.price,
        minutes: s.duration_minutes,
      }));

    try {
      const res = await updateBookingServices(booking.booking_id, chosenServices);
      if (res.employee_unassigned) {
        Swal.fire(
          "เปลี่ยนบริการแล้ว",
          "ช่างเดิมไม่มีทักษะตรงกับบริการใหม่ ระบบถอดช่างออกจากคิวนี้ กรุณาเลือกช่างใหม่",
          "info"
        );
      }
      await refreshAffectedModal();
    } catch (err) {
      Swal.fire("เปลี่ยนบริการไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const affectedCancel = async (booking) => {
    const confirm = await Swal.fire({
      title: "ยืนยันยกเลิกการจองนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยกเลิกคิว",
      cancelButtonText: "กลับ",
    });
    if (!confirm.isConfirmed) return;

    try {
      await updateBookingStatus(booking.booking_id, 4);
      await refreshAffectedModal();
    } catch (err) {
      Swal.fire("ยกเลิกไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    return scheduleDays.has(toDateStr(date)) ? "has-schedule" : null;
  };

  return (
    <div className="schedule-root">
      <div className="header">
        <div>
          <h1>{isAdmin ? "ตารางงานพนักงาน" : "ตารางงานของฉัน"}</h1>
          <p>{isAdmin ? "จัดการตารางงาน สถานะ และเวลาทำงานของพนักงาน" : "ดูปฏิทิน คิวงาน และสถานะของคุณ"}</p>
        </div>
        {!embedded && (
          <div style={{ display: "flex", gap: 10 }}>
            {isAdmin ? (
              <>
                <button className="btn-add" onClick={() => setShowPendingModal(true)}>
                  คำขอลารออนุมัติ {pendingLeaves.length > 0 ? `(${pendingLeaves.length})` : ""}
                </button>
                <button
                  className="btn-add"
                  onClick={() => alert("ตารางงานถูกสร้างจากการจองเท่านั้น")}
                >
                  + เพิ่มตารางงานใหม่
                </button>
              </>
            ) : (
              <button className="btn-add btn-logout" onClick={handleLogout}>
                ออกจากระบบ
              </button>
            )}
          </div>
        )}
      </div>

      <div className="schedule-stats-bar">
        <div className="sched-stat-pill">
          <span className="stat-value">{dayStats.totalQueue}</span>
          <span className="stat-label">คิววันนี้</span>
        </div>
        <div className="sched-stat-pill available">
          <span className="stat-value">{dayStats.available}</span>
          <span className="stat-label">พนักงานพร้อม</span>
        </div>
        <div className="sched-stat-pill leave">
          <span className="stat-value">{dayStats.leave}</span>
          <span className="stat-label">ลา</span>
        </div>
        <div className="sched-stat-pill absent">
          <span className="stat-value">{dayStats.absent}</span>
          <span className="stat-label">ขาดงาน</span>
        </div>
      </div>

      {/* ===== ส่วนบน: ปฏิทิน (เต็มความกว้าง) ===== */}
      <section className="schedule-section calendar-section">
        <h3>ปฏิทิน</h3>
        <div className="calendar-box calendar-box-wide">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            locale="th-TH"
            activeStartDate={activeStartDate}
            onActiveStartDateChange={({ activeStartDate: next }) => setActiveStartDate(next)}
            tileClassName={tileClassName}
          />
        </div>
      </section>

      {/* ===== ส่วนล่าง: คิวงานของวันที่เลือก ===== */}
      <section className="schedule-section queue-section">
        <div className="queue-section-header">
          <h3>คิวงานวันที่ {selectedDate.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</h3>
          {isAdmin && (
            <select
              className="assign-select staff-filter"
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
            >
              <option value="all">ช่างทั้งหมด</option>
              {statusToday.map((e) => (
                <option key={e.employee_id} value={String(e.employee_id)}>
                  {e.fullname}
                </option>
              ))}
            </select>
          )}
        </div>

        {filteredSchedule.length === 0 && <p className="empty">ไม่มีคิวในวันนี้</p>}

        <div className="queue-card-list">
          {filteredSchedule.map((item) => {
            const statusMeta = BOOKING_STATUS[item.status_booking_id] || BOOKING_STATUS[1];
            const serviceNames = item.service_ids
              .map((id) => serviceNameById.get(id))
              .filter(Boolean)
              .join(", ");

            return (
              <div className="queue-card" key={item.booking_id}>
                <div className="queue-card-time">{item.time}</div>
                <div className="queue-card-body">
                  <div className="queue-card-customer">{item.customer_name}</div>
                  {serviceNames && <div className="queue-card-service">บริการ: {serviceNames}</div>}
                  <div className="queue-card-employee">
                    {item.employee_id ? (
                      <span className="emp">{item.employee}</span>
                    ) : isAdmin ? (
                      <select
                        className="assign-select"
                        onFocus={() => loadReassignChoices(item)}
                        onChange={(e) => assignEmployee(item.booking_id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="">เลือกพนักงาน (เฉพาะที่ว่างจริง)</option>
                        {(reassignChoices[item.booking_id] || []).map((e) => (
                          <option key={e.employee_id} value={e.employee_id}>
                            {e.fullname}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="emp emp-unassigned">ยังไม่กำหนดช่าง</span>
                    )}
                  </div>
                </div>
                <span className={`queue-status-badge ${statusMeta.cls}`}>{statusMeta.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== ส่วนสถานะพนักงาน ===== */}
      <section className="schedule-section staff-status-section">
        <h3>{isAdmin ? "สถานะพนักงานวันนี้" : "สถานะของฉันวันนี้"}</h3>
        <div className="status-legend">
          <span>🟢 พร้อมให้บริการ</span>
          <span>🟡 ลา</span>
          <span>🔴 ขาดงาน</span>
          <span>⚪ ไม่ได้เข้ากะ</span>
        </div>

        <div className="staff-status-grid">
          {statusToday.map((e) => (
            <div className="staff-status-card" key={e.employee_id}>
              <div className="staff-status-top">
                <span className="emp-avatar-dot">{e.fullname?.[0]}</span>
                <div>
                  <div className="staff-name">{e.fullname}</div>
                  <div className="staff-status-line">
                    {statusEmoji(e)}{" "}
                    {e.on_absent_today ? "ไม่มาทำงาน" : e.on_leave_today ? "ลา" : STATUS_LABELS[e.current_status_id] || "-"}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="staff-status-actions">
                  <button
                    className="assign-select"
                    onClick={() => setLeaveForm({ employee: e, leave_scope: "FULL_DAY", absence_date: dateStr, reason: "" })}
                  >
                    แจ้งลา
                  </button>
                  {!e.on_absent_today && (
                    <button className="assign-select warning" onClick={() => handleMarkAbsent(e)}>
                      แจ้งขาดงาน
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Modal แจ้งลา */}
      {leaveForm && (
        <div className="modal-overlay" onClick={() => setLeaveForm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>แจ้งลา: {leaveForm.employee.fullname}</h3>

            <label>ประเภทการลา</label>
            <select
              value={leaveForm.leave_scope}
              onChange={(e) => setLeaveForm({ ...leaveForm, leave_scope: e.target.value })}
            >
              <option value="FULL_DAY">ลาเต็มวัน</option>
              <option value="HALF_DAY">ลาครึ่งวัน</option>
            </select>

            <label>วันที่ลา</label>
            <input
              type="date"
              value={leaveForm.absence_date}
              onChange={(e) => setLeaveForm({ ...leaveForm, absence_date: e.target.value })}
            />

            {leaveForm.leave_scope === "HALF_DAY" && (
              <>
                <label>เวลาเริ่ม</label>
                <input
                  type="time"
                  value={leaveForm.start_time || "09:00"}
                  onChange={(e) => setLeaveForm({ ...leaveForm, start_time: e.target.value })}
                />
                <label>เวลาสิ้นสุด</label>
                <input
                  type="time"
                  value={leaveForm.end_time || "13:00"}
                  onChange={(e) => setLeaveForm({ ...leaveForm, end_time: e.target.value })}
                />
              </>
            )}

            <label>เหตุผล</label>
            <input
              type="text"
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
            />

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setLeaveForm(null)}>
                ยกเลิก
              </button>
              <button className="save-btn" onClick={submitLeave}>
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal คิวที่ได้รับผลกระทบจากการขาดงาน */}
      {affectedModal && (
        <div className="modal-overlay" onClick={() => setAffectedModal(null)}>
          <div className="modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
            <h3>คิวที่ได้รับผลกระทบจาก {affectedModal.employee.fullname}</h3>

            {affectedModal.bookings.map((b) => (
              <div
                key={b.booking_id}
                style={{ border: "1px solid #f1e3ec", borderRadius: 10, padding: 10, marginBottom: 10 }}
              >
                <div>
                  <strong>{b.customer_name}</strong> ({b.customer_phone}) — {b.booking_time} — {b.services}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  <select
                    className="assign-select"
                    onFocus={() => loadReassignChoices({
                      booking_id: b.booking_id,
                      time: b.booking_time,
                      total_minutes: b.total_minutes,
                      service_ids: b.service_ids ? String(b.service_ids).split(",").map(Number) : [],
                    })}
                    onChange={(e) => affectedReassign(b, e.target.value)}
                    defaultValue=""
                  >
                    <option value="">เปลี่ยนช่าง...</option>
                    {(reassignChoices[b.booking_id] || []).map((e) => (
                      <option key={e.employee_id} value={e.employee_id}>
                        {e.fullname}
                      </option>
                    ))}
                  </select>
                  <button className="assign-select" onClick={() => affectedRandom(b)}>
                    สุ่มช่างใหม่
                  </button>
                  <button className="assign-select" onClick={() => affectedReschedule(b)}>
                    เปลี่ยนวัน/เวลา
                  </button>
                  <button className="assign-select" onClick={() => affectedChangeService(b)}>
                    เปลี่ยนบริการ
                  </button>
                  <button className="assign-select" onClick={() => affectedCancel(b)}>
                    ยกเลิกคิว
                  </button>
                </div>
              </div>
            ))}

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setAffectedModal(null)}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal คำขอลารออนุมัติ */}
      {showPendingModal && (
        <div className="modal-overlay" onClick={() => setShowPendingModal(false)}>
          <div className="modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
            <h3>คำขอลารออนุมัติ</h3>

            {pendingLeaves.length === 0 && <p className="empty">ไม่มีคำขอลารออนุมัติ</p>}

            {pendingLeaves.map((leave) => (
              <div
                key={leave.absence_id}
                style={{ border: "1px solid #f1e3ec", borderRadius: 10, padding: 10, marginBottom: 10 }}
              >
                <div>
                  <strong>{leave.fullname}</strong> —{" "}
                  {leave.leave_scope === "HALF_DAY" ? "ลาครึ่งวัน" : "ลาเต็มวัน"} — {leave.absence_date}
                  {leave.leave_scope === "HALF_DAY" && ` (${leave.start_time}-${leave.end_time})`}
                </div>
                {leave.reason && <div style={{ color: "#777", fontSize: "0.85rem" }}>เหตุผล: {leave.reason}</div>}
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button className="assign-select" onClick={() => approveLeaveRequest(leave)}>
                    อนุมัติ
                  </button>
                  <button className="assign-select" onClick={() => rejectLeaveRequest(leave)}>
                    ปฏิเสธ
                  </button>
                </div>
              </div>
            ))}

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowPendingModal(false)}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
