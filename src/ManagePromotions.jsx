import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { useParams } from "react-router-dom";
import { FiEdit2, FiPlusCircle, FiTrash2, FiX, FiSave } from "react-icons/fi";
import {
  getPromotionsByStore,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "./callapi/call_api_promotion.jsx";
import "./ManagePromotions.css";

const initialForm = {
  name: "",
  detail: "",
  discount: "",
  promo_code: "",
  start_date: "",
  end_date: "",
};

function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return "-";
  const formatOne = (value) =>
    value ? new Date(value).toLocaleDateString("th-TH") : "-";
  return `${formatOne(startDate)} - ${formatOne(endDate)}`;
}

function getStatus(startDate, endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    if (start > today) return "เตรียมใช้";
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    if (end < today) return "หมดอายุ";
  }

  return "กำลังใช้งาน";
}

export default function ManagePromotions() {
  const { storeId } = useParams();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  async function fetchPromotions() {
    if (!storeId) return;
    try {
      setLoading(true);
      const rows = await getPromotionsByStore(storeId);
      setPromotions(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPromotions();
  }, [storeId]);

  const mappedPromotions = useMemo(
    () =>
      promotions.map((promo) => ({
        id: promo.promo_id,
        name: promo.name,
        desc: promo.detail || "-",
        date: formatDateRange(promo.start_date, promo.end_date),
        discount: `${Number(promo.discount || 0)}%`,
        code: promo.promo_code || "-",
        status: getStatus(promo.start_date, promo.end_date),
      })),
    [promotions]
  );

  const handleAdd = () => {
    setEditingPromo(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleEdit = (promo) => {
    setEditingPromo(promo);
    setFormData({
      name: promo.name || "",
      detail: promo.detail || "",
      discount: String(promo.discount ?? ""),
      promo_code: promo.promo_code || "",
      start_date: promo.start_date ? String(promo.start_date).slice(0, 10) : "",
      end_date: promo.end_date ? String(promo.end_date).slice(0, 10) : "",
    });
    setShowModal(true);
  };

  const handleDelete = async (promoId) => {
    if (!window.confirm("ต้องการลบโปรโมชั่นนี้ใช่ไหม")) return;
    try {
      await deletePromotion(promoId);
      await fetchPromotions();
    } catch (error) {
      console.error("Delete promotion error:", error);
      alert("ลบโปรโมชั่นไม่สำเร็จ");
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.discount) {
      alert("กรุณากรอกชื่อโปรโมชั่นและส่วนลด");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      detail: formData.detail.trim(),
      discount: Number(formData.discount),
      store_id: Number(storeId),
      type_promo_id: 1,
      promo_code: formData.promo_code.trim() || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };

    try {
      if (editingPromo) {
        await updatePromotion(editingPromo.promo_id, payload);
      } else {
        await createPromotion(payload);
      }
      setShowModal(false);
      setEditingPromo(null);
      setFormData(initialForm);
      await fetchPromotions();
    } catch (error) {
      console.error("Save promotion error:", error);
      alert("บันทึกโปรโมชั่นไม่สำเร็จ");
    }
  };

  return (
    <div className="promotion-page admin-root">
      <main className="promotion">
        <div className="header">
          <div>
            <h1>โปรโมชั่นและแพ็กเกจ</h1>
            <p>จัดการโปรโมชั่นและส่วนลดพิเศษของร้านนี้</p>
          </div>
          <button className="btn-add" onClick={handleAdd}>
            <FiPlusCircle /> เพิ่มโปรโมชั่นใหม่
          </button>
        </div>

        <div className="table-wrapper">
          <h3>รายการโปรโมชั่นทั้งหมด</h3>
          {loading ? (
            <div className="promotion-empty">กำลังโหลดข้อมูลโปรโมชั่น...</div>
          ) : mappedPromotions.length === 0 ? (
            <div className="promotion-empty">ยังไม่มีโปรโมชั่นในฐานข้อมูล</div>
          ) : (
            <table className="promotion-table">
              <thead>
                <tr>
                  <th>ชื่อโปร</th>
                  <th>โค้ด</th>
                  <th>วันที่เริ่ม - สิ้นสุด</th>
                  <th>ส่วนลด</th>
                  <th>สถานะ</th>
                  <th>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {mappedPromotions.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      <div className="desc">{p.desc}</div>
                    </td>
                    <td>
                      <span className="code-badge">{p.code}</span>
                    </td>
                    <td>{p.date}</td>
                    <td>
                      <span className="discount-badge">{p.discount}</span>
                    </td>
                    <td>
                      <span
                        className={
                          p.status === "กำลังใช้งาน"
                            ? "badge active"
                            : p.status === "เตรียมใช้"
                              ? "badge upcoming"
                              : "badge expired"
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon" onClick={() => handleEdit(promotions.find((item) => item.promo_id === p.id))}>
                        <FiEdit2 />
                      </button>
                      <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(p.id)}>
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showModal &&
          ReactDOM.createPortal(
            <div className="promotion-modal-overlay" onClick={() => setShowModal(false)}>
              <div className="promotion-modal" onClick={(e) => e.stopPropagation()}>
                <div className="promotion-modal-header">
                  <h3>{editingPromo ? "แก้ไขโปรโมชั่น" : "เพิ่มโปรโมชั่นใหม่"}</h3>
                  <button className="promotion-close-btn" onClick={() => setShowModal(false)}>
                    <FiX />
                  </button>
                </div>

                <div className="promotion-modal-body">
                  <label>ชื่อโปรโมชั่น</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />

                  <label>รายละเอียด</label>
                  <textarea
                    value={formData.detail}
                    onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                  />

                  <label>โค้ดโปรโมชั่น</label>
                  <input
                    type="text"
                    value={formData.promo_code}
                    onChange={(e) =>
                      setFormData({ ...formData, promo_code: e.target.value.toUpperCase() })
                    }
                    placeholder="เช่น NEW10"
                  />

                  <label>ส่วนลด (%)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  />

                  <label>วันที่เริ่มต้น</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />

                  <label>วันที่สิ้นสุด</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>

                <div className="promotion-modal-actions">
                  <button className="promotion-cancel-btn" onClick={() => setShowModal(false)}>
                    ยกเลิก
                  </button>
                  <button className="promotion-save-btn" onClick={handleSave}>
                    <FiSave /> บันทึก
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
      </main>
    </div>
  );
}
