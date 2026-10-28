import axios from "axios";
// let api = "http://127.0.0.1:8000";
let api = "http://localhost:5010";
// import DatatableStrig from "../component/strig";
export async function GetLogin(email, password) {
  // console.log(id_strategic.data)
  try {
    const response = await axios.post(
      `${api}/api/login-admin`,
      { email, password },
      {
        headers: {
          "Content-Type": `application/json`, // ส่ง Token ผ่าน Header
        },
      }
    );

    // const json = await response.json();
    console.log("data : ", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    // Swal.fire("Error", "ไม่สามารถดึงข้อมูลได้", "error");
    const message =
      error.response?.data?.message || "เกิดข้อผิดพลาดขณะส่งข้อมูล";

    throw message; // ส่ง Error ออกไปให้จัดการในที่เรียกใช้
  }
}

export async function getdataProducts() {
  //   console.log(id_actionplan);
  try {
    // console.log("token : ", token);
    const response = await axios.get(
      `${api}/address`,
    //   { id_year },
      {
        headers: {
        //   Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // const json = await response.json();
    console.log("data : ", response);
    return response;
  } catch (error) {
    console.error("Error fetching user data:", error);
    // Swal.fire("Error", "ไม่สามารถดึงข้อมูลได้", "error");
    throw error; // ส่ง Error ออกไปให้จัดการในที่เรียกใช้
  }
}

export async function adddataProducts(token,id_year) {
  //   console.log(id_actionplan);
  try {
    // console.log("token : ", token);
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

    // const json = await response.json();
    console.log("data : ", response);
    return response;
  } catch (error) {
    console.error("Error fetching user data:", error);
    // Swal.fire("Error", "ไม่สามารถดึงข้อมูลได้", "error");
    throw error; // ส่ง Error ออกไปให้จัดการในที่เรียกใช้
  }
}

// Step 1 เพิ่ม function เพื่อเชื่อมกับ backend ตั้งชื่อให้สอดคล้อง และแก้ **
export async function getStore_address(id) { // 1. เพิ่มรับ parameter id
  try {
    const response = await axios.get(
      `${api}/store_address/${id}`, // 2. ใส่ id ต่อท้าย URL
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log("address data :", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching store address:", error);
    throw error;
  }
}


// เพิ่มฟังก์ชันนี้เข้าไปในไฟล์ call_api_store2.jsx
export async function getStoreById(id) {
  try {
    const response = await axios.get(`${api}/store/${id}`);
    
    // 🚩 แก้จุดนี้: Postman โชว์ว่าข้อมูลมาเป็น Array เลย 
    // ดังนั้นเราใช้ response.data ได้เลยครับ
    console.log("Check Data from Backend:", response.data); 
    
    return response.data; 
  } catch (error) {
    console.error("Error fetching store by id:", error);
    return []; 
  }
}

export async function getPromotionsByStore(storeId) {
  try {
    const response = await axios.get(
      `${api}/promotion/store/${storeId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return [];
  }
}

export async function getReviewsByStore(storeId) {
  try {
    const response = await axios.get(`${api}/review/store/${storeId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    if (error.response?.status === 404) {
      try {
        const fallback = await axios.get(`${api}/review`);
        const rows = Array.isArray(fallback.data) ? fallback.data : [];
        return rows.filter((row) => Number(row.store_id) === Number(storeId));
      } catch (fallbackError) {
        console.error("Fallback review fetch failed:", fallbackError);
      }
    } else {
      console.error("Error fetching reviews:", error);
    }
    return [];
  }
}

export async function createReview({ storeId, userId, rating, comment }) {
  const response = await axios.post(`${api}/review`, {
    store_id: storeId,
    user_id: userId,
    rating,
    comment,
  });
  return response.data;
}
