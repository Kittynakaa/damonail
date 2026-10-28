// แก้ไขไฟล์ service (เช่น storeService.js)
import axios from 'axios';

const api = "http://localhost:5010"; // ตรวจสอบว่า URL ตรงกับ Backend ของคุณแ
// สำหรับสมัครร้านค้าใหม่ (ใช้ชื่อนี้จะสื่อสารเข้าใจง่าย)
export async function registerStore(payload) {
  try {
    const response = await axios.post(`${api}/register-store`, payload, {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    console.error("Error registering store:", error?.response?.data || error.message);
    throw error;
  }
}

// สำหรับดึงข้อมูลร้านค้า (รองรับทั้งดูทั้งหมด และดูเฉพาะของตัวเอง)
export async function getStores(userId = null) {
  try {
    const url = userId ? `${api}/stores?user_id=${userId}` : `${api}/stores`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error registering store:", error?.response?.data || error.message);
    throw error;
  }
}
