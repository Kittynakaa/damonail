import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getUserProfileAdmin,
  updateUserProfileAdmin,
  getUserBookingsAdmin,
} from "../callapi/call_api_admin.jsx";
import { getStatusMeta } from "../utils/bookingStatus.js";
import Pagination from "./Pagination.jsx";
import "./SysAdmin.css";

const PAGE_SIZE = 10;

export default function SysAdminCustomerProfile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [userIdInput, setUserIdInput] = useState(searchParams.get("userId") || "");
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ nickname: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadUser = async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const [profileData, bookingData] = await Promise.all([
        getUserProfileAdmin(userId),
        getUserBookingsAdmin(userId),
      ]);
      setProfile(profileData);
      setBookings(bookingData || []);
      setCurrentPage(1);
      setForm({
        nickname: profileData.nickname || "",
        phone: profileData.phone || "",
        email: profileData.email || "",
      });
    } catch (err) {
      console.error(err);
      Swal.fire("ไม่พบผู้ใช้", err.response?.data?.error || "ไม่พบผู้ใช้รายนี้", "warning");
      setProfile(null);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const idFromUrl = searchParams.get("userId");
    if (idFromUrl) loadUser(idFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!userIdInput) return;
    setSearchParams({ userId: userIdInput });
    loadUser(userIdInput);
  };

  const handleSave = async () => {
    try {
      await updateUserProfileAdmin(profile.user_id, form);
      await loadUser(profile.user_id);
      Swal.fire({ icon: "success", title: "บันทึกแล้ว", toast: true, position: "top-end", timer: 1600, showConfirmButton: false });
    } catch (err) {
      Swal.fire("บันทึกไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const totalPages = Math.max(1, Math.ceil(bookings.length / PAGE_SIZE));
  const visibleBookings = bookings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <section className="sysadmin-page">
      <div className="sysadmin-page-header">
        <div>
          <h1>โปรไฟล์ลูกค้า</h1>
          <p>ค้นหาและแก้ไขข้อมูลลูกค้า พร้อมดูประวัติการจอง</p>
        </div>
      </div>

      <div className="sysadmin-table-wrap" style={{ marginBottom: 20 }}>
        <form onSubmit={handleSearch} className="sysadmin-search-box" style={{ maxWidth: 320 }}>
          <input placeholder="กรอก user_id..." value={userIdInput} onChange={(e) => setUserIdInput(e.target.value)} />
          <button type="submit" className="sysadmin-btn primary">ค้นหา</button>
        </form>
      </div>

      {loading && <p>กำลังโหลด...</p>}

      {!loading && profile && (
        <>
          <div className="sysadmin-card" style={{ maxWidth: 480 }}>
            <p className="sysadmin-card-label">ชื่อผู้ใช้</p>
            <h2 style={{ fontSize: "1.1rem", marginBottom: 12 }}>{profile.username}</h2>

            <label style={{ fontSize: "0.85rem", color: "#8f7380" }}>ชื่อเล่น</label>
            <input
              style={{ width: "100%", border: "1px solid #f0d8e2", borderRadius: 10, padding: "8px 12px", margin: "4px 0 10px", boxSizing: "border-box" }}
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            />

            <label style={{ fontSize: "0.85rem", color: "#8f7380" }}>เบอร์โทร</label>
            <input
              style={{ width: "100%", border: "1px solid #f0d8e2", borderRadius: 10, padding: "8px 12px", margin: "4px 0 10px", boxSizing: "border-box" }}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <label style={{ fontSize: "0.85rem", color: "#8f7380" }}>อีเมล</label>
            <input
              style={{ width: "100%", border: "1px solid #f0d8e2", borderRadius: 10, padding: "8px 12px", margin: "4px 0 10px", boxSizing: "border-box" }}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <button className="sysadmin-btn primary" onClick={handleSave}>บันทึกการแก้ไข</button>
          </div>

          <div className="sysadmin-table-wrap" style={{ marginTop: 20 }}>
            <p className="sysadmin-card-label" style={{ marginBottom: 12 }}>ประวัติการจอง</p>
            {bookings.length === 0 ? (
              <div className="sysadmin-empty">ยังไม่มีประวัติการจอง</div>
            ) : (
              <table className="sysadmin-table">
                <thead>
                  <tr>
                    <th>หมายเลขการจอง</th>
                    <th>ร้าน</th>
                    <th>วันที่</th>
                    <th>บริการ</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBookings.map((b) => {
                    const meta = getStatusMeta(b.status_booking_name, b.cancelled_by);
                    return (
                      <tr key={b.booking_id}>
                        <td>{b.booking_id}</td>
                        <td>{b.store_name}</td>
                        <td>{b.booking_date} {b.booking_time}</td>
                        <td>{b.svc}</td>
                        <td><span className={`sysadmin-badge ${meta.className === "canceled" ? "banned" : meta.className === "confirmed" || meta.className === "done" ? "active" : "pending"}`}>{meta.label}</span></td>
                      </tr>
                    );
                  })}
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
