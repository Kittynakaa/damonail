import React, { useEffect, useState } from "react";
import { getDashboardSummary } from "../callapi/call_api_admin.jsx";
import { getStatusMeta } from "../utils/bookingStatus.js";
import { getStoredUser } from "../callapi/auth";
import "./SysAdmin.css";

const thb = (n) => "฿" + Number(n || 0).toLocaleString();

const BADGE_CLASS_BY_STATUS = {
  pending: "pending",
  confirmed: "active",
  done: "active",
  canceled: "banned",
  reschedule: "review",
};

export default function SysAdminDashboard() {
  const user = getStoredUser();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="sysadmin-page">
      <div className="sysadmin-page-header">
        <div>
          <h1>สวัสดี, {user?.username || "ผู้ดูแลระบบ"}</h1>
          <p>ภาพรวมของแพลตฟอร์มทั้งหมด</p>
        </div>
      </div>

      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <>
          <div className="sysadmin-stats-grid">
            <div className="sysadmin-card">
              <p className="sysadmin-card-label">ร้านทั้งหมด</p>
              <h2>{summary?.total_stores ?? 0}</h2>
            </div>
            <div className="sysadmin-card">
              <p className="sysadmin-card-label">ร้านรออนุมัติ</p>
              <h2>{summary?.pending_stores ?? 0}</h2>
            </div>
            <div className="sysadmin-card">
              <p className="sysadmin-card-label">ผู้ใช้ทั้งหมด</p>
              <h2>{summary?.total_users ?? 0}</h2>
            </div>
            <div className="sysadmin-card">
              <p className="sysadmin-card-label">คิววันนี้</p>
              <h2>{summary?.bookings_today ?? 0}</h2>
            </div>
          </div>

          <div className="sysadmin-stats-grid">
            <div className="sysadmin-card">
              <p className="sysadmin-card-label">รายได้วันนี้ (แพลตฟอร์ม)</p>
              <h2>{thb(summary?.revenue_today)}</h2>
            </div>
            <div className="sysadmin-card">
              <p className="sysadmin-card-label">รายได้เดือนนี้ (แพลตฟอร์ม)</p>
              <h2>{thb(summary?.revenue_month)}</h2>
            </div>
          </div>

          <div className="sysadmin-table-wrap">
            <p className="sysadmin-card-label" style={{ marginBottom: 12 }}>สรุปรายงานภาพรวม -- กิจกรรมล่าสุด</p>
            {(summary?.recent_activity || []).length === 0 ? (
              <div className="sysadmin-empty">ยังไม่มีกิจกรรม</div>
            ) : (
              <table className="sysadmin-table">
                <thead>
                  <tr>
                    <th>หมายเลขการจอง</th>
                    <th>ร้าน</th>
                    <th>ลูกค้า</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recent_activity.map((a) => {
                    const meta = getStatusMeta(a.status_booking_name);
                    return (
                      <tr key={a.booking_id}>
                        <td>{a.booking_id}</td>
                        <td>{a.store_name || "-"}</td>
                        <td>{a.customer_name}</td>
                        <td><span className={`sysadmin-badge ${BADGE_CLASS_BY_STATUS[meta.className] || "neutral"}`}>{meta.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </section>
  );
}
