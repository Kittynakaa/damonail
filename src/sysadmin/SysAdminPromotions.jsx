import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Swal from "sweetalert2";
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "../callapi/call_api_promotion.jsx";
import { getStores } from "../callapi/call_api_user.jsx";
import Pagination from "./Pagination.jsx";
import "./SysAdmin.css";

const PAGE_SIZE = 10;

const initialForm = {
  name: "",
  detail: "",
  discount: "",
  promo_code: "",
  start_date: "",
  end_date: "",
  store_id: "",
};

function getStatus(startDate, endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    if (start > today) return { label: "เตรียมใช้", cls: "pending" };
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    if (end < today) return { label: "หมดอายุ", cls: "neutral" };
  }
  return { label: "กำลังใช้งาน", cls: "active" };
}

export default function SysAdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [currentPage, setCurrentPage] = useState(1);

  const storeName = (storeId) => {
    if (!storeId) return "ทุกร้าน";
    const s = stores.find((x) => x.store_id === storeId);
    return s?.store_name || `ร้าน #${storeId}`;
  };

  const load = async () => {
    setLoading(true);
    try {
      const [promoData, storeRes] = await Promise.all([getAllPromotions(), getStores()]);
      setPromotions(promoData || []);
      setStores(storeRes?.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalPages = Math.max(1, Math.ceil(promotions.length / PAGE_SIZE));
  const visiblePromotions = promotions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openCreate = () => {
    setEditingPromo(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEdit = (promo) => {
    setEditingPromo(promo);
    setFormData({
      name: promo.name || "",
      detail: promo.detail || "",
      discount: promo.discount ?? "",
      promo_code: promo.promo_code || "",
      start_date: promo.start_date ? String(promo.start_date).slice(0, 10) : "",
      end_date: promo.end_date ? String(promo.end_date).slice(0, 10) : "",
      store_id: promo.store_id ? String(promo.store_id) : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      detail: formData.detail,
      discount: Number(formData.discount) || 0,
      promo_code: formData.promo_code || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      type_promo_id: 1,
      store_id: formData.store_id ? Number(formData.store_id) : null,
    };

    try {
      if (editingPromo) {
        await updatePromotion(editingPromo.promo_id, payload);
      } else {
        await createPromotion(payload);
      }
      setShowModal(false);
      await load();
      Swal.fire({ icon: "success", title: "บันทึกแล้ว", toast: true, position: "top-end", timer: 1600, showConfirmButton: false });
    } catch (err) {
      Swal.fire("บันทึกไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const handleDelete = async (promo) => {
    const confirm = await Swal.fire({
      title: `ลบโปรโมชั่น "${promo.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });
    if (!confirm.isConfirmed) return;
    try {
      await deletePromotion(promo.promo_id);
      await load();
    } catch (err) {
      Swal.fire("ลบไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  return (
    <section className="sysadmin-page">
      <div className="sysadmin-page-header">
        <div>
          <h1>จัดการโปรโมชั่น</h1>
          <p>เพิ่ม/ลบ/แก้ไขโปรโมชั่นของทุกร้านในแพลตฟอร์ม หรือสร้างโปรโมชั่นที่ใช้ได้ทุกร้าน</p>
        </div>
        <div className="sysadmin-header-actions">
          <button className="sysadmin-btn primary" onClick={openCreate}>+ เพิ่มโปรโมชั่น</button>
        </div>
      </div>

      <div className="sysadmin-table-wrap">
        {loading ? (
          <p>กำลังโหลด...</p>
        ) : promotions.length === 0 ? (
          <div className="sysadmin-empty">ยังไม่มีโปรโมชั่น</div>
        ) : (
          <table className="sysadmin-table">
            <thead>
              <tr>
                <th>ชื่อโปรโมชั่น</th>
                <th>ร้าน</th>
                <th>ส่วนลด</th>
                <th>โค้ด</th>
                <th>ระยะเวลา</th>
                <th>สถานะ</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {visiblePromotions.map((p) => {
                const status = getStatus(p.start_date, p.end_date);
                return (
                  <tr key={p.promo_id}>
                    <td>{p.name}</td>
                    <td>{storeName(p.store_id)}</td>
                    <td>{p.discount}%</td>
                    <td>{p.promo_code || "-"}</td>
                    <td>
                      {p.start_date ? new Date(p.start_date).toLocaleDateString("th-TH") : "-"} - {p.end_date ? new Date(p.end_date).toLocaleDateString("th-TH") : "-"}
                    </td>
                    <td><span className={`sysadmin-badge ${status.cls}`}>{status.label}</span></td>
                    <td className="sysadmin-row-actions">
                      <button className="sysadmin-btn" onClick={() => openEdit(p)}>แก้ไข</button>
                      <button className="sysadmin-btn danger" onClick={() => handleDelete(p)}>ลบ</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {showModal &&
        ReactDOM.createPortal(
          <div className="sysadmin-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="sysadmin-modal" onClick={(e) => e.stopPropagation()}>
              <h3>{editingPromo ? "แก้ไขโปรโมชั่น" : "เพิ่มโปรโมชั่น"}</h3>
              <form onSubmit={handleSubmit}>
                <label>ชื่อโปรโมชั่น</label>
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

                <label>รายละเอียด</label>
                <textarea required value={formData.detail} onChange={(e) => setFormData({ ...formData, detail: e.target.value })} />

                <label>ส่วนลด (%)</label>
                <input type="number" min="0" max="100" required value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} />

                <label>โค้ดส่วนลด (ไม่บังคับ)</label>
                <input value={formData.promo_code} onChange={(e) => setFormData({ ...formData, promo_code: e.target.value })} />

                <label>ร้าน</label>
                <select value={formData.store_id} onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}>
                  <option value="">ทุกร้าน (โปรโมชั่นแพลตฟอร์ม)</option>
                  {stores.map((s) => (
                    <option key={s.store_id} value={s.store_id}>{s.store_name}</option>
                  ))}
                </select>

                <label>วันที่เริ่ม</label>
                <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />

                <label>วันที่สิ้นสุด</label>
                <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />

                <div className="sysadmin-modal-actions">
                  <button type="button" className="sysadmin-btn" onClick={() => setShowModal(false)}>ยกเลิก</button>
                  <button type="submit" className="sysadmin-btn primary">บันทึก</button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
