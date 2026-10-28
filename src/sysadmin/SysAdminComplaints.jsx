import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getComplaints, resolveComplaint } from "../callapi/call_api_complaint.jsx";
import Pagination from "./Pagination.jsx";
import "./SysAdmin.css";

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  { value: "", label: "ทั้งหมด" },
  { value: "OPEN", label: "เปิดใหม่" },
  { value: "IN_REVIEW", label: "กำลังตรวจสอบ" },
  { value: "RESOLVED", label: "แก้ไขแล้ว" },
  { value: "REJECTED", label: "ปฏิเสธ" },
];

const STATUS_BADGE = {
  OPEN: { label: "เปิดใหม่", cls: "open" },
  IN_REVIEW: { label: "กำลังตรวจสอบ", cls: "review" },
  RESOLVED: { label: "แก้ไขแล้ว", cls: "active" },
  REJECTED: { label: "ปฏิเสธ", cls: "banned" },
};

export default function SysAdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const load = async (status) => {
    setLoading(true);
    try {
      setComplaints(await getComplaints(status || undefined));
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

  const totalPages = Math.max(1, Math.ceil(complaints.length / PAGE_SIZE));
  const visibleComplaints = complaints.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openDetail = (c) => {
    setSelected(c);
    setNote(c.resolution_note || "");
  };

  const handleResolve = async (status) => {
    try {
      await resolveComplaint(selected.complaint_id, status, note);
      setSelected(null);
      await load(statusFilter);
      Swal.fire({ icon: "success", title: "อัปเดตแล้ว", toast: true, position: "top-end", timer: 1600, showConfirmButton: false });
    } catch (err) {
      Swal.fire("ไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  return (
    <section className="sysadmin-page">
      <div className="sysadmin-page-header">
        <div>
          <h1>ข้อร้องเรียน</h1>
          <p>รับเรื่องร้องเรียนระหว่างลูกค้ากับร้านค้า และตัดสินกรณีมีปัญหาการจอง</p>
        </div>
        <div className="sysadmin-header-actions">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
      </div>

      <div className="sysadmin-table-wrap">
        {loading ? (
          <p>กำลังโหลด...</p>
        ) : complaints.length === 0 ? (
          <div className="sysadmin-empty">ไม่มีข้อร้องเรียนในหมวดนี้</div>
        ) : (
          <table className="sysadmin-table">
            <thead>
              <tr>
                <th>เรื่อง</th>
                <th>ผู้แจ้ง</th>
                <th>ร้านที่เกี่ยวข้อง</th>
                <th>สถานะ</th>
                <th>วันที่แจ้ง</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleComplaints.map((c) => {
                const badge = STATUS_BADGE[c.status] || { label: c.status, cls: "neutral" };
                return (
                  <tr key={c.complaint_id}>
                    <td>{c.subject}</td>
                    <td>{c.reporter_username}</td>
                    <td>{c.store_name || "-"}</td>
                    <td><span className={`sysadmin-badge ${badge.cls}`}>{badge.label}</span></td>
                    <td>{new Date(c.created_at).toLocaleDateString("th-TH")}</td>
                    <td><button className="sysadmin-btn" onClick={() => openDetail(c)}>ดูรายละเอียด</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {selected && (
        <div className="sysadmin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="sysadmin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selected.subject}</h3>
            <div className="sysadmin-detail-row"><span>ผู้แจ้ง</span><span>{selected.reporter_username}</span></div>
            <div className="sysadmin-detail-row"><span>ร้านที่เกี่ยวข้อง</span><span>{selected.store_name || "-"}</span></div>
            <div className="sysadmin-detail-row"><span>หมายเลขการจอง</span><span>{selected.booking_id || "-"}</span></div>
            <label>รายละเอียด</label>
            <p style={{ fontSize: "0.88rem", color: "#555" }}>{selected.detail}</p>

            <label>บันทึกการตัดสิน</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="ระบุผลการตัดสิน/การดำเนินการ" />

            <div className="sysadmin-modal-actions">
              <button className="sysadmin-btn" onClick={() => setSelected(null)}>ปิด</button>
              <button className="sysadmin-btn" onClick={() => handleResolve("IN_REVIEW")}>กำลังตรวจสอบ</button>
              <button className="sysadmin-btn danger" onClick={() => handleResolve("REJECTED")}>ปฏิเสธ</button>
              <button className="sysadmin-btn primary" onClick={() => handleResolve("RESOLVED")}>แก้ไขแล้ว</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
