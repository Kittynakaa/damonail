import React, { useEffect, useState } from "react";
import { getPlatformActivity, getActivityDetail } from "../callapi/call_api_admin.jsx";
import { getStatusMeta } from "../utils/bookingStatus.js";
import Pagination from "./Pagination.jsx";
import "./SysAdmin.css";

const thb = (n) => "฿" + Number(n || 0).toLocaleString();
const PAGE_SIZE = 10;

export default function SysAdminActivity() {
  const [activity, setActivity] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getPlatformActivity()
      .then(setActivity)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (bookingId) => {
    setDetailLoading(true);
    try {
      const rows = await getActivityDetail(bookingId);
      setDetail(rows?.[0] || null);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = activity.filter((a) =>
    (a.store_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
    String(a.booking_id).includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleActivity = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <section className="sysadmin-page">
      <div className="sysadmin-page-header">
        <div>
          <h1>กิจกรรมทั้งหมด</h1>
          <p>ดูการจองทั้งหมดบนแพลตฟอร์ม ตรวจสอบรายละเอียดรายคิวได้</p>
        </div>
      </div>

      <div className="sysadmin-table-wrap">
        <div className="sysadmin-search-box">
          <input
            placeholder="ค้นหาร้าน/ลูกค้า/หมายเลขการจอง..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {loading ? (
          <p>กำลังโหลด...</p>
        ) : filtered.length === 0 ? (
          <div className="sysadmin-empty">ไม่มีกิจกรรม</div>
        ) : (
          <table className="sysadmin-table">
            <thead>
              <tr>
                <th>หมายเลขการจอง</th>
                <th>ร้าน</th>
                <th>ลูกค้า</th>
                <th>ช่าง</th>
                <th>วันที่</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleActivity.map((a) => {
                const meta = getStatusMeta(a.status_booking_name);
                return (
                  <tr key={a.booking_id}>
                    <td>{a.booking_id}</td>
                    <td>{a.store_name || "-"}</td>
                    <td>{a.customer_name}</td>
                    <td>{a.employee_name || "-"}</td>
                    <td>{a.booking_date} {a.booking_time}</td>
                    <td><span className={`sysadmin-badge ${meta.className === "canceled" ? "banned" : meta.className === "pending" ? "pending" : "active"}`}>{meta.label}</span></td>
                    <td><button className="sysadmin-btn" onClick={() => openDetail(a.booking_id)}>ดูรายละเอียด</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {(detail || detailLoading) && (
        <div className="sysadmin-modal-overlay" onClick={() => setDetail(null)}>
          <div className="sysadmin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>รายละเอียดการจอง</h3>
            {detailLoading ? (
              <p>กำลังโหลด...</p>
            ) : (
              <>
                <div className="sysadmin-detail-row"><span>หมายเลขการจอง</span><span>{detail.booking_id}</span></div>
                <div className="sysadmin-detail-row"><span>ร้าน</span><span>{detail.store_name}</span></div>
                <div className="sysadmin-detail-row"><span>ลูกค้า</span><span>{detail.customer_name}</span></div>
                <div className="sysadmin-detail-row"><span>เบอร์โทร</span><span>{detail.customer_phone}</span></div>
                <div className="sysadmin-detail-row"><span>ช่าง</span><span>{detail.employee_name || "-"}</span></div>
                <div className="sysadmin-detail-row"><span>บริการ</span><span>{detail.service_name}</span></div>
                <div className="sysadmin-detail-row"><span>วันที่/เวลา</span><span>{detail.booking_date_iso} {detail.booking_time}</span></div>
                <div className="sysadmin-detail-row"><span>ยอดรวม</span><span>{thb(detail.total_price)}</span></div>
                <div className="sysadmin-detail-row"><span>สถานะ</span><span>{detail.status_booking_name}</span></div>
                {detail.cancelled_by && (
                  <div className="sysadmin-detail-row"><span>ยกเลิกโดย</span><span>{detail.cancelled_by === "store" ? "ร้าน" : "ลูกค้า"}</span></div>
                )}
              </>
            )}
            <div className="sysadmin-modal-actions">
              <button className="sysadmin-btn" onClick={() => setDetail(null)}>ปิด</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
