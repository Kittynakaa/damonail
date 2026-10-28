import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getStoredUser } from "../callapi/auth";
import { getEmployeeLeaves, createEmployeeLeave, cancelEmployeeLeave } from "../callapi/call_api_employee";
import "./StaffLeave.css";

const STATUS_LABELS = {
  PENDING: { label: "รออนุมัติ", cls: "leave-pending" },
  ACTIVE: { label: "อนุมัติแล้ว", cls: "leave-active" },
  REJECTED: { label: "ถูกปฏิเสธ", cls: "leave-rejected" },
  CANCELLED: { label: "ยกเลิกแล้ว", cls: "leave-cancelled" },
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function StaffLeave() {
  const user = getStoredUser();
  const employeeId = user?.employee_id;

  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({
    leave_scope: "FULL_DAY",
    absence_date: todayISO(),
    start_time: "09:00",
    end_time: "13:00",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadLeaves = async () => {
    if (!employeeId) return;
    try {
      const data = await getEmployeeLeaves(employeeId);
      setLeaves(data);
    } catch (err) {
      console.error("โหลดประวัติการลาผิดพลาด", err);
    }
  };

  useEffect(() => {
    loadLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId) return;
    setSubmitting(true);
    try {
      await createEmployeeLeave(employeeId, {
        leave_scope: form.leave_scope,
        absence_date: form.absence_date,
        start_time: form.leave_scope === "HALF_DAY" ? form.start_time : undefined,
        end_time: form.leave_scope === "HALF_DAY" ? form.end_time : undefined,
        reason: form.reason,
      });
      setForm({ leave_scope: "FULL_DAY", absence_date: todayISO(), start_time: "09:00", end_time: "13:00", reason: "" });
      await loadLeaves();
      Swal.fire({ icon: "success", title: "ส่งคำขอลาแล้ว", text: "รอการอนุมัติจากเจ้าของร้าน", timer: 1800, showConfirmButton: false });
    } catch (err) {
      Swal.fire("ส่งคำขอไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (absenceId) => {
    const confirm = await Swal.fire({
      title: "ยกเลิกคำขอลานี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยกเลิกคำขอ",
      cancelButtonText: "กลับ",
    });
    if (!confirm.isConfirmed) return;

    try {
      await cancelEmployeeLeave(employeeId, absenceId);
      await loadLeaves();
    } catch (err) {
      Swal.fire("ยกเลิกไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  return (
    <section className="staff-leave-page">
      <div className="header">
        <div>
          <h1>ขอลาหยุด</h1>
          <p>ส่งคำขอลาและดูประวัติการลาของคุณ</p>
        </div>
      </div>

      <div className="staff-leave-card">
        <h3>ส่งคำขอลาใหม่</h3>
        <form onSubmit={handleSubmit} className="staff-leave-form">
          <label>ประเภทการลา</label>
          <select
            value={form.leave_scope}
            onChange={(e) => setForm({ ...form, leave_scope: e.target.value })}
          >
            <option value="FULL_DAY">ลาเต็มวัน</option>
            <option value="HALF_DAY">ลาครึ่งวัน</option>
          </select>

          <label>วันที่ลา</label>
          <input
            type="date"
            min={todayISO()}
            value={form.absence_date}
            onChange={(e) => setForm({ ...form, absence_date: e.target.value })}
          />

          {form.leave_scope === "HALF_DAY" && (
            <>
              <label>เวลาเริ่ม</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
              <label>เวลาสิ้นสุด</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </>
          )}

          <label>เหตุผล</label>
          <input
            type="text"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="ไม่บังคับ"
          />

          <button type="submit" className="staff-leave-submit" disabled={submitting}>
            {submitting ? "กำลังส่ง..." : "ส่งคำขอลา"}
          </button>
        </form>
      </div>

      <div className="staff-leave-card">
        <h3>ประวัติการลา</h3>
        {leaves.length === 0 ? (
          <p className="staff-empty">ยังไม่มีประวัติการลา</p>
        ) : (
          <div className="staff-leave-list">
            {leaves.map((l) => {
              const meta = STATUS_LABELS[l.status] || { label: l.status, cls: "" };
              const cancellable = l.status === "PENDING" || l.status === "ACTIVE";
              return (
                <div className="staff-leave-item" key={l.absence_id}>
                  <div>
                    <div className="staff-leave-item-top">
                      <strong>{l.leave_scope === "HALF_DAY" ? "ลาครึ่งวัน" : "ลาเต็มวัน"}</strong>
                      <span className={`leave-status ${meta.cls}`}>{meta.label}</span>
                    </div>
                    <div className="staff-leave-item-meta">
                      {l.absence_date}
                      {l.leave_scope === "HALF_DAY" && ` (${l.start_time}-${l.end_time})`}
                    </div>
                    {l.reason && <div className="staff-leave-item-reason">เหตุผล: {l.reason}</div>}
                  </div>
                  {cancellable && (
                    <button className="staff-leave-cancel-btn" onClick={() => handleCancel(l.absence_id)}>
                      ยกเลิกคำขอ
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
