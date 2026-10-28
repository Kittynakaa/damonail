import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FiSearch, FiEye, FiCheck, FiX, FiTrash2, FiClock } from "react-icons/fi";
import ReactDOM from "react-dom";
import Swal from "sweetalert2";
import "./ManageBookings.css";
import {
  getStoreBookings,
  updateBookingStatus,
  deleteBookingApi,
  getBookingDetail,
  getBookingHistory,
  assignBookingStaff,
  getRescheduleRequest,
  approveReschedule,
  rejectReschedule,
  storeRequestReschedule,
} from "./callapi/call_api_booking";
import { getAvailableStaff } from "./callapi/call_api_employee";
import { getStatusMeta } from "./utils/bookingStatus";
import RescheduleRequestModal from "./components/RescheduleRequestModal";

export default function ManageBookings() {
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [history, setHistory] = useState([]);
  const [reassignChoices, setReassignChoices] = useState([]);
  const { storeId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 5;

  const [bookings, setBookings] = useState([]);
  const [rescheduleReviewBooking, setRescheduleReviewBooking] = useState(null);
  const [rescheduleReviewRequest, setRescheduleReviewRequest] = useState(null);
  const [rescheduleReviewLoading, setRescheduleReviewLoading] = useState(false);
  const [storeRescheduleBooking, setStoreRescheduleBooking] = useState(null);

  useEffect(() => {
    loadBookings();
  }, [storeId]);

  const loadBookings = async () => {
    try {
      const data = await getStoreBookings(storeId);
      setBookings(data);
      setCurrentPage(1);

      // ถ้ามาจากการกด Notification ให้เปิดรายละเอียดการจองนั้นทันที
      const pendingBookingId = sessionStorage.getItem("openBookingId");
      if (pendingBookingId) {
        sessionStorage.removeItem("openBookingId");
        const idx = data.findIndex((b) => String(b.booking_id) === pendingBookingId);
        if (idx !== -1) {
          setCurrentPage(Math.floor(idx / bookingsPerPage) + 1);
          openDetail(data[idx]);
        }
      }
    } catch (err) {
      console.error("โหลดการจองผิดพลาด", err);
    }
  };

  const updateStatus = async (id, statusId) => {
    try {
      await updateBookingStatus(id, statusId);
      loadBookings();
    } catch (err) {
      console.error("อัปเดตสถานะผิดพลาด", err);
    }
  };

  const deleteBooking = async (id) => {
    try {
      await deleteBookingApi(id);
      loadBookings();
    } catch (err) {
      console.error("ลบผิดพลาด", err);
    }
  };

  const openDetail = async (b) => {
    setSelectedBooking(b);
    setSelectedDetail(null);
    setHistory([]);
    setReassignChoices([]);

    try {
      const [detailRows, historyRows] = await Promise.all([
        getBookingDetail(b.booking_id),
        getBookingHistory(b.booking_id),
      ]);

      setHistory(historyRows);

      if (detailRows && detailRows.length > 0) {
        const first = detailRows[0];
        const serviceIds = [...new Set(detailRows.map((r) => r.service_id))];
        setSelectedDetail({
          booking_date_iso: first.booking_date_iso,
          booking_time: first.booking_time,
          total_minutes: first.total_minutes,
          service_ids: serviceIds,
        });

        const choices = await getAvailableStaff(storeId, {
          date: first.booking_date_iso,
          time: first.booking_time,
          minutes: first.total_minutes,
          service_ids: serviceIds.join(","),
          exclude_booking_id: b.booking_id,
        });
        setReassignChoices(choices);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const reassignStaff = async (employeeId) => {
    if (!employeeId || !selectedBooking) return;
    try {
      await assignBookingStaff(selectedBooking.booking_id, {
        employee_id: Number(employeeId),
        reason: "ADMIN_CHANGE",
        changed_by: "admin",
      });
      await loadBookings();
      await openDetail({ ...selectedBooking });
    } catch (err) {
      console.error("เปลี่ยนพนักงานผิดพลาด", err);
    }
  };

  const statusMeta = (booking) => getStatusMeta(booking.status_booking_name, booking.cancelled_by);

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
      Swal.fire({ icon: "error", title: "อนุมัติไม่สำเร็จ", text: err?.response?.data?.error || "กรุณาลองใหม่อีกครั้ง" });
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
      Swal.fire({ icon: "error", title: "ดำเนินการไม่สำเร็จ", text: err?.response?.data?.error || "กรุณาลองใหม่อีกครั้ง" });
    }
  };

  const handleStoreRescheduleSubmit = async (payload) => {
    await storeRequestReschedule(storeRescheduleBooking.booking_id, payload);
    setStoreRescheduleBooking(null);
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
      <section className="manage manage-bookings-page">
        <div className="header">
          <div>
            <h1>การจอง</h1>
            <p>จัดการข้อมูลการจองทั้งหมดของร้าน</p>
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
                <th>พนักงาน</th>
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
                    <td>{b.employee_name || "-"}</td>
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

                      {b.status_booking_id === 5 ? (
                        <button
                          className="icon-btn reschedule"
                          title="ลูกค้าขอเลื่อนนัด -- ดูคำขอ"
                          onClick={() => openRescheduleReview(b)}
                        >
                          <FiClock />
                        </button>
                      ) : b.status_booking_id === 6 ? (
                        <button
                          className="icon-btn reschedule"
                          title="รอลูกค้ายืนยันการเลื่อนนัดที่ร้านเสนอ"
                          onClick={() => openRescheduleReview(b)}
                        >
                          <FiClock />
                        </button>
                      ) : (
                        <>
                          <button
                            className="icon-btn confirm"
                            onClick={() => updateStatus(b.booking_id, 2)}
                          >
                            <FiCheck />
                          </button>

                          <button
                            className="icon-btn cancel"
                            onClick={() => updateStatus(b.booking_id, 4)}
                          >
                            <FiX />
                          </button>

                          {b.status_booking_id === 2 && (
                            <button
                              className="icon-btn reschedule"
                              title="ขอเลื่อนนัด"
                              onClick={() => setStoreRescheduleBooking(b)}
                            >
                              <FiClock />
                            </button>
                          )}

                          <button
                            className="icon-btn delete"
                            onClick={() => deleteBooking(b.booking_id)}
                          >
                            <FiTrash2 />
                          </button>
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
          <div
            className="modal-overlay"
            onClick={() => setSelectedBooking(null)}
          >
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

                <p><strong>พนักงาน:</strong> {selectedBooking.employee_name || "ยังไม่กำหนด"}</p>
                <label>เปลี่ยนพนักงาน (แสดงเฉพาะที่ว่างจริงในช่วงเวลานี้)</label>
                <select
                  defaultValue=""
                  onChange={(e) => reassignStaff(e.target.value)}
                  disabled={!selectedDetail}
                >
                  <option value="">-- เลือกพนักงาน --</option>
                  {reassignChoices.map((e) => (
                    <option key={e.employee_id} value={e.employee_id}>
                      {e.fullname}
                    </option>
                  ))}
                </select>

                {history.length > 0 && (
                  <>
                    <p style={{ marginTop: 12 }}><strong>ประวัติการเปลี่ยนพนักงาน</strong></p>
                    <ul style={{ paddingLeft: 18, margin: 0 }}>
                      {history.map((h) => (
                        <li key={h.change_id} style={{ fontSize: "0.85rem", marginBottom: 4 }}>
                          {h.original_employee_name || "ยังไม่กำหนด"} → {h.new_employee_name || "ยังไม่กำหนด"}
                          {" "}({h.reason}) — {h.changed_at}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="cancel-btn"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal ทบทวนคำขอเลื่อนนัด (ลูกค้าขอ หรือ ร้านขอเอง) */}
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

      {/* Modal ร้านขอเลื่อนนัดให้ลูกค้า */}
      {storeRescheduleBooking && (
        <RescheduleRequestModal
          title="ขอเลื่อนนัดให้ลูกค้า"
          oldDateDisplay={storeRescheduleBooking.booking_date}
          oldTimeDisplay={storeRescheduleBooking.booking_time}
          minDate={new Date().toISOString().slice(0, 10)}
          submitLabel="ส่งคำขอเลื่อนนัด"
          onSubmit={handleStoreRescheduleSubmit}
          onClose={() => setStoreRescheduleBooking(null)}
        />
      )}
    </>
  );
}
