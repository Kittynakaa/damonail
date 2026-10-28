import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ScheduleBoard from "../components/ScheduleBoard";
import { getStoredUser } from "../callapi/auth";
import { getEmployeeWorkHours, setEmployeeWorkHours } from "../callapi/call_api_employee";
import "../ManageEmployees.css";
import "./StaffSchedule.css";

const DAY_LABELS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสฯ", "ศุกร์", "เสาร์", "อาทิตย์"];

function defaultWorkHours() {
  return [1, 2, 3, 4, 5, 6, 7].map((d) => ({
    day_of_week: d,
    start_time: "09:00",
    end_time: "18:00",
    is_working: d !== 7,
  }));
}

export default function StaffSchedule() {
  const user = getStoredUser();
  const employeeId = user?.employee_id;
  const storeId = user?.employee_store_id;

  const [limitHours, setLimitHours] = useState(false);
  const [editingHours, setEditingHours] = useState(defaultWorkHours());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    getEmployeeWorkHours(employeeId)
      .then((hours) => {
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
      })
      .catch((err) => console.error(err));
  }, [employeeId]);

  const updateHourRow = (dayOfWeek, patch) => {
    setEditingHours((prev) =>
      prev.map((row) => (row.day_of_week === dayOfWeek ? { ...row, ...patch } : row))
    );
  };

  const handleSaveHours = async () => {
    if (!employeeId) return;
    setSaving(true);
    try {
      await setEmployeeWorkHours(employeeId, { hours: limitHours ? editingHours : [] });
      Swal.fire({ icon: "success", title: "บันทึกเวลาทำงานแล้ว", toast: true, position: "top-end", timer: 1600, showConfirmButton: false });
    } catch (err) {
      Swal.fire("บันทึกไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="staff-schedule-page">
      <ScheduleBoard mode="employee" storeId={storeId} embedded />

      <div className="staff-workhours-card">
        <h3>เวลาทำงานของฉัน</h3>
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

        <button className="staff-workhours-save" onClick={handleSaveHours} disabled={saving}>
          {saving ? "กำลังบันทึก..." : "บันทึกเวลาทำงาน"}
        </button>
      </div>
    </section>
  );
}
