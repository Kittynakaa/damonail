// สถานะการจอง -- ใช้ร่วมกันทั้งฝั่งลูกค้า (UserProfile) และฝั่งร้าน (ManageBookings)
// เพื่อไม่ให้ label/สี ของสถานะเดียวกันเพี้ยนกันไปคนละที่

export function getStatusMeta(statusName, cancelledBy) {
  const s = (statusName || "").toLowerCase();

  if (s === "cancelled" || s.includes("cancel")) {
    return cancelledBy === "store"
      ? { label: "ยกเลิกโดยร้าน", className: "canceled" }
      : { label: "ยกเลิกโดยลูกค้า", className: "canceled" };
  }
  if (s === "reschedule_pending_customer") {
    return { label: "ลูกค้าขอเลื่อนนัด", className: "reschedule" };
  }
  if (s === "reschedule_pending_store") {
    return { label: "ร้านขอเลื่อนนัด", className: "reschedule" };
  }
  if (s === "completed" || s.includes("done") || s.includes("complete") || s.includes("เสร็จ")) {
    return { label: "เสร็จสิ้น", className: "done" };
  }
  if (s === "confirmed" || s.includes("confirm")) {
    return { label: "ยืนยันแล้ว", className: "confirmed" };
  }
  return { label: "รอยืนยัน", className: "pending" };
}

// สถานะที่ลูกค้ายังยกเลิกได้ (ยังไม่ต้องเช็คกฎ 2 วัน -- ฝั่ง Backend เป็นคนตัดสินสุดท้าย)
export function isCustomerCancellableStatus(statusName) {
  const s = (statusName || "").toLowerCase();
  return s === "pending" || s === "confirmed";
}

// สถานะที่ลูกค้าขอเลื่อนนัดได้ (ต้องยืนยันแล้วเท่านั้น)
export function isCustomerReschedulableStatus(statusName) {
  return (statusName || "").toLowerCase() === "confirmed";
}
