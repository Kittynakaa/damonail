import axios from "axios";
import { authHeader } from "./auth";

let api = "http://localhost:5010";

/* =========================================================
   GET NOTIFICATIONS (ของผู้ใช้ปัจจุบัน)
========================================================= */
export async function getNotifications() {
  const res = await axios.get(`${api}/notifications`, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   GET UNREAD COUNT
========================================================= */
export async function getUnreadCount() {
  const res = await axios.get(`${api}/notifications/unread-count`, { headers: authHeader() });
  return res.data.unread_count;
}

/* =========================================================
   MARK ONE AS READ
========================================================= */
export async function markNotificationRead(notificationId) {
  const res = await axios.put(`${api}/notifications/${notificationId}/read`, {}, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   MARK ALL AS READ
========================================================= */
export async function markAllNotificationsRead() {
  const res = await axios.put(`${api}/notifications/read-all`, {}, { headers: authHeader() });
  return res.data;
}
