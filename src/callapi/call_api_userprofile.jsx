import axios from "axios";
import { authHeader } from "./auth";
let api = "http://localhost:5010";


export async function updateUserById(userId, payload) {
  const res = await axios.put(
    `${api}/users/${userId}`,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return res.data;
}


/* =========================================================
   GET USER BY ID (profile)
   GET /users/<id>
========================================================= */
export async function getUserById(userId) {
  try {
    const response = await axios.get(
      `${api}/users/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("user by id:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    throw error;
  }
}

/* =========================================================
   GET ADDRESS
========================================================= */
export async function getdataProducts() {
  try {
    const response = await axios.get(`${api}/address`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
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

    return response;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
}

/* =========================================================
   GET USERS (admin / list)
========================================================= */
export async function getUsers() {
  try {
    const response = await axios.get(`${api}/users`, {   // ✅ /users
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}


export async function getUserBookings(userId) {
  // ไม่ catch/คืน [] เงียบ ๆ ที่นี่ -- ต้องให้ผู้เรียก (UserProfile) แยกออกว่า
  // "ไม่มีการจอง" (200 + array ว่าง) กับ "session หมดอายุ/ไม่ได้ login" (401)
  // ต่างกัน เพื่อพาไปหน้า login ใหม่แทนที่จะแสดงหน้าว่างเปล่าเงียบ ๆ
  const response = await axios.get(`${api}/booking/user/${userId}`, { headers: authHeader() });
  return response.data;
}

export async function getStoreByUser(userId) {
  const res = await axios.get(`${api}/store/by-user/${userId}`);
  return res.data;
}
