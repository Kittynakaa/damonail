import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactDOM from "react-dom";
import { FiBell } from "react-icons/fi";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../callapi/call_api_notification";
import "./NotificationBell.css";

const POLL_INTERVAL_MS = 30000;

function timeAgo(dateLike) {
  const then = new Date(dateLike);
  if (Number.isNaN(then.getTime())) return "";
  const diffSec = Math.floor((Date.now() - then.getTime()) / 1000);
  if (diffSec < 60) return "เมื่อสักครู่";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} นาทีที่แล้ว`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(diffSec / 86400)} วันที่แล้ว`;
}

export default function NotificationBell({ linkTo = "/UserProfile", enabled = true, align = "right" }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownPos, setDropdownPos] = useState(null);
  const wrapRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const count = await getUnreadCount();
        if (!cancelled) setUnreadCount(count);
      } catch {
        // เงียบไว้ -- ไม่ต้องรบกวนผู้ใช้ถ้าดึงจำนวนไม่สำเร็จชั่วคราว
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [enabled]);

  useEffect(() => {
    function handleClickOutside(e) {
      const insideWrap = wrapRef.current && wrapRef.current.contains(e.target);
      const insideDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!insideWrap && !insideDropdown) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!enabled) return null;

  const toggleOpen = async () => {
    const next = !open;
    if (next && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth <= 480;
      if (isMobile) {
        setDropdownPos({ top: rect.bottom + 10, left: 12, right: 12, width: "auto" });
      } else if (align === "left") {
        setDropdownPos({ top: rect.bottom + 10, left: rect.left, right: undefined, width: undefined });
      } else {
        setDropdownPos({ top: rect.bottom + 10, right: window.innerWidth - rect.right, left: undefined, width: undefined });
      }
    }
    setOpen(next);
    if (next) {
      try {
        const rows = await getNotifications();
        setNotifications(rows);
      } catch (err) {
        console.error("โหลดการแจ้งเตือนผิดพลาด", err);
      }
    }
  };

  const handleItemClick = async (n) => {
    if (!n.is_read) {
      try {
        await markNotificationRead(n.notification_id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((x) => (x.notification_id === n.notification_id ? { ...x, is_read: 1 } : x))
        );
      } catch {
        // ไม่ต้อง block การนำทางถ้ามาร์คอ่านไม่สำเร็จ
      }
    }
    setOpen(false);
    if (n.booking_id) {
      sessionStorage.setItem("openBookingId", String(n.booking_id));
    }
    navigate(linkTo);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((x) => ({ ...x, is_read: 1 })));
    } catch {
      // เงียบไว้เช่นกัน
    }
  };

  return (
    <div className="notif-bell-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`notif-bell-btn ${open ? "active" : ""}`}
        onClick={toggleOpen}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="การแจ้งเตือน"
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && dropdownPos &&
        ReactDOM.createPortal(
          <div
            className="notif-dropdown"
            role="menu"
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              right: dropdownPos.right,
              width: dropdownPos.width,
            }}
          >
            <div className="notif-dropdown-header">
              <span>การแจ้งเตือน</span>
              {unreadCount > 0 && (
                <button type="button" className="notif-mark-all" onClick={handleMarkAllRead}>
                  อ่านทั้งหมด
                </button>
              )}
            </div>
            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="notif-empty">ยังไม่มีการแจ้งเตือน</div>
              ) : (
                notifications.map((n) => (
                  <button
                    type="button"
                    key={n.notification_id}
                    className={`notif-item ${n.is_read ? "" : "unread"}`}
                    onClick={() => handleItemClick(n)}
                  >
                    <span className="notif-item-title">{n.title}</span>
                    <span className="notif-item-message">{n.message}</span>
                    <span className="notif-item-time">{timeAgo(n.created_at)}</span>
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
