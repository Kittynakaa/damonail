import React, { useState, useEffect } from "react";
import { FiSearch, FiEye, FiCheck, FiX, FiClock } from "react-icons/fi";
import ReactDOM from "react-dom";
import Swal from "sweetalert2";
import "../ManageBookings.css";
import "./StaffBookings.css";
import {
  getStoreBookings,
  updateBookingStatus,
  getRescheduleRequest,
  approveReschedule,
  rejectReschedule,
  storeRequestReschedule,
} from "../callapi/call_api_booking";
import { getStoredUser } from "../callapi/auth";
import { getStatusMeta } from "../utils/bookingStatus";
import RescheduleRequestModal from "../components/RescheduleRequestModal";

export default function StaffBookings() {
  const user = getStoredUser();
  const storeId = user?.employee_store_id;

  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 5;

  const [selectedBooking, setSelectedBooking] = useState(null);

  const [rescheduleReviewBooking, setRescheduleReviewBooking] = useState(null);
  const [rescheduleReviewRequest, setRescheduleReviewRequest] = useState(null);
  const [rescheduleReviewLoading, setRescheduleReviewLoading] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState(null);

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const loadBookings = async () => {
    if (!storeId) return;
    try {
      const data = await getStoreBookings(storeId);
      setBookings(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("โหลดการจองผิดพลาด", err);
    }
  };

  const statusMeta = (booking) => getStatusMeta(booking.status_booking_name, booking.cancelled_by);

  const openDetail = (b) => {
    setSelectedBooking(b);
  };

  const updateStatus = async (id, statusId) => {
    try {
      await updateBookingStatus(id, statusId);
      setSelectedBooking(null);
      await loadBookings();
    } catch (err) {
      Swal.fire("ไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const openRescheduleReview = async (b) => {
    setRescheduleReviewBooking(b);
    setRescheduleReviewRequest(null);
    setRescheduleReviewLoading(true);
    try {
      const req = await getRescheduleRequest(b.booking_id);
      setRescheduleReviewRequest(req);
    } catch (err) {
      console.error("โหลดคำขอเลื่อนนัดผิดพลาด", err);
    } finally {
      setRescheduleReviewLoading(false);
    }
  };

  const handleApproveReschedule = async () => {
    if (!rescheduleReviewRequest) return;
    try {
      await approveReschedule(rescheduleReviewRequest.request_id);
      setRescheduleReviewBooking(null);
      await loadBookings();
      Swal.fire({ icon: "success", title: "อนุมัติการเลื่อนนัดแล้ว", toast: true, position: "top-end", timer: 1600, showConfirmButton: false });
    } catch (err) {
      Swal.fire("อนุมัติไม่สำเร็จ", err.response?.data?.error || "กรุณาลองใหม่อีกครั้ง", "warning");
    }
  };

  const handleRejectReschedule = async () => {
    if (!rescheduleReviewRequest) return;
    try {
      await rejectReschedule(rescheduleReviewRequest.request_id);
      setRescheduleReviewBooking(null);
      await loadBookings();
      Swal.fire({ icon: "success", title: "ปฏิเสธคำขอเลื่อนนัดแล้ว", toast: true, position: "top-end", timer: 1600, showConfirmButton: false });
    } catch (err) {
      Swal.fire("ดำเนินการไม่สำเร็จ", err.response?.data?.error || "กรุณาลองใหม่อีกครั้ง", "warning");
    }
  };

  const handleRescheduleSubmit = async (payload) => {
    await storeRequestReschedule(rescheduleBooking.booking_id, payload);
    setRescheduleBooking(null);
    setSelectedBooking(null);
    await loadBookings();
    Swal.fire({ icon: "success", title: "ส่งคำขอเลื่อนนัดให้ลูกค้าแล้ว", toast: true, position: "top-end", timer: 1800, showConfirmButton: false });
  };

  const filteredBookings = bookings.filter((b) =>
    (b.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
    String(b.booking_id).includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / bookingsPerPage));
  const startIndex = (currentPage - 1) * bookingsPerPage;
  const visibleBookings = filteredBookings.slice(startIndex, startIndex + bookingsPerPage);

  return (
    <>
      <section className="manage manage-bookings-page staff-bookings-page">
        <div className="header">
          <div>
            <h1>การจองของฉัน</h1>
            <p>ดูและจัดการคิวงานที่คุณได้รับมอบหมาย</p>
          </div>
        </div>

        <div className="service-card">
          <div className="toolbar">
            <div className="search-box">
              <FiSearch className="icon" />
              <input
                type="text"
                placeholder="ค้นหาการจองหรือชื่อลูกค้า..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <table className="service-table">
            <thead>
              <tr>
                <th>หมายเลขการจอง</th>
                <th>ชื่อลูกค้า</th>
                <th>บริการ</th>
                <th>วันที่</th>
                <th>เวลา</th>
                <th>สถานะ</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {visibleBookings.map((b) => (
                <tr key={b.booking_id}>
                  <td>{b.booking_id}</td>
                  <td>{b.customer_name}</td>
                  <td>{b.services || "-"}</td>
                  <td>{b.booking_date}</td>
                  <td>{b.booking_time}</td>
                  <td>
                    <span className={`status ${statusMeta(b).className}`}>
                      {statusMeta(b).label}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="icon-btn view" onClick={() => openDetail(b)}>
                      <FiEye />
                    </button>

                    {b.status_booking_id === 5 || b.status_booking_id === 6 ? (
                      <button
                        className="icon-btn reschedule"
                        title="ดูคำขอเลื่อนนัด"
                        onClick={() => openRescheduleReview(b)}
                      >
                        <FiClock />
                      </button>
                    ) : (
                      <>
                        <button className="icon-btn confirm" onClick={() => updateStatus(b.booking_id, 2)}>
                          <FiCheck />
                        </button>
                        <button className="icon-btn cancel" onClick={() => updateStatus(b.booking_id, 4)}>
                          <FiX />
                        </button>
                        {b.status_booking_id === 2 && (
                          <button
                            className="icon-btn reschedule"
                            title="ขอเลื่อนนัด"
                            onClick={() => setRescheduleBooking(b)}
                          >
                            <FiClock />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length > bookingsPerPage && (
            <div className="pagination-bar">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`page-num-btn ${page === currentPage ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal รายละเอียดการจอง */}
      {selectedBooking &&
        ReactDOM.createPortal(
          <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
            <div className="modal booking-modal" onClick={(e) => e.stopPropagation()}>
              <h3>รายละเอียดการจอง</h3>
              <div className="booking-detail">
                <p><strong>หมายเลขการจอง:</strong> {selectedBooking.booking_id}</p>
                <p><strong>ชื่อลูกค้า:</strong> {selectedBooking.customer_name}</p>
                <p><strong>เบอร์โทรศัพท์:</strong> {selectedBooking.customer_phone || "-"}</p>
                <p><strong>บริการ:</strong> {selectedBooking.services || "-"}</p>
                <p><strong>วันที่:</strong> {selectedBooking.booking_date}</p>
                <p><strong>เวลา:</strong> {selectedBooking.booking_time}</p>
                <p>
                  <strong>สถานะ:</strong>{" "}
                  <span className={`status ${statusMeta(selectedBooking).className}`}>
                    {statusMeta(selectedBooking).label}
                  </span>
                </p>
              </div>
              <div className="modal-actions">
                {selectedBooking.status_booking_id !== 5 && selectedBooking.status_booking_id !== 6 && (
                  <>
                    <button className="icon-btn confirm" style={{ fontSize: 14, padding: "8px 16px" }} onClick={() => updateStatus(selectedBooking.booking_id, 2)}>
                      ยืนยัน
                    </button>
                    <button className="icon-btn cancel" style={{ fontSize: 14, padding: "8px 16px" }} onClick={() => updateStatus(selectedBooking.booking_id, 4)}>
                      ยกเลิก
                    </button>
                    {selectedBooking.status_booking_id === 2 && (
                      <button className="icon-btn reschedule" style={{ fontSize: 14, padding: "8px 16px" }} onClick={() => setRescheduleBooking(selectedBooking)}>
                        ขอเลื่อนนัด
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => setSelectedBooking(null)} className="cancel-btn">
                  ปิด
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal ทบทวนคำขอเลื่อนนัด */}
      {rescheduleReviewBooking &&
        ReactDOM.createPortal(
          <div className="modal-overlay" onClick={() => setRescheduleReviewBooking(null)}>
            <div className="modal booking-modal" onClick={(e) => e.stopPropagation()}>
              <h3>คำขอเลื่อนนัด</h3>
              <div className="booking-detail">
                {rescheduleReviewLoading || !rescheduleReviewRequest ? (
                  <p>กำลังโหลด...</p>
                ) : (
                  <>
                    <p><strong>ลูกค้า:</strong> {rescheduleReviewBooking.customer_name}</p>
                    <p><strong>หมายเลขการจอง:</strong> {rescheduleReviewBooking.booking_id}</p>
                    <p><strong>บริการ:</strong> {rescheduleReviewBooking.services || "-"}</p>
                    <p><strong>วัน/เวลาเดิม:</strong> {rescheduleReviewRequest.old_date} {String(rescheduleReviewRequest.old_time).slice(0, 5)}</p>
                    <p><strong>วัน/เวลาใหม่ที่ขอ:</strong> {rescheduleReviewRequest.proposed_date} {String(rescheduleReviewRequest.proposed_time).slice(0, 5)}</p>
                    <p><strong>เหตุผล:</strong> {rescheduleReviewRequest.reason || "-"}</p>
                    <p><strong>ผู้ขอ:</strong> {rescheduleReviewRequest.requested_by === "store" ? "ร้าน (รอลูกค้ายืนยัน)" : "ลูกค้า"}</p>
                  </>
                )}
              </div>
              <div className="modal-actions">
                {rescheduleReviewRequest?.requested_by === "customer" && (
                  <>
                    <button onClick={handleApproveReschedule} className="icon-btn confirm" style={{ fontSize: 14, padding: "8px 16px" }}>
                      อนุมัติ
                    </button>
                    <button onClick={handleRejectReschedule} className="icon-btn cancel" style={{ fontSize: 14, padding: "8px 16px" }}>
                      ปฏิเสธ
                    </button>
                  </>
                )}
                <button onClick={() => setRescheduleReviewBooking(null)} className="cancel-btn">
                  ปิด
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal ขอเลื่อนนัดให้ลูกค้า */}
      {rescheduleBooking && (
        <RescheduleRequestModal
          title="ขอเลื่อนนัด"
          oldDateDisplay={rescheduleBooking.booking_date}
          oldTimeDisplay={rescheduleBooking.booking_time}
          minDate={new Date().toISOString().slice(0, 10)}
          submitLabel="ส่งคำขอเลื่อนนัด"
          onSubmit={handleRescheduleSubmit}
          onClose={() => setRescheduleBooking(null)}
        />
      )}
    </>
  );
}
