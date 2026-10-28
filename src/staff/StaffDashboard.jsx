import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiClock, FiSun } from "react-icons/fi";
import { getStoredUser } from "../callapi/auth";
import { getStoreBookings } from "../callapi/call_api_booking";
import { getEmployeeLeaves } from "../callapi/call_api_employee";
import { getStatusMeta } from "../utils/bookingStatus";
import "./StaffDashboard.css";

function parseDMY(value) {
  if (!value) return null;
  const [day, month, year] = String(value).split("/").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

function isToday(date) {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const storeId = user?.employee_store_id;
  const employeeId = user?.employee_id;

  const [bookings, setBookings] = useState([]);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    if (!storeId) return;
    getStoreBookings(storeId).then(setBookings).catch((err) => console.error(err));
  }, [storeId]);

  useEffect(() => {
    if (!employeeId) return;
    getEmployeeLeaves(employeeId).then(setLeaves).catch((err) => console.error(err));
  }, [employeeId]);

  const bookingsToday = bookings.filter((b) => isToday(parseDMY(b.booking_date)));
  const pendingCount = bookings.filter((b) => b.status_booking_id === 1).length;
  const pendingLeaveCount = leaves.filter((l) => l.status === "PENDING").length;

  return (
    <section className="staff-dashboard-page">
      <div className="staff-dash-header">
        <h1>สวัสดี, {user?.username || "พนักงาน"}</h1>
        <p>ภาพรวมงานของคุณวันนี้</p>
      </div>

      <div className="staff-stats-grid">
        <div className="staff-card">
          <p className="staff-card-label">คิววันนี้</p>
          <h2>{bookingsToday.length}</h2>
        </div>
        <div className="staff-card">
          <p className="staff-card-label">รอยืนยัน</p>
          <h2>{pendingCount}</h2>
        </div>
        <div className="staff-card">
          <p className="staff-card-label">คำขอลารออนุมัติ</p>
          <h2>{pendingLeaveCount}</h2>
        </div>
        <div className="staff-card">
          <p className="staff-card-label">คิวทั้งหมด</p>
          <h2>{bookings.length}</h2>
        </div>
      </div>

      <div className="staff-card staff-quicklinks">
        <p className="staff-card-label">ทางลัด</p>
        <div className="staff-quicklinks-row">
          <button onClick={() => navigate("/MySchedule/bookings")}>
            <FiCalendar /> จัดการการจอง
          </button>
          <button onClick={() => navigate("/MySchedule/leave")}>
            <FiSun /> ขอลาหยุด
          </button>
          <button onClick={() => navigate("/MySchedule/schedule")}>
            <FiClock /> ตารางงาน
          </button>
        </div>
      </div>

      <div className="staff-card">
        <p className="staff-card-label">คิวงานวันนี้</p>
        {bookingsToday.length === 0 ? (
          <p className="staff-empty">ไม่มีคิวงานวันนี้</p>
        ) : (
          <ul className="staff-today-list">
            {bookingsToday.map((b) => {
              const meta = getStatusMeta(b.status_booking_name, b.cancelled_by);
              return (
                <li key={b.booking_id}>
                  <span className="staff-today-time">{b.booking_time}</span>
                  <span className="staff-today-customer">{b.customer_name}</span>
                  <span className="staff-today-service">{b.services || "-"}</span>
                  <span className={`status ${meta.className}`}>{meta.label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
