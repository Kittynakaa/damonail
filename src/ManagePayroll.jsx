import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "./ManagePayroll.css";
import { getStorePayroll, confirmEmployeePayroll } from "./callapi/call_api_payroll";
import { getEmployeesByStore } from "./callapi/call_api_employee";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const thb = (n) => "฿" + Number(n || 0).toLocaleString();

export default function ManagePayroll() {
  const { storeId } = useParams();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [rows, setRows] = useState([]);
  const [employeeNames, setEmployeeNames] = useState({});
  const [editedTotals, setEditedTotals] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    getEmployeesByStore(storeId)
      .then((data) => {
        const map = {};
        data.forEach((e) => { map[e.employee_id] = e.fullname; });
        setEmployeeNames(map);
      })
      .catch((err) => console.error(err));
  }, [storeId]);

  const loadPayroll = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const data = await getStorePayroll(storeId, year, month);
      setRows(data);
      setEditedTotals({});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [storeId, year, month]);

  useEffect(() => {
    loadPayroll();
  }, [loadPayroll]);

  const confirmRow = async (row) => {
    const overrideTotal = editedTotals[row.employee_id];
    const confirm = await Swal.fire({
      title: `ยืนยันเงินเดือนของ ${employeeNames[row.employee_id] || row.employee_id}?`,
      text: `ยอดที่จะยืนยัน: ${thb(overrideTotal ?? row.total_amount)}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });
    if (!confirm.isConfirmed) return;

    try {
      await confirmEmployeePayroll(row.employee_id, {
        year,
        month,
        confirmed_by: "admin",
        total_amount: overrideTotal !== undefined ? Number(overrideTotal) : undefined,
      });
      await loadPayroll();
      Swal.fire("ยืนยันเงินเดือนแล้ว", "", "success");
    } catch (err) {
      Swal.fire("ยืนยันไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const totalPayout = rows.reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

  return (
    <section className="manage manage-payroll-page">
      <div className="header">
        <div>
          <h1>เงินเดือนพนักงาน</h1>
          <p>สรุปเงินเดือนรายเดือน (ระบบคำนวณร่างให้ Admin ตรวจสอบและยืนยันก่อนเสมอ)</p>
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

        <table className="service-table">
          <thead>
            <tr>
              <th>พนักงาน</th>
              <th>วันทำงาน</th>
              <th>ลา</th>
              <th>ขาดงาน</th>
              <th>เงินเดือนฐาน</th>
              <th>คอมมิชชั่น</th>
              <th>ยอดรวม</th>
              <th>สถานะ</th>
              <th>การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.employee_id}>
                <td>{employeeNames[r.employee_id] || r.employee_id}</td>
                <td>{r.work_days}</td>
                <td>{r.leave_days}</td>
                <td>{r.absent_days}</td>
                <td>{thb(r.base_salary)}</td>
                <td>{thb(r.commission_amount)}</td>
                <td>
                  {r.status === "CONFIRMED" ? (
                    thb(r.total_amount)
                  ) : (
                    <input
                      type="number"
                      className="payroll-total-input"
                      value={editedTotals[r.employee_id] ?? r.total_amount}
                      onChange={(e) =>
                        setEditedTotals({ ...editedTotals, [r.employee_id]: e.target.value })
                      }
                    />
                  )}
                </td>
                <td>
                  <span className={`status ${r.status === "CONFIRMED" ? "open" : "closed"}`}>
                    {r.status === "CONFIRMED" ? "ยืนยันแล้ว" : "รอยืนยัน"}
                  </span>
                </td>
                <td>
                  {r.status !== "CONFIRMED" && (
                    <button className="btn-add" onClick={() => confirmRow(r)}>
                      ยืนยัน
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", color: "#999" }}>
                  ไม่มีพนักงานในร้านนี้
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="payroll-total-bar">
          รวมยอดจ่ายทั้งหมดของงวดนี้: <strong>{thb(totalPayout)}</strong>
        </div>
      </div>
    </section>
  );
}
