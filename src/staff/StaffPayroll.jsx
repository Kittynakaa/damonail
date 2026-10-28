import React, { useCallback, useEffect, useState } from "react";
import "../ManagePayroll.css";
import "./StaffPayroll.css";
import { getEmployeePayroll, getEmployeePayrollHistory } from "../callapi/call_api_payroll";
import { getStoredUser } from "../callapi/auth";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const thb = (n) => "฿" + Number(n || 0).toLocaleString();

export default function StaffPayroll() {
  const user = getStoredUser();
  const employeeId = user?.employee_id;
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [record, setRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPayroll = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const data = await getEmployeePayroll(employeeId, year, month);
      setRecord(data);
    } catch (err) {
      console.error(err);
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [employeeId, year, month]);

  useEffect(() => {
    loadPayroll();
  }, [loadPayroll]);

  useEffect(() => {
    if (!employeeId) return;
    getEmployeePayrollHistory(employeeId)
      .then(setHistory)
      .catch((err) => console.error(err));
  }, [employeeId]);

  return (
    <section className="manage manage-payroll-page">
      <div className="header">
        <div>
          <h1>เงินเดือนของฉัน</h1>
          <p>ดูยอดเงินเดือนโดยประมาณของงวดนี้และประวัติย้อนหลัง (ดูได้อย่างเดียว)</p>
        </div>
        <div className="header-actions">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {THAI_MONTHS.map((m, idx) => (
              <option key={idx} value={idx + 1}>{m}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[0, 1, 2].map((i) => {
              const y = now.getFullYear() - i;
              return <option key={y} value={y}>{y + 543}</option>;
            })}
          </select>
        </div>
      </div>

      <div className="service-card">
        {loading && <p>กำลังโหลด...</p>}

        {!loading && !record && <p>ไม่มีข้อมูลเงินเดือนของงวดนี้</p>}

        {!loading && record && (
          <>
            <div className="staff-payroll-summary">
              <div>
                <p className="staff-card-label">สถานะ</p>
                <span className={`status ${record.status === "CONFIRMED" ? "open" : "closed"}`}>
                  {record.status === "CONFIRMED" ? "ยืนยันแล้ว" : "รอยืนยัน"}
                </span>
              </div>
              <div>
                <p className="staff-card-label">วันทำงาน</p>
                <h2>{record.work_days}</h2>
              </div>
              <div>
                <p className="staff-card-label">วันลา</p>
                <h2>{record.leave_days}</h2>
              </div>
              <div>
                <p className="staff-card-label">วันขาดงาน</p>
                <h2>{record.absent_days}</h2>
              </div>
              <div>
                <p className="staff-card-label">เงินเดือนฐาน</p>
                <h2>{thb(record.base_salary)}</h2>
              </div>
              <div>
                <p className="staff-card-label">คอมมิชชั่น</p>
                <h2>{thb(record.commission_amount)}</h2>
              </div>
            </div>

            <div className="payroll-total-bar">
              ยอดรวมโดยประมาณของงวดนี้: <strong>{thb(record.total_amount)}</strong>
            </div>
          </>
        )}
      </div>

      <div className="service-card" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>ประวัติเงินเดือน</h3>
        {history.length === 0 ? (
          <p>ยังไม่มีประวัติเงินเดือน</p>
        ) : (
          <table className="service-table">
            <thead>
              <tr>
                <th>งวด</th>
                <th>วันทำงาน</th>
                <th>ลา</th>
                <th>ขาดงาน</th>
                <th>เงินเดือนฐาน</th>
                <th>คอมมิชชั่น</th>
                <th>ยอดรวม</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r) => (
                <tr key={r.payroll_id}>
                  <td>{THAI_MONTHS[r.period_month - 1]} {r.period_year + 543}</td>
                  <td>{r.work_days}</td>
                  <td>{r.leave_days}</td>
                  <td>{r.absent_days}</td>
                  <td>{thb(r.base_salary)}</td>
                  <td>{thb(r.commission_amount)}</td>
                  <td>{thb(r.total_amount)}</td>
                  <td>
                    <span className={`status ${r.status === "CONFIRMED" ? "open" : "closed"}`}>
                      {r.status === "CONFIRMED" ? "ยืนยันแล้ว" : "รอยืนยัน"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
