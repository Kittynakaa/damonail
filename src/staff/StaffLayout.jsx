import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import NotificationBell from "../components/NotificationBell";
import { getStoredUser } from "../callapi/auth";
import "./StaffLayout.css";

export default function StaffLayout() {
  const navigate = useNavigate();
  const user = getStoredUser();

  return (
    <div className="staff-root">
      <aside className="staff-sidebar">
        <div className="staff-logo staff-logo-row">
          <span>{user?.username || "พนักงาน"}</span>
          <NotificationBell linkTo="/MySchedule/bookings" align="left" />
        </div>

        <nav className="staff-menu">
          <NavLink to="/MySchedule" end>แดชบอร์ด</NavLink>
          <NavLink to="/MySchedule/bookings">จัดการการจอง</NavLink>
          <NavLink to="/MySchedule/leave">ขอลาหยุด</NavLink>
          <NavLink to="/MySchedule/schedule">ตารางงาน</NavLink>
          <NavLink to="/MySchedule/payroll">เงินเดือน</NavLink>
        </nav>

        <button className="staff-exit-btn" onClick={() => navigate("/")}>
          <FiHome /> กลับไปหน้าหลัก
        </button>
      </aside>

      <main className="staff-content">
        <Outlet />
      </main>
    </div>
  );
}
