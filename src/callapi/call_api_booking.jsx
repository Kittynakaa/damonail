import axios from "axios";
import { authHeader } from "./auth";

let api = "http://localhost:5010";

/* =========================================================
   CREATE BOOKING  ✅ (อันที่ขาด)
   POST /booking
========================================================= */
export async function createBooking(payload) {
  try {
    const response = await axios.post(
      `${api}/booking`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("create booking:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

/* =========================================================
   UPDATE USER
========================================================= */
export async function updateUserById(userId, payload) {
  const res = await axios.put(
    `${api}/users/${userId}`,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
}

/* =========================================================
   GET USER BY ID
========================================================= */
export async function getUserById(userId) {
  try {
    const response = await axios.get(`${api}/users/${userId}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

/* =========================================================
   GET BOOKINGS
========================================================= */
export async function getBookings() {
  try {
    const response = await axios.get(`${api}/booking`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
/* =========================================================
   GET BOOKINGS Dashboard
========================================================= */

export async function getStoreBookings(storeId) {
  try {
    const response = await axios.get(
      `${api}/booking/store/${storeId}`,
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getAlerts(storeId) {
  const response = await axios.get(
    `${api}/booking/alerts/${storeId}`,
    { headers: authHeader() }
  );
  return response.data;
}




export async function getScheduleByDate(storeId, date) {
  const response = await axios.get(
    `http://localhost:5010/schedule/${storeId}/${date}`,
    { headers: authHeader() }
  );
  return response.data;
}

/* =========================================================
   UPDATE BOOKING (แก้ไข/เลื่อนเวลา -- ตรวจ eligibility ที่ backend)
   PUT /booking/:id
========================================================= */
export async function updateBooking(bookingId, payload) {
  const res = await axios.put(`${api}/booking/${bookingId}`, payload, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   UPDATE BOOKING STATUS
   PUT /bookings/:id/status
========================================================= */
export async function updateBookingStatus(bookingId, statusBookingId) {
  const res = await axios.put(`${api}/bookings/${bookingId}/status`, {
    status_booking_id: statusBookingId,
  }, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   DELETE BOOKING
========================================================= */
export async function deleteBookingApi(bookingId) {
  const res = await axios.delete(`${api}/booking/${bookingId}`, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   เปลี่ยนช่างของคิว (Admin เลือกเอง / ลูกค้าขอเปลี่ยน)
   PUT /booking/:id/assign
========================================================= */
export async function assignBookingStaff(bookingId, payload) {
  const res = await axios.put(`${api}/booking/${bookingId}/assign`, payload, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   สุ่มช่างใหม่ให้คิว (ช่างเดิมลา/ขาดงาน)
   POST /booking/:id/random-reassign
========================================================= */
export async function randomReassignBooking(bookingId, payload = {}) {
  const res = await axios.post(`${api}/booking/${bookingId}/random-reassign`, payload, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   ประวัติการเปลี่ยนช่างของคิว
   GET /booking/:id/history
========================================================= */
export async function getBookingHistory(bookingId) {
  const res = await axios.get(`${api}/booking/${bookingId}/history`, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   คิวของช่างคนนี้ในวันที่ระบุ ที่ได้รับผลกระทบจากการลา/ขาดงาน
   GET /booking/employee/:employeeId/:date/affected
========================================================= */
export async function getAffectedBookings(employeeId, date) {
  const res = await axios.get(`${api}/booking/employee/${employeeId}/${date}/affected`, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   รายละเอียดการจอง + บริการ (ใช้หาช่วงเวลา/service_id สำหรับเปลี่ยนช่าง)
   GET /booking/:id/detail
========================================================= */
export async function getBookingDetail(bookingId) {
  const res = await axios.get(`${api}/booking/${bookingId}/detail`, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   เปลี่ยนบริการของคิว (กรณีไม่มีช่างว่างสำหรับบริการเดิม)
   PUT /booking/:id/services
========================================================= */
export async function updateBookingServices(bookingId, services) {
  const res = await axios.put(`${api}/booking/${bookingId}/services`, { services }, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   สรุปคิวที่ได้รับผลกระทบทั้งร้าน (สำหรับ Dashboard)
   GET /booking/store/:storeId/affected?date=
========================================================= */
export async function getAffectedBookingsForStore(storeId, date) {
  const res = await axios.get(`${api}/booking/store/${storeId}/affected`, { params: { date }, headers: authHeader() });
  return res.data;
}

/* =========================================================
   ยกเลิกการจอง (ลูกค้ายกเลิกของตัวเอง -- Backend ตรวจกฎ 2 วัน)
   POST /booking/:id/cancel
========================================================= */
export async function cancelBooking(bookingId, reason) {
  const res = await axios.post(`${api}/booking/${bookingId}/cancel`, { reason }, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   ลูกค้าขอเลื่อนนัด
   POST /booking/:id/reschedule-request
========================================================= */
export async function requestReschedule(bookingId, payload) {
  const res = await axios.post(`${api}/booking/${bookingId}/reschedule-request`, payload, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   ร้านขอเลื่อนนัดให้ลูกค้า
   POST /booking/:id/store-reschedule
========================================================= */
export async function storeRequestReschedule(bookingId, payload) {
  const res = await axios.post(`${api}/booking/${bookingId}/store-reschedule`, payload, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   คำขอเลื่อนนัดล่าสุดของการจองนี้
   GET /booking/:id/reschedule-request
========================================================= */
export async function getRescheduleRequest(bookingId) {
  const res = await axios.get(`${api}/booking/${bookingId}/reschedule-request`, { headers: authHeader() });
  return res.data;
}

/* =========================================================
   ร้านอนุมัติ/ปฏิเสธ คำขอเลื่อนนัดที่ลูกค้าส่งมา
   PUT /reschedule-requests/:id/approve | /reject
========================================================= */
export async function approveReschedule(requestId) {
  const res = await axios.put(`${api}/reschedule-requests/${requestId}/approve`, {}, { headers: authHeader() });
  return res.data;
}

export async function rejectReschedule(requestId, responseNote) {
  const res = await axios.put(
    `${api}/reschedule-requests/${requestId}/reject`,
    { response_note: responseNote },
    { headers: authHeader() }
  );
  return res.data;
}

/* =========================================================
   ลูกค้าตอบรับ/ปฏิเสธ คำขอเลื่อนนัดที่ร้านเสนอ
   PUT /reschedule-requests/:id/respond
========================================================= */
export async function respondToReschedule(requestId, accept, responseNote) {
  const res = await axios.put(
    `${api}/reschedule-requests/${requestId}/respond`,
    { accept, response_note: responseNote },
    { headers: authHeader() }
  );
  return res.data;
}
