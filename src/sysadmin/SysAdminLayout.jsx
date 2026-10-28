import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import NotificationBell from "../components/NotificationBell";
import { getStoredUser } from "../callapi/auth";
import "./SysAdmin.css";

const NAV_ITEMS = [
  { to: "/SysAdmin", label: "Dashboard", end: true },
  { to: "/SysAdmin/promotions", label: "จัดการโปรโมชั่น" },
  { to: "/SysAdmin/stores", label: "จัดการร้าน" },
  { to: "/SysAdmin/users", label: "ข้อมูลผู้ใช้" },
  { to: "/SysAdmin/customer-profile", label: "โปรไฟล์ลูกค้า" },
  { to: "/SysAdmin/activity", label: "กิจกรรมทั้งหมด" },
  { to: "/SysAdmin/permissions", label: "สิทธิ์และบัญชีผู้ใช้" },
  { to: "/SysAdmin/complaints", label: "ข้อร้องเรียน" },
  { to: "/SysAdmin/reviews", label: "รีวิว" },
  { to: "/SysAdmin/finance", label: "การเงิน" },
  { to: "/SysAdmin/content", label: "เนื้อหาหน้าเว็บ" },
];

export default function SysAdminLayout() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="sysadmin-root">
      <aside className="sysadmin-sidebar">
        <div className="sysadmin-logo sysadmin-logo-row">
          <span>{user?.username || "ผู้ดูแลระบบ"}</span>
          <NotificationBell linkTo="/SysAdmin" align="left" />
        </div>

        <nav className="sysadmin-menu">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="sysadmin-exit-btn" onClick={handleLogout}>
          <FiHome /> ออกจากระบบ
        </button>
      </aside>

      <main className="sysadmin-content">
        <Outlet />
      </main>
    </div>
  );
}
