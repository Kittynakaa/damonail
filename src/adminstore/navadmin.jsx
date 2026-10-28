import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useParams, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";
import NotificationBell from "../components/NotificationBell";
import "./navadmin.css";

export default function StoreLayout() {

    const { storeId } = useParams();
    const navigate = useNavigate();
    const [storeName, setStoreName] = useState("");

    useEffect(() => {
      if (!storeId) return;
      let active = true;
      axios
        .get(`http://localhost:5010/store/${storeId}`)
        .then((res) => {
          if (!active) return;
          const row = Array.isArray(res.data) ? res.data[0] : res.data;
          setStoreName(row?.store_name || "");
        })
        .catch((err) => console.error("Load store name error:", err));
      return () => {
        active = false;
      };
    }, [storeId]);

    return (
      <div className="admin-root">
        <aside className="sidebar">
          <div className="logo logo-row">
            <span>{storeName || "Crystal Shine"}</span>
            <NotificationBell linkTo={`/StoreDashboard/${storeId}/bookings`} align="left" />
          </div>

          <nav className="menu">
            <NavLink to={`/StoreDashboard/${storeId}`}>แดชบอร์ดร้าน</NavLink>
            <NavLink to={`/StoreDashboard/${storeId}/services`}>จัดการบริการ</NavLink>
            <NavLink to={`/StoreDashboard/${storeId}/schedule`}>ตารางพนักงาน</NavLink>
            <NavLink to={`/StoreDashboard/${storeId}/employees`}>จัดการพนักงาน</NavLink>
            <NavLink to={`/StoreDashboard/${storeId}/bookings`}>การจอง</NavLink>
            <NavLink to={`/StoreDashboard/${storeId}/payroll`}>เงินเดือน</NavLink>
            <NavLink to={`/StoreDashboard/${storeId}/reviews`}>รีวิวและคะแนน</NavLink>
           {/* <NavLink to={`/StoreDashboard/${storeId}/gallery`}>คลังรูปภาพร้าน</NavLink>
            <NavLink to={`/StoreDashboard/${storeId}/inventory`}>คลังอุปกรณ์ร้าน</NavLink> */}
            <NavLink to={`/StoreDashboard/${storeId}/promotions`}>โปรโมชั่นและแพ็กเกจ</NavLink>
            {/* <NavLink to={`/StoreDashboard/${storeId}/report`}>รายงานร้าน</NavLink> */}
            <NavLink to={`/StoreDashboard/${storeId}/settings`}>การตั้งค่าร้าน</NavLink>
          </nav>

          <button className="sidebar-exit-btn" onClick={() => navigate("/UserProfile")}>
            <FiLogOut /> ออกจากหน้าแดชบอร์ด
          </button>
        </aside>

        <main className="dashboard">
          <Outlet />
        </main>
      </div>
    );
  }