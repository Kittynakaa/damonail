import React, { useState, useEffect, useMemo } from "react";
import { FiEdit2, FiTrash2, FiSearch, FiDownload, FiKey } from "react-icons/fi";
import ReactDOM from "react-dom";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "./ManageEmployees.css";
import {
  getEmployeesByStore,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus,
  getEmployeeSkills,
  setEmployeeSkills,
  getEmployeeWorkHours,
  setEmployeeWorkHours,
  setEmployeePayRate,
  createEmployeeAccount,
} from "./callapi/call_api_employee";
import { fetchServicesByStore } from "./callapi/call_api_manageservices";

const STATUS_LABELS = {
  1: "พร้อมให้บริการ",
  2: "กำลังให้บริการ",
  3: "พัก",
  4: "ลา",
  5: "ไม่มาทำงาน",
  6: "วันหยุด",
};

// สถานะที่แก้ผ่านช่องทางนี้ได้โดยตรง (ลา/ขาดงานต้องไปผ่านหน้าตารางงานเพื่อให้
// ระบบค้นหาคิวที่ได้รับผลกระทบให้ด้วย)
const QUICK_STATUS_OPTIONS = [
  { id: 1, label: "พร้อมให้บริการ" },
  { id: 3, label: "พัก" },
  { id: 6, label: "วันหยุด" },
];

const DAY_LABELS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสฯ", "ศุกร์", "เสาร์", "อาทิตย์"];

function avatarColorFromString(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return { bg: `hsl(${h}, 70%, 92%)`, text: `hsl(${h}, 55%, 42%)` };
}

function defaultWorkHours() {
  return [1, 2, 3, 4, 5, 6, 7].map((d) => ({
    day_of_week: d,
    start_time: "09:00",
    end_time: "18:00",
    is_working: d !== 7,
  }));
}

function formatEmployee(emp) {
  return {
    id: emp.employee_id,
    name: emp.fullname,
    role: emp.position,
    phone: emp.phone,
    email: emp.email || "-",
    start: emp.start_date,
    statusId: emp.current_status_id || 1,
    status: STATUS_LABELS[emp.current_status_id] || emp.status_employee_name || "พร้อมให้บริการ",
    base_salary: emp.base_salary,
    commission_rate: emp.commission_rate,
    hasAccount: !!emp.user_id,
  };
}

export default function ManageEmployees() {
  const { storeId } = useParams();
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);

  const refreshEmployees = async () => {
    try {
      const data = await getEmployeesByStore(storeId);
      setEmployees(data.map(formatEmployee));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!storeId) return;
    refreshEmployees();

    fetchServicesByStore(storeId)
      .then(setServices)
      .catch((err) => console.error(err));
  }, [storeId]);

  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingSkills, setEditingSkills] = useState([]);
  const [limitHours, setLimitHours] = useState(false);
  const [editingHours, setEditingHours] = useState(defaultWorkHours());
  const [payRate, setPayRate] = useState({ base_salary: "", commission_rate: "" });

  const openAdd = () => {
    setAdding(true);
    setEditing({
      name: "",
      role: "",
      phone: "",
      email: "",
      start: "",
      status: "พร้อมให้บริการ",
    });
    setEditingSkills([]);
    setLimitHours(false);
    setEditingHours(defaultWorkHours());
    setPayRate({ base_salary: "", commission_rate: "" });
  };

  const openEdit = async (emp) => {
    setAdding(false);
    setEditing({ ...emp });
    setEditingSkills([]);
    setLimitHours(false);
    setEditingHours(defaultWorkHours());
    setPayRate({
      base_salary: emp.base_salary ?? "",
      commission_rate: emp.commission_rate ?? "",
    });

    try {
      const [skillIds, hours] = await Promise.all([
        getEmployeeSkills(emp.id),
        getEmployeeWorkHours(emp.id),
      ]);
      setEditingSkills(skillIds || []);

      if (hours && hours.length > 0) {
        setLimitHours(true);
        setEditingHours(
          defaultWorkHours().map((d) => {
            const found = hours.find((h) => h.day_of_week === d.day_of_week);
            return found
              ? {
                  day_of_week: d.day_of_week,
                  start_time: found.start_time || d.start_time,
                  end_time: found.end_time || d.end_time,
                  is_working: !!found.is_working,
                }
              : { ...d, is_working: false };
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSkill = (serviceId) => {
    setEditingSkills((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const updateHourRow = (dayOfWeek, patch) => {
    setEditingHours((prev) =>
      prev.map((row) => (row.day_of_week === dayOfWeek ? { ...row, ...patch } : row))
    );
  };

  const handleSave = async () => {
    try {
      let employeeId = editing.id;

      if (adding) {
        const created = await createEmployee({
          fullname: editing.name,
          phone: editing.phone,
          email: editing.email,
          position: editing.role,
          store_id: storeId,
        });
        employeeId = created.employee_id;
      } else {
        await updateEmployee(editing.id, {
          fullname: editing.name,
          phone: editing.phone,
          email: editing.email,
          position: editing.role,
          store_id: storeId,
        });
      }

      if (employeeId) {
        await setEmployeeSkills(employeeId, editingSkills);
        await setEmployeeWorkHours(employeeId, { hours: limitHours ? editingHours : [] });
        await setEmployeePayRate(employeeId, {
          base_salary: payRate.base_salary === "" ? null : Number(payRate.base_salary),
          commission_rate: payRate.commission_rate === "" ? null : Number(payRate.commission_rate),
        });
      }

      setEditing(null);
      setAdding(false);

      await refreshEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const stats = useMemo(() => ({
    total: employees.length,
    available: employees.filter((e) => e.statusId === 1).length,
    working: employees.filter((e) => e.statusId === 2 || e.statusId === 3).length,
    leave: employees.filter((e) => e.statusId === 4).length,
    absent: employees.filter((e) => e.statusId === 5).length,
  }), [employees]);

  const handleCreateAccount = async (emp) => {
    const { value: formValues } = await Swal.fire({
      title: `สร้างบัญชีเข้าสู่ระบบให้ ${emp.name}`,
      html:
        `<label style="display:block;text-align:left;font-size:0.85rem;margin-bottom:4px;">ชื่อผู้ใช้</label>` +
        `<input id="swal-acc-username" class="swal2-input" placeholder="เช่น เบอร์โทร หรือชื่อผู้ใช้">` +
        `<label style="display:block;text-align:left;font-size:0.85rem;margin:8px 0 4px;">รหัสผ่านเริ่มต้น</label>` +
        `<input id="swal-acc-password" type="text" class="swal2-input" placeholder="ตั้งรหัสผ่านให้ช่างคนนี้">`,
      showCancelButton: true,
      confirmButtonText: "สร้างบัญชี",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        const username = document.getElementById("swal-acc-username").value.trim();
        const password = document.getElementById("swal-acc-password").value.trim();
        if (!username || !password) {
          Swal.showValidationMessage("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
          return false;
        }
        return { username, password };
      },
    });
    if (!formValues) return;

    try {
      await createEmployeeAccount(emp.id, formValues);
      await Swal.fire(
        "สร้างบัญชีสำเร็จ",
        `แจ้งช่างให้เข้าสู่ระบบด้วยเบอร์โทร/อีเมลของช่างเอง และรหัสผ่านที่ตั้งไว้ (${formValues.password})`,
        "success"
      );
      await refreshEmployees();
    } catch (err) {
      Swal.fire("สร้างบัญชีไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const handleStatusChange = async (emp, statusId) => {
    const prevEmployees = employees;
    setEmployees((prev) =>
      prev.map((x) => (x.id === emp.id ? { ...x, statusId, status: STATUS_LABELS[statusId] } : x))
    );
    try {
      await updateEmployeeStatus(emp.id, { status_employee_id: statusId, changed_by: "admin" });
    } catch (err) {
      console.error(err);
      setEmployees(prevEmployees);
    }
  };

  return (
    <>
      <section className="manage manage-employees-page">
        <div className="header">
          <div>
            <h1>จัดการพนักงาน</h1>
            <p>จัดการข้อมูลพนักงานทั้งหมด</p>
          </div>
          <div className="header-actions">
            <button className="btn-export">
              <FiDownload /> ส่งออก CSV
            </button>
            <button className="btn-add" onClick={openAdd}>
              + เพิ่มพนักงานใหม่
            </button>
          </div>
        </div>

        <div className="employee-stats-bar">
          <div className="stat-pill">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">พนักงานทั้งหมด</span>
          </div>
          <div className="stat-pill available">
            <span className="stat-value">{stats.available}</span>
            <span className="stat-label">พร้อมให้บริการ</span>
          </div>
          <div className="stat-pill working">
            <span className="stat-value">{stats.working}</span>
            <span className="stat-label">กำลังทำงาน/พัก</span>
          </div>
          <div className="stat-pill leave">
            <span className="stat-value">{stats.leave}</span>
            <span className="stat-label">ลา</span>
          </div>
          <div className="stat-pill absent">
            <span className="stat-value">{stats.absent}</span>
            <span className="stat-label">ไม่มาทำงาน</span>
          </div>
        </div>

        <div className="service-card">
          <div className="toolbar">
            <div className="search-box">
              <FiSearch className="icon" />
              <input
                type="text"
                placeholder="ค้นหาพนักงาน..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <table className="service-table">
            <thead>
              <tr>
                <th>รูปภาพ</th>
                <th>ชื่อพนักงาน</th>
                <th>ตำแหน่ง</th>
                <th>เบอร์โทรศัพท์</th>
                <th>อีเมล</th>
                <th>วันที่เริ่มงาน</th>
                <th>สถานะ</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {employees
                .filter((e) => e.name.includes(search))
                .map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div
                        className="avatar"
                        style={{
                          background: avatarColorFromString(e.name).bg,
                          color: avatarColorFromString(e.name).text,
                        }}
                      >
                        {e.name[0]}
                      </div>
                    </td>
                    <td>{e.name}</td>
                    <td>{e.role}</td>
                    <td>{e.phone}</td>
                    <td>{e.email}</td>
                    <td>{e.start}</td>
                    <td>
                      <span className={`status ${e.statusId === 1 || e.statusId === 2 ? "open" : "closed"}`}>
                        {e.status}
                      </span>
                      {(e.statusId === 4 || e.statusId === 5) ? null : (
                        <select
                          className="status-select"
                          value={e.statusId}
                          onChange={(ev) => handleStatusChange(e, Number(ev.target.value))}
                        >
                          {QUICK_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <button className="icon-btn edit" onClick={() => openEdit(e)}>
                        <FiEdit2 />
                      </button>
                      {!e.hasAccount && (
                        <button
                          className="icon-btn"
                          title="สร้างบัญชีเข้าสู่ระบบ"
                          onClick={() => handleCreateAccount(e)}
                        >
                          <FiKey />
                        </button>
                      )}
                      <button className="icon-btn delete" onClick={() => setConfirmDelete(e)}>
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== Modal แก้ไข / เพิ่ม ===== */}
      {editing &&
        ReactDOM.createPortal(
          <div className="modal-overlay" onClick={() => setEditing(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>{adding ? "เพิ่มพนักงานใหม่" : "แก้ไขข้อมูลพนักงาน"}</h3>

              <label>ชื่อพนักงาน</label>
              <input
                type="text"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />

              <label>ตำแหน่ง</label>
              <input
                type="text"
                value={editing.role}
                onChange={(e) => setEditing({ ...editing, role: e.target.value })}
              />

              <label>เบอร์โทรศัพท์</label>
              <input
                type="text"
                value={editing.phone}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
              />

              <label>อีเมล</label>
              <input
                type="email"
                value={editing.email}
                onChange={(e) => setEditing({ ...editing, email: e.target.value })}
              />

              <label>วันที่เริ่มงาน</label>
              <input
                type="text"
                value={editing.start}
                onChange={(e) => setEditing({ ...editing, start: e.target.value })}
              />

              <div className="modal-section-title">บริการที่ทำได้ (ทักษะ)</div>
              <div className="skill-checklist">
                {services.map((s) => (
                  <label key={s.service_id}>
                    <input
                      type="checkbox"
                      checked={editingSkills.includes(s.service_id)}
                      onChange={() => toggleSkill(s.service_id)}
                    />
                    {s.service_name}
                  </label>
                ))}
                {services.length === 0 && <span style={{ color: "#999" }}>ไม่มีบริการในร้านนี้</span>}
              </div>

              <div className="modal-section-title">เวลาทำงาน</div>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="checkbox"
                  checked={limitHours}
                  onChange={(e) => setLimitHours(e.target.checked)}
                />
                จำกัดวัน/เวลาทำงาน (ถ้าไม่ติ๊ก จะถือว่าทำงานได้ทุกวันไม่จำกัดเวลา)
              </label>
              {limitHours &&
                editingHours.map((row, idx) => (
                  <div className="work-hours-row" key={row.day_of_week}>
                    <span className="day-label">{DAY_LABELS[idx]}</span>
                    <input
                      type="checkbox"
                      checked={row.is_working}
                      onChange={(e) => updateHourRow(row.day_of_week, { is_working: e.target.checked })}
                    />
                    <input
                      type="time"
                      value={row.start_time}
                      disabled={!row.is_working}
                      onChange={(e) => updateHourRow(row.day_of_week, { start_time: e.target.value })}
                    />
                    -
                    <input
                      type="time"
                      value={row.end_time}
                      disabled={!row.is_working}
                      onChange={(e) => updateHourRow(row.day_of_week, { end_time: e.target.value })}
                    />
                  </div>
                ))}

              <div className="modal-section-title">อัตราค่าจ้าง</div>
              <label>เงินเดือนฐาน (บาท/เดือน, เว้นว่างได้ถ้าไม่มี)</label>
              <input
                type="number"
                min="0"
                value={payRate.base_salary}
                onChange={(e) => setPayRate({ ...payRate, base_salary: e.target.value })}
              />
              <label>ค่าคอมมิชชั่น (% จากยอดบริการที่ทำสำเร็จ, เว้นว่างได้ถ้าไม่มี)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={payRate.commission_rate}
                onChange={(e) => setPayRate({ ...payRate, commission_rate: e.target.value })}
              />

              <div className="modal-actions">
                <button onClick={() => setEditing(null)} className="cancel-btn">
                  ยกเลิก
                </button>
                <button onClick={handleSave} className="save-btn">
                  บันทึก
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ===== Modal ยืนยันลบ ===== */}
      {confirmDelete &&
        ReactDOM.createPortal(
          <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
            <div className="modal small" onClick={(e) => e.stopPropagation()}>
              <h4>ยืนยันการลบ</h4>
              <p>ต้องการลบ “{confirmDelete.name}” หรือไม่? ถ้าพนักงานคนนี้มีบัญชีเข้าสู่ระบบอยู่ บัญชีจะถูกเปลี่ยนกลับเป็นผู้ใช้ทั่วไปทันที</p>
              <div className="modal-actions">
                <button onClick={() => setConfirmDelete(null)} className="cancel-btn">
                  ยกเลิก
                </button>
                <button
                  onClick={async () => {
                    try {
                      await deleteEmployee(confirmDelete.id);
                      setEmployees((prev) => prev.filter((x) => x.id !== confirmDelete.id));
                      setConfirmDelete(null);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="delete-btn"
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
