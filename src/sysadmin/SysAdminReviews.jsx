import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getReviewsAdmin, hideReview, unhideReview } from "../callapi/call_api_admin.jsx";
import Pagination from "./Pagination.jsx";
import "./SysAdmin.css";

const PAGE_SIZE = 10;

export default function SysAdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [onlyHidden, setOnlyHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const load = async (hidden) => {
    setLoading(true);
    try {
      setReviews(await getReviewsAdmin(hidden));
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(onlyHidden);
  }, [onlyHidden]);

  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const visibleReviews = reviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleHide = async (review) => {
    const { value: reason } = await Swal.fire({
      title: `ซ่อนรีวิวของ "${review.username}"`,
      input: "text",
      inputLabel: "เหตุผล",
      inputPlaceholder: "เช่น รีวิวปลอม, คำหยาบ, ไม่เกี่ยวข้อง",
      showCancelButton: true,
      confirmButtonText: "ซ่อนรีวิว",
      cancelButtonText: "ยกเลิก",
      inputValidator: (v) => (!v ? "กรุณาระบุเหตุผล" : undefined),
    });
    if (!reason) return;
    try {
      await hideReview(review.review_id, reason);
      await load(onlyHidden);
    } catch (err) {
      Swal.fire("ไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const handleUnhide = async (review) => {
    try {
      await unhideReview(review.review_id);
      await load(onlyHidden);
    } catch (err) {
      Swal.fire("ไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  return (
    <section className="sysadmin-page">
      <div className="sysadmin-page-header">
        <div>
          <h1>จัดการรีวิว</h1>
          <p>ตรวจสอบและซ่อนรีวิวที่ไม่เหมาะสมหรือน่าสงสัยว่าเป็นของปลอม</p>
        </div>
        <div className="sysadmin-header-actions">
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "#7a5263" }}>
            <input type="checkbox" checked={onlyHidden} onChange={(e) => setOnlyHidden(e.target.checked)} style={{ width: "auto" }} />
            แสดงเฉพาะที่ซ่อนอยู่
          </label>
        </div>
      </div>

      <div className="sysadmin-table-wrap">
        {loading ? (
          <p>กำลังโหลด...</p>
        ) : reviews.length === 0 ? (
          <div className="sysadmin-empty">ไม่มีรีวิวในหมวดนี้</div>
        ) : (
          <table className="sysadmin-table">
            <thead>
              <tr>
                <th>ร้าน</th>
                <th>ผู้เขียน</th>
                <th>คะแนน</th>
                <th>ความคิดเห็น</th>
                <th>สถานะ</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {visibleReviews.map((r) => (
                <tr key={r.review_id}>
                  <td>{r.store_name}</td>
                  <td>{r.username}</td>
                  <td>{"★".repeat(r.rating)}</td>
                  <td style={{ maxWidth: 280 }}>{r.comment}</td>
                  <td>
                    {r.is_hidden
                      ? <span className="sysadmin-badge hidden" title={r.hidden_reason}>ซ่อนอยู่</span>
                      : <span className="sysadmin-badge active">แสดงอยู่</span>}
                  </td>
                  <td>
                    {r.is_hidden ? (
                      <button className="sysadmin-btn primary" onClick={() => handleUnhide(r)}>เลิกซ่อน</button>
                    ) : (
                      <button className="sysadmin-btn danger" onClick={() => handleHide(r)}>ซ่อนรีวิว</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </section>
  );
}
