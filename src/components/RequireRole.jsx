import React, { useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getStoredUser } from "../callapi/auth";

// หมายเหตุ: ตัวนี้เป็นแค่ UX guard ฝั่ง frontend (กันไม่ให้เห็นหน้า/กดปุ่มที่ไม่มี
// สิทธิ์) ตัวกั้นสิทธิ์จริงอยู่ที่ backend (token + ตรวจ store owner / employee_id
// ทุก endpoint) เพราะแก้ localStorage เองก็ยังเรียก API ข้ามสิทธิ์ไม่ได้

function useAccessDeniedAlert(denied) {
  useEffect(() => {
    if (denied) {
      Swal.fire({
        icon: "error",
        title: "ไม่มีสิทธิ์เข้าถึง",
        text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
        timer: 2200,
        showConfirmButton: false,
      });
    }
  }, [denied]);
}

// ใช้ครอบ /StoreDashboard/:storeId -- ต้อง login เป็น Admin (เจ้าของร้าน) และ
// เป็นเจ้าของร้าน storeId นี้จริง
export function RequireStoreAdmin() {
  const { storeId } = useParams();
  const user = getStoredUser();

  const allowed =
    !!user &&
    user.role_id === 2 &&
    Array.isArray(user.owned_store_ids) &&
    user.owned_store_ids.map(String).includes(String(storeId));

  useAccessDeniedAlert(!allowed);

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

// ใช้ครอบ /MySchedule -- ต้อง login เป็นช่าง (role_id=3) ที่มีบัญชีผูกกับ
// employee_id แล้ว
export function RequireEmployee() {
  const user = getStoredUser();

  const allowed = !!user && user.role_id === 3 && !!user.employee_id;

  useAccessDeniedAlert(!allowed);

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

// ใช้ครอบ /SysAdmin -- ต้อง login เป็นผู้ดูแลระบบ (role_id=4) เท่านั้น ไม่ผูกกับ
// ร้าน/พนักงานใดร้านหนึ่ง (เห็น/จัดการได้ทุกร้าน)
export function RequireSystemAdmin() {
  const user = getStoredUser();

  const allowed = !!user && user.role_id === 4;

  useAccessDeniedAlert(!allowed);

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
