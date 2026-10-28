import React, { useEffect, useState } from "react";
import { getPlatformFinance } from "../callapi/call_api_admin.jsx";
import Pagination from "./Pagination.jsx";
import "./SysAdmin.css";

const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const thb = (n) => "฿" + Number(n || 0).toLocaleString();
const PAGE_SIZE = 10;

export default function SysAdminFinance() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);
    getPlatformFinance(year, month)
      .then(setData)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [year, month]);

  const byStore = data?.by_store || [];
  const totalPages = Math.max(1, Math.ceil(byStore.length / PAGE_SIZE));
  const visibleByStore = byStore.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <section className="sysadmin-page">
      <div className="sysadmin-page-header">
        <div>
          <h1>การเงิน</h1>
          <p>ตรวจสอบยอดเงินและรายงานรายได้รวมของแพลตฟอร์ม</p>
        </div>
        <div className="sysadmin-header-actions">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {THAI_MONTHS.map((m, idx) => <option key={idx} value={idx + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[0, 1, 2].map((i) => {
              const y = now.getFullYear() - i;
              return <option key={y} value={y}>{y + 543}</option>;
            })}
          </select>
        </div>
      </div>

      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <>
          <div className="sysadmin-stats-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            <div className="sysadmin-card">
              <p className="sysadmin-card-label">รายได้รวมของงวดนี้</p>
              <h2>{thb(data?.total_revenue)}</h2>
            </div>
            <div className="sysadmin-card">
              <p className="sysadmin-card-label">จำนวนคิวที่สำเร็จ</p>
              <h2>{data?.total_bookings ?? 0}</h2>
            </div>
          </div>

          <div className="sysadmin-table-wrap">
            <p className="sysadmin-card-label" style={{ marginBottom: 12 }}>รายได้แยกตามร้าน</p>
            {byStore.length === 0 ? (
              <div className="sysadmin-empty">ไม่มีข้อมูล</div>
            ) : (
              <table className="sysadmin-table">
                <thead>
                  <tr>
                    <th>ร้าน</th>
                    <th>รายได้</th>
                    <th>จำนวนคิว</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleByStore.map((s) => (
                    <tr key={s.store_id}>
                      <td>{s.store_name}</td>
                      <td>{thb(s.revenue)}</td>
                      <td>{s.booking_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </>
      )}
    </section>
  );
}
