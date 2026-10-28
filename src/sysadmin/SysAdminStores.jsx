import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getStoresAdmin,
  approveStore,
  rejectStore,
  setStoreNote,
  notifyStore,
} from "../callapi/call_api_admin.jsx";
import NotifyModal from "./NotifyModal.jsx";
import Pagination from "./Pagination.jsx";
import "./SysAdmin.css";

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  { value: "", label: "ทั้งหมด" },
  { value: "4", label: "รออนุมัติ" },
  { value: "1", label: "เปิดใช้งาน" },
  { value: "2", label: "ปิดชั่วคราว" },
  { value: "3", label: "ปรับปรุง" },
  { value: "5", label: "ถูกปฏิเสธ" },
];

const STATUS_BADGE = {
  1: { label: "เปิดใช้งาน", cls: "active" },
  2: { label: "ปิดชั่วคราว", cls: "neutral" },
  3: { label: "ปรับปรุง", cls: "review" },
  4: { label: "รออนุมัติ", cls: "pending" },
  5: { label: "ถูกปฏิเสธ", cls: "rejected" },
};

export default function SysAdminStores() {
  const [stores, setStores] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [noteStore, setNoteStore] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [notifyTarget, setNotifyTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const load = async (status) => {
    setLoading(true);
    try {
      const rows = await getStoresAdmin(status || undefined);
      setStores(rows);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(statusFilter);
  }, [statusFilter]);

  const totalPages = Math.max(1, Math.ceil(stores.length / PAGE_SIZE));
  const visibleStores = stores.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleApprove = async (store) => {
    const confirm = await Swal.fire({
      title: `อนุมัติร้าน "${store.store_name}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "อนุมัติ",
      cancelButtonText: "ยกเลิก",
    });
    if (!confirm.isConfirmed) return;
    try {
      await approveStore(store.store_id);
      await load(statusFilter);
      Swal.fire({ icon: "success", title: "อนุมัติแล้ว", toast: true, position: "top-end", timer: 1600, showConfirmButton: false });
    } catch (err) {
      Swal.fire("ไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const handleReject = async (store) => {
    const { value: reason } = await Swal.fire({
      title: `ปฏิเสธร้าน "${store.store_name}"`,
      input: "text",
      inputLabel: "เหตุผล",
      inputPlaceholder: "ระบุเหตุผลที่ปฏิเสธ",
      showCancelButton: true,
      confirmButtonText: "ปฏิเสธร้าน",
      cancelButtonText: "ยกเลิก",
      inputValidator: (v) => (!v ? "กรุณาระบุเหตุผล" : undefined),
    });
    if (!reason) return;
    try {
      await rejectStore(store.store_id, reason);
      await load(statusFilter);
      Swal.fire({ icon: "success", title: "ปฏิเสธแล้ว", toast: true, position: "top-end", timer: 1600, showConfirmButton: false });
    } catch (err) {
      Swal.fire("ไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const openNote = (store) => {
    setNoteStore(store);
    setNoteText(store.admin_note || "");
  };

  const saveNote = async () => {
    try {
      await setStoreNote(noteStore.store_id, noteText);
      setNoteStore(null);
      await load(statusFilter);
    } catch (err) {
      Swal.fire("บันทึกไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const openNotify = (store) => setNotifyTarget(store);

  const sendNotify = async (title, message) => {
    try {
      await notifyStore(notifyTarget.store_id, title, message);
      setNotifyTarget(null);
      Swal.fire({ icon: "success", title: "ส่งแจ้งเตือนแล้ว", toast: true, position: "top-end", timer: 1600, showConfirmButton: false });
    } catch (err) {
      Swal.fire("ส่งไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  return (
    <section className="sysadmin-page">
      <div className="sysadmin-page-header">
        <div>
          <h1>จัดการร้าน</h1>
          <p>อนุมัติ/ปฏิเสธร้านใหม่ ตรวจสอบและประเมินร้านที่เปิดอยู่</p>
        </div>
        <div className="sysadmin-header-actions">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="sysadmin-table-wrap">
        {loading ? (
          <p>กำลังโหลด...</p>
        ) : stores.length === 0 ? (
          <div className="sysadmin-empty">ไม่มีร้านในหมวดนี้</div>
        ) : (
          <table className="sysadmin-table">
            <thead>
              <tr>
                <th>ร้าน</th>
                <th>เจ้าของ</th>
                <th>สถานะ</th>
                <th>คะแนนรีวิว</th>
                <th>คิวทั้งหมด</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {visibleStores.map((s) => {
                const badge = STATUS_BADGE[s.status_store_id] || { label: s.status_store_name, cls: "neutral" };
                return (
                  <tr key={s.store_id}>
                    <td>{s.store_name}</td>
                    <td>{s.owner_username}</td>
                    <td><span className={`sysadmin-badge ${badge.cls}`}>{badge.label}</span></td>
                    <td>{s.avg_rating ? `${s.avg_rating} (${s.review_count})` : "-"}</td>
                    <td>{s.booking_count}</td>
                    <td className="sysadmin-row-actions">
                      {s.status_store_id === 4 && (
                        <>
                          <button className="sysadmin-btn primary" onClick={() => handleApprove(s)}>อนุมัติ</button>
                          <button className="sysadmin-btn danger" onClick={() => handleReject(s)}>ปฏิเสธ</button>
                        </>
                      )}
                      <button className="sysadmin-btn" onClick={() => openNote(s)}>ประเมิน/โน้ต</button>
                      <button className="sysadmin-btn" onClick={() => openNotify(s)}>แจ้งเตือน</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {noteStore && (
        <div className="sysadmin-modal-overlay" onClick={() => setNoteStore(null)}>
          <div className="sysadmin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>ประเมินร้าน: {noteStore.store_name}</h3>
            <p className="sysadmin-card-label">คะแนนรีวิวเฉลี่ย: {noteStore.avg_rating || "ยังไม่มีรีวิว"} ({noteStore.review_count} รีวิว)</p>
            <label>บันทึกภายใน (เฉพาะผู้ดูแลระบบเห็น)</label>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} />
            <div className="sysadmin-modal-actions">
              <button className="sysadmin-btn" onClick={() => setNoteStore(null)}>ยกเลิก</button>
              <button className="sysadmin-btn primary" onClick={saveNote}>บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {notifyTarget && (
        <NotifyModal
          title={`แจ้งเตือนร้าน: ${notifyTarget.store_name}`}
          onClose={() => setNotifyTarget(null)}
          onSend={sendNotify}
        />
      )}
    </section>
  );
}
