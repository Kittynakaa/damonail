import axios from "axios";
// let api = "http://127.0.0.1:8000";
let api = "http://localhost:5010";
// import DatatableStrig from "../component/strig";
export async function GetLogin(email, password) {
  try {
    const response = await axios.post(
      `${api}/api/login-admin`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json", // ตรวจสอบให้แน่ใจว่าใช้ Content-Type ถูกต้อง
        },
      }
    );
    console.log("data : ", response.data);  // ตรวจสอบว่าได้ข้อมูลที่ถูกต้องจาก response หรือไม่
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    const message =
      error.response?.data?.message || "เกิดข้อผิดพลาดขณะส่งข้อมูล";  // เอาข้อความ error ที่ส่งมาจาก API
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
          "Authorization": `Bearer ${token}`,
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
export async function getStores() {
    //   console.log(id_actionplan);
    try {
      // console.log("token : ", token);
      const response = await axios.get(
        `${api}/store`, // ** แก้ path ที่ใช้ดึงให้ตรง
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

  
