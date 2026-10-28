// แนบ token ที่ได้จาก /login เข้ากับ request header (Authorization: Bearer ...)
// backend ใช้ token นี้ตรวจสอบสิทธิ์จริง -- การซ่อนปุ่ม/เมนูฝั่ง frontend อย่างเดียว
// ไม่เพียงพอ
export function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}
