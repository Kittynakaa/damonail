import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getContent, createContent, updateContent, deleteContent } from "../callapi/call_api_content.jsx";
import Pagination from "./Pagination.jsx";
import "./SysAdmin.css";

const TYPE_LABELS = { BANNER: "แบนเนอร์", ANNOUNCEMENT: "ประกาศ", NEWS: "ข่าวสาร" };
const PAGE_SIZE = 10;

const initialForm = {
  content_type: "BANNER",
  title: "",
  body: "",
  image_url: "",
  link_url: "",
  display_order: 0,
  is_active: true,
};

export default function SysAdminContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [currentPage, setCurrentPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await getContent());
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const visibleItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      content_type: item.content_type,
      title: item.title,
      body: item.body || "",
      image_url: item.image_url || "",
      link_url: item.link_url || "",
      display_order: item.display_order,
      is_active: !!item.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateContent(editing.content_id, form);
      } else {
        await createContent(form);
      }
      setShowModal(false);
      await load();
      Swal.fire({ icon: "success", title: "บันทึกแล้ว", toast: true, position: "top-end", timer: 1600, showConfirmButton: false });
    } catch (err) {
      Swal.fire("บันทึกไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const handleDelete = async (item) => {
    const confirm = await Swal.fire({
      title: `ลบ "${item.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });
    if (!confirm.isConfirmed) return;
    try {
      await deleteContent(item.content_id);
      await load();
    } catch (err) {
      Swal.fire("ลบไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const toggleActive = async (item) => {
    try {
      await updateContent(item.content_id, { is_active: !item.is_active });
      await load();
    } catch (err) {
      Swal.fire("ไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  return (
    <section className="sysadmin-page">
      <div className="sysadmin-page-header">
        <div>
          <h1>จัดการเนื้อหาหน้าเว็บ</h1>
          <p>จัดการแบนเนอร์ ข่าวสาร และประกาศที่แสดงบนหน้าเว็บไซต์</p>
        </div>
        <div className="sysadmin-header-actions">
          <button className="sysadmin-btn primary" onClick={openCreate}>+ เพิ่มเนื้อหา</button>
        </div>
      </div>

      <div className="sysadmin-table-wrap">
        {loading ? (
          <p>กำลังโหลด...</p>
        ) : items.length === 0 ? (
          <div className="sysadmin-empty">ยังไม่มีเนื้อหา</div>
        ) : (
          <table className="sysadmin-table">
            <thead>
              <tr>
                <th>ประเภท</th>
                <th>หัวข้อ</th>
                <th>ลำดับแสดงผล</th>
                <th>สถานะ</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item.content_id}>
                  <td>{TYPE_LABELS[item.content_type] || item.content_type}</td>
                  <td>{item.title}</td>
                  <td>{item.display_order}</td>
                  <td>
                    {item.is_active
                      ? <span className="sysadmin-badge active">แสดงอยู่</span>
                      : <span className="sysadmin-badge neutral">ปิดอยู่</span>}
                  </td>
                  <td className="sysadmin-row-actions">
                    <button className="sysadmin-btn" onClick={() => openEdit(item)}>แก้ไข</button>
                    <button className="sysadmin-btn" onClick={() => toggleActive(item)}>{item.is_active ? "ปิดการแสดง" : "เปิดการแสดง"}</button>
                    <button className="sysadmin-btn danger" onClick={() => handleDelete(item)}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {showModal && (
        <div className="sysadmin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="sysadmin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "แก้ไขเนื้อหา" : "เพิ่มเนื้อหา"}</h3>
            <form onSubmit={handleSubmit}>
              <label>ประเภท</label>
              <select value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value })}>
                <option value="BANNER">แบนเนอร์</option>
                <option value="ANNOUNCEMENT">ประกาศ</option>
                <option value="NEWS">ข่าวสาร</option>
              </select>

              <label>หัวข้อ</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

              <label>เนื้อหา</label>
              <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />

              <label>URL รูปภาพ</label>
              <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />

              <label>ลิงก์ (ถ้ามี)</label>
              <input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." />

              <label>ลำดับการแสดงผล</label>
              <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />

              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                แสดงบนหน้าเว็บ
              </label>

              <div className="sysadmin-modal-actions">
                <button type="button" className="sysadmin-btn" onClick={() => setShowModal(false)}>ยกเลิก</button>
                <button type="submit" className="sysadmin-btn primary">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
