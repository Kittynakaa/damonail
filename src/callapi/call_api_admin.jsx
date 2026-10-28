import axios from "axios";
import { authHeader } from "./auth";

const api = "http://localhost:5010";

export async function getDashboardSummary() {
  const res = await axios.get(`${api}/admin/dashboard`, { headers: authHeader() });
  return res.data;
}

// ---------- Stores ----------
export async function getStoresAdmin(statusStoreId) {
  const res = await axios.get(`${api}/admin/stores`, {
    params: statusStoreId ? { status_store_id: statusStoreId } : {},
    headers: authHeader(),
  });
  return res.data;
}

export async function approveStore(storeId) {
  const res = await axios.put(`${api}/admin/stores/${storeId}/approve`, {}, { headers: authHeader() });
  return res.data;
}

export async function rejectStore(storeId, reason) {
  const res = await axios.put(`${api}/admin/stores/${storeId}/reject`, { reason }, { headers: authHeader() });
  return res.data;
}

export async function setStoreNote(storeId, note) {
  const res = await axios.put(`${api}/admin/stores/${storeId}/note`, { note }, { headers: authHeader() });
  return res.data;
}

export async function notifyStore(storeId, title, message) {
  const res = await axios.post(`${api}/admin/stores/${storeId}/notify`, { title, message }, { headers: authHeader() });
  return res.data;
}

// ---------- Users ----------
export async function getUsersAdmin() {
  const res = await axios.get(`${api}/admin/users`, { headers: authHeader() });
  return res.data;
}

export async function banUser(userId, reason) {
  const res = await axios.put(`${api}/admin/users/${userId}/ban`, { reason }, { headers: authHeader() });
  return res.data;
}

export async function unbanUser(userId) {
  const res = await axios.put(`${api}/admin/users/${userId}/unban`, {}, { headers: authHeader() });
  return res.data;
}

export async function notifyUser(userId, title, message) {
  const res = await axios.post(`${api}/admin/users/${userId}/notify`, { title, message }, { headers: authHeader() });
  return res.data;
}

// ---------- Customer profile ----------
export async function getUserProfileAdmin(userId) {
  const res = await axios.get(`${api}/admin/users/${userId}/profile`, { headers: authHeader() });
  return res.data;
}

export async function updateUserProfileAdmin(userId, data) {
  const res = await axios.put(`${api}/admin/users/${userId}/profile`, data, { headers: authHeader() });
  return res.data;
}

export async function getUserBookingsAdmin(userId) {
  const res = await axios.get(`${api}/admin/users/${userId}/bookings`, { headers: authHeader() });
  return res.data;
}

// ---------- Activity ----------
export async function getPlatformActivity() {
  const res = await axios.get(`${api}/admin/activity`, { headers: authHeader() });
  return res.data;
}

export async function getActivityDetail(bookingId) {
  const res = await axios.get(`${api}/admin/activity/${bookingId}`, { headers: authHeader() });
  return res.data;
}

// ---------- Permissions ----------
export async function getRoles() {
  const res = await axios.get(`${api}/admin/roles`, { headers: authHeader() });
  return res.data;
}

export async function getPermissions() {
  const res = await axios.get(`${api}/admin/permissions`, { headers: authHeader() });
  return res.data;
}

export async function getRolePermissions() {
  const res = await axios.get(`${api}/admin/role-permissions`, { headers: authHeader() });
  return res.data;
}

export async function assignPermission(roleId, permissionId) {
  const res = await axios.post(`${api}/admin/role-permissions`, { role_id: roleId, permission_id: permissionId }, { headers: authHeader() });
  return res.data;
}

export async function revokePermission(rolePermissionId) {
  const res = await axios.delete(`${api}/admin/role-permissions/${rolePermissionId}`, { headers: authHeader() });
  return res.data;
}

// ---------- Finance ----------
export async function getPlatformFinance(year, month) {
  const res = await axios.get(`${api}/admin/finance`, { params: { year, month }, headers: authHeader() });
  return res.data;
}

// ---------- Reviews ----------
export async function getReviewsAdmin(onlyHidden) {
  const res = await axios.get(`${api}/admin/reviews`, {
    params: onlyHidden ? { only_hidden: 1 } : {},
    headers: authHeader(),
  });
  return res.data;
}

export async function hideReview(reviewId, reason) {
  const res = await axios.put(`${api}/admin/reviews/${reviewId}/hide`, { reason }, { headers: authHeader() });
  return res.data;
}

export async function unhideReview(reviewId) {
  const res = await axios.put(`${api}/admin/reviews/${reviewId}/unhide`, {}, { headers: authHeader() });
  return res.data;
}
