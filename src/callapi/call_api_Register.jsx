import axios from "axios";
// let api = "http://127.0.0.1:8000";
// let api = "http://localhost:5010";
export const API_BASE_URL = "http://localhost:5010";
const api = API_BASE_URL;
/* =========================================================
   LOGIN (ใช้จริงกับ backend)
   POST /login
   body: { identifier, password }
========================================================= */
export async function GetLogin(identifier, password) {
  try {
    const response = await axios.post(
      `${api}/login`,            // ✅ แก้ path ให้ตรง backend
      {
        identifier,              // ✅ backend ใช้ identifier (email หรือ phone)
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("login response :", response.data);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    const message =
      error.response?.data?.message || "เกิดข้อผิดพลาดขณะเข้าสู่ระบบ";
    throw message;
  }
}

/* =========================================================
   ลืมรหัสผ่าน (Forgot Password)
   POST /forgot-password  body: { identifier }
   -- เว็บนี้ยังไม่มีระบบส่งอีเมลจริง backend จะส่ง reset_code กลับมาตรงๆ
      (โหมดพัฒนา) ให้ frontend แสดงบนหน้าจอแทนการส่งอีเมล
========================================================= */
export async function ForgotPassword(identifier) {
  try {
    const response = await axios.post(
      `${api}/forgot-password`,
      { identifier },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Forgot password error:", error);
    const message = error.response?.data?.error || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
    throw message;
  }
}

/* =========================================================
   ตั้งรหัสผ่านใหม่ด้วยรหัสรีเซ็ต
   POST /reset-password  body: { reset_code, new_password }
========================================================= */
export async function ResetPassword(resetCode, newPassword) {
  try {
    const response = await axios.post(
      `${api}/reset-password`,
      { reset_code: resetCode, new_password: newPassword },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Reset password error:", error);
    const message = error.response?.data?.error || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
    throw message;
  }
}

/* =========================================================
   GET PRODUCTS / ADDRESS
========================================================= */
export async function getdataProducts() {
  try {
    const response = await axios.get(`${api}/address`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("data :", response);
    return response;
  } catch (error) {
    console.error("Error fetching product data:", error);
    throw error;
  }
}

/* =========================================================
   ADD PRODUCTS
========================================================= */
export async function adddataProducts(token, id_year) {
  try {
    const response = await axios.post(
      `${api}/products`,
      { id_year },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("data :", response);
    return response;
  } catch (error) {
    console.error("Error adding product data:", error);
    throw error;
  }
}

/* =========================================================
   GET USERS (admin / list user)
========================================================= */
export async function getUsers() {
  try {
    const response = await axios.get(`${api}/users`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("users :", response);
    return response;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export const RegisterUser = async (userData) => {
  try {
    const response = await axios.post(`${api}/register`, userData);
    return response.data;  // ส่งข้อมูลที่ได้จาก backend กลับ
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;  // ถ้ามีข้อผิดพลาด
  }
};
