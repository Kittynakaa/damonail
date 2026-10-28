import axios from "axios";
import { authHeader } from "./auth";

const api = "http://localhost:5010";

// ฉบับสาธารณะ (ไม่ต้อง login) -- ใช้กับหน้าจองของลูกค้าให้เลือกช่างได้
export async function getEmployeeByStore(storeId) {
  const res = await axios.get(`${api}/employees/store/${storeId}/public`);
  return res.data;
}


export async function getEmployeesByStore(storeId) {
  const response = await axios.get(
    `${api}/employees/store/${storeId}`,  // ต้องมี s หน้า employees
    { headers: authHeader() }
  );
  return response.data;
}


export async function createEmployee(data) {
  const response = await axios.post(`${api}/employees`, data, { headers: authHeader() });
  return response.data;
}

export async function updateEmployee(id, data) {
  const response = await axios.put(`${api}/employees/${id}`, data, { headers: authHeader() });
  return response.data;
}

export async function deleteEmployee(id) {
  const response = await axios.delete(`${api}/employees/${id}`, { headers: authHeader() });
  return response.data;
}

/* =========================================================
   สร้างบัญชีเข้าสู่ระบบให้ช่างคนนี้ (ผูก employee.user_id)
   POST /employees/:id/account
========================================================= */
export async function createEmployeeAccount(employeeId, payload) {
  const res = await axios.post(`${api}/employees/${employeeId}/account`, payload, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   สถานะพนักงานวันนี้ / ลา / ขาดงาน / เวลาทำงาน / ทักษะ
========================================================= */
export async function getEmployeeDayStatus(storeId, date) {
  const res = await axios.get(`${api}/employees/store/${storeId}/day-status`, { params: { date }, headers: authHeader() });
  return res.data;
}

export async function getEmployeeStatusToday(storeId) {
  const res = await axios.get(`${api}/employees/store/${storeId}/status-today`, { headers: authHeader() });
  return res.data;
}

export async function updateEmployeeStatus(employeeId, payload) {
  const res = await axios.put(`${api}/employees/${employeeId}/status`, payload, { headers: authHeader() });
  return res.data;
}

export async function setEmployeeAbsent(employeeId, payload) {
  const res = await axios.post(`${api}/employees/${employeeId}/absent`, payload, { headers: authHeader() });
  return res.data;
}

export async function createEmployeeLeave(employeeId, payload) {
  const res = await axios.post(`${api}/employees/${employeeId}/leave`, payload, { headers: authHeader() });
  return res.data;
}

export async function getEmployeeLeaves(employeeId, params = {}) {
  const res = await axios.get(`${api}/employees/${employeeId}/leaves`, { params, headers: authHeader() });
  return res.data;
}

export async function cancelEmployeeLeave(employeeId, absenceId) {
  const res = await axios.delete(`${api}/employees/${employeeId}/leave/${absenceId}`, { headers: authHeader() });
  return res.data;
}

export async function getPendingLeaves(storeId) {
  const res = await axios.get(`${api}/employees/store/${storeId}/leave/pending`, { headers: authHeader() });
  return res.data;
}

export async function approveEmployeeLeave(employeeId, absenceId, approvedBy) {
  const res = await axios.post(`${api}/employees/${employeeId}/leave/${absenceId}/approve`, {
    approved_by: approvedBy,
  }, { headers: authHeader() });
  return res.data;
}

export async function rejectEmployeeLeave(employeeId, absenceId, rejectedBy) {
  const res = await axios.post(`${api}/employees/${employeeId}/leave/${absenceId}/reject`, {
    rejected_by: rejectedBy,
  }, { headers: authHeader() });
  return res.data;
}

export async function getEmployeeWorkHours(employeeId) {
  const res = await axios.get(`${api}/employees/${employeeId}/work-hours`, { headers: authHeader() });
  return res.data;
}

export async function setEmployeeWorkHours(employeeId, payload) {
  const res = await axios.put(`${api}/employees/${employeeId}/work-hours`, payload, { headers: authHeader() });
  return res.data;
}

export async function getEmployeeSkills(employeeId) {
  const res = await axios.get(`${api}/employees/${employeeId}/skills`, { headers: authHeader() });
  return res.data;
}

export async function setEmployeeSkills(employeeId, serviceIds) {
  const res = await axios.put(`${api}/employees/${employeeId}/skills`, { service_ids: serviceIds }, { headers: authHeader() });
  return res.data;
}

export async function getAvailableStaff(storeId, params) {
  const res = await axios.get(`${api}/employees/store/${storeId}/available`, { params, headers: authHeader() });
  return res.data;
}

export async function getEmployeeAvailability(employeeId, params) {
  const res = await axios.get(`${api}/employees/${employeeId}/availability`, { params, headers: authHeader() });
  return res.data;
}

export async function setEmployeePayRate(employeeId, payload) {
  const res = await axios.put(`${api}/employees/${employeeId}/pay-rate`, payload, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   จำนวนคิวต่อวันในเดือนนั้น (สำหรับจุด indicator บนปฏิทิน)
   GET /schedule/:storeId/month/:year/:month/summary
========================================================= */
export async function getScheduleMonthSummary(storeId, year, month) {
  const res = await axios.get(`${api}/schedule/${storeId}/month/${year}/${month}/summary`, { headers: authHeader() });
  return res.data;
}
