import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FiMapPin, FiPhone } from "react-icons/fi";
import "./BookingModals.css";
import {
  getBookingDetail,
  getRescheduleRequest,
  cancelBooking,
  requestReschedule,
  respondToReschedule,
} from "../callapi/call_api_booking";
import { getStatusMeta, isCustomerReschedulableStatus } from "../utils/bookingStatus";
import CancelBookingModal from "./CancelBookingModal";
import RescheduleRequestModal from "./RescheduleRequestModal";

const IMAGE_BASE_URL = "http://localhost:5010/static/images";

const TIMELINE_STEPS = ["จองคิว", "ร้านรับจอง", "ยืนยันวันและเวลา", "เข้ารับบริการ", "เสร็จสิ้น"];
const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

function formatThaiDate(isoDate) {
  if (!isoDate) return "-";
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return `${d} ${THAI_MONTHS[m - 1]} ${y}`;
}

function getTimelineCompletedCount(statusId) {
  if (statusId === 3) return 5;
  if ([2, 5, 6].includes(statusId)) return 3;
  return 1;
}

export default function BookingDetailModal({ booking, onClose, onChanged }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescheduleRequest, setRescheduleRequest] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const bookingId = booking.booking_id;

  const loadDetail = async () => {
    setLoading(true);
    try {
      const [rows, request] = await Promise.all([
        getBookingDetail(bookingId),
        getRescheduleRequest(bookingId).catch(() => null),
      ]);

      if (rows && rows.length > 0) {
        const first = rows[0];
        setDetail({
          ...first,
          services: rows.map((r) => r.service_name).filter(Boolean).join(", "),
        });
      }
      setRescheduleRequest(request && request.status === "pending" ? request : null);
    } catch (err) {
      console.error("โหลดรายละเอียดการจองผิดพลาด", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const handleCancelConfirm = async (reason) => {
    try {
      await cancelBooking(bookingId, reason);
      setShowCancelModal(false);
      await loadDetail();
      onChanged?.();
      Swal.fire({
        icon: "success",
        title: "ยกเลิกการจองสำเร็จ",
        showConfirmButton: false,
        timer: 1600,
        toast: true,
        position: "top-end",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "ยกเลิกไม่สำเร็จ",
        text: err?.response?.data?.error || "กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  const handleRescheduleSubmit = async (payload) => {
    await requestReschedule(bookingId, payload);
    setShowRescheduleModal(false);
    await loadDetail();
    onChanged?.();
    Swal.fire({
      icon: "success",
      title: "ส่งคำขอเลื่อนนัดแล้ว",
      text: "รอร้านพิจารณาคำขอของคุณ",
      showConfirmButton: false,
      timer: 1800,
      toast: true,
      position: "top-end",
    });
  };

  const handleStoreRescheduleResponse = async (accept) => {
    if (!rescheduleRequest) return;
    setActionLoading(true);
    try {
      await respondToReschedule(rescheduleRequest.request_id, accept);
      await loadDetail();
      onChanged?.();
      Swal.fire({
        icon: "success",
        title: accept ? "ยืนยันวันนัดใหม่แล้ว" : "ปฏิเสธการเลื่อนนัดแล้ว",
        showConfirmButton: false,
        timer: 1600,
        toast: true,
        position: "top-end",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "ดำเนินการไม่สำเร็จ",
        text: err?.response?.data?.error || "กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const statusId = detail?.status_booking_id;
  const statusMeta = getStatusMeta(detail?.status_booking_name, detail?.cancelled_by);
  const dateDisplay = formatThaiDate(detail?.booking_date_iso);
  const timeDisplay = detail?.booking_time || "-";

  return (
    <div className="bkm-overlay" onClick={onClose}>
      <div className="bkm-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bkm-header">
          <h3>รายละเอียดการจอง</h3>
          <button className="bkm-close-btn" onClick={onClose} aria-label="ปิด">×</button>
        </div>

        <div className="bkm-body">
          {loading || !detail ? (
            <div className="bkm-loading">กำลังโหลดรายละเอียด...</div>
          ) : (
            <>
              <div className="bkm-status-row">
                <span className={`status-badge ${statusMeta.className}`}>{statusMeta.label}</span>
              </div>

              <div className="bkm-store-block">
                {detail.store_image ? (
                  <img className="bkm-store-img" src={`${IMAGE_BASE_URL}/${detail.store_image}`} alt={detail.store_name} />
                ) : (
                  <div className="bkm-store-img bkm-placeholder">{(detail.store_name || "?")[0]}</div>
                )}
                <div>
                  <p className="bkm-store-name">{detail.store_name || "-"}</p>
                  <div className="bkm-store-meta">
                    {detail.store_address && <span><FiMapPin size={11} /> {detail.store_address}</span>}
                    {detail.store_phone && <span><FiPhone size={11} /> {detail.store_phone}</span>}
                  </div>
                </div>
              </div>

              <div className="bkm-section-title">รายละเอียดการจอง</div>
              <div className="bkm-row"><span className="bkm-row-label">เลขที่การจอง</span><span className="bkm-row-value">#{detail.booking_id}</span></div>
              <div className="bkm-row"><span className="bkm-row-label">วันที่</span><span className="bkm-row-value">{dateDisplay}</span></div>
              <div className="bkm-row"><span className="bkm-row-label">เวลา</span><span className="bkm-row-value">{timeDisplay} น.</span></div>
              <div className="bkm-row"><span className="bkm-row-label">บริการ</span><span className="bkm-row-value">{detail.services}</span></div>
              <div className="bkm-row"><span className="bkm-row-label">ช่าง</span><span className="bkm-row-value">{detail.employee_name || "ยังไม่กำหนด"}</span></div>
              <div className="bkm-row"><span className="bkm-row-label">ระยะเวลาโดยประมาณ</span><span className="bkm-row-value">{detail.total_minutes} นาที</span></div>
              <div className="bkm-row"><span className="bkm-row-label">ราคา</span><span className="bkm-row-value">฿{Number(detail.total_price).toLocaleString()}</span></div>
              {detail.customer_note && (
                <div className="bkm-row"><span className="bkm-row-label">หมายเหตุ</span><span className="bkm-row-value">{detail.customer_note}</span></div>
              )}
              {detail.created_at && (
                <div className="bkm-row"><span className="bkm-row-label">วันที่จอง</span><span className="bkm-row-value">{String(detail.created_at).slice(0, 16).replace("T", " ")}</span></div>
              )}

              {statusId !== 4 && (
                <>
                  <div className="bkm-section-title">สถานะ</div>
                  <div className="bkm-timeline">
                    {TIMELINE_STEPS.map((label, i) => {
                      const completed = getTimelineCompletedCount(statusId);
                      const cls = i < completed ? "done" : i === completed ? "current" : "";
                      return (
                        <div className={`bkm-timeline-step ${cls}`} key={label}>
                          <div className="bkm-timeline-dot" />
                          <div className="bkm-timeline-label">{label}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* กรณีถูกยกเลิก */}
              {statusId === 4 && (
                <div className="bkm-notice bkm-notice-danger">
                  <strong>{detail.cancelled_by === "store" ? "ยกเลิกโดยร้าน" : "ยกเลิกโดยลูกค้า"}</strong>
                  {detail.cancellation_reason ? `เหตุผล: ${detail.cancellation_reason}` : "ไม่ได้ระบุเหตุผล"}
                </div>
              )}

              {/* กรณีลูกค้าขอเลื่อน รอร้านพิจารณา */}
              {statusId === 5 && rescheduleRequest && (
                <div className="bkm-notice bkm-notice-info">
                  <strong>รอร้านพิจารณาการเลื่อนนัด</strong>
                  วันที่เสนอใหม่: {formatThaiDate(rescheduleRequest.proposed_date)} เวลา {String(rescheduleRequest.proposed_time).slice(0, 5)} น.
                  {rescheduleRequest.reason && ` · เหตุผล: ${rescheduleRequest.reason}`}
                </div>
              )}

              {/* กรณีร้านขอเลื่อน รอลูกค้าตอบรับ */}
              {statusId === 6 && rescheduleRequest && (
                <div className="bkm-notice bkm-notice-warning">
                  <strong>ร้านขอเปลี่ยนเวลานัดของคุณ</strong>
                  วันเดิม: {formatThaiDate(rescheduleRequest.old_date)} {String(rescheduleRequest.old_time).slice(0, 5)} น.
                  <br />
                  วันใหม่ที่ร้านเสนอ: {formatThaiDate(rescheduleRequest.proposed_date)} {String(rescheduleRequest.proposed_time).slice(0, 5)} น.
                  {rescheduleRequest.reason && (<><br />เหตุผล: {rescheduleRequest.reason}</>)}
                </div>
              )}

              {/* คำเตือนกฎ 2 วัน -- ใช้ร่วมกันทั้งยกเลิกและขอเลื่อนนัด */}
              {[1, 2].includes(statusId) && detail.cancellable === false && (
                <div className="bkm-notice bkm-notice-warning">
                  ไม่สามารถยกเลิกหรือขอเลื่อนนัดการจองนี้ได้ เนื่องจากเหลือน้อยกว่า 2 วันก่อนถึงวันนัด
                  หรือวันนัดผ่านไปแล้ว กรุณาติดต่อร้านโดยตรง
                </div>
              )}

              {/* ปุ่มจัดการ */}
              {statusId === 6 ? (
                <div className="bkm-actions bkm-actions-row">
                  <button className="bkm-btn bkm-btn-primary" disabled={actionLoading} onClick={() => handleStoreRescheduleResponse(true)}>
                    ยอมรับการเปลี่ยนแปลง
                  </button>
                  <button className="bkm-btn bkm-btn-danger" disabled={actionLoading} onClick={() => handleStoreRescheduleResponse(false)}>
                    ปฏิเสธ
                  </button>
                </div>
              ) : (statusId === 1 || statusId === 2) ? (
                <div className="bkm-actions bkm-actions-row">
                  {detail.cancellable && (
                    <button className="bkm-btn bkm-btn-danger" onClick={() => setShowCancelModal(true)}>
                      ยกเลิกการจอง
                    </button>
                  )}
                  {detail.cancellable && isCustomerReschedulableStatus(detail.status_booking_name) && (
                    <button className="bkm-btn bkm-btn-ghost" onClick={() => setShowRescheduleModal(true)}>
                      ขอเลื่อนนัด
                    </button>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {showCancelModal && detail && (
        <CancelBookingModal
          storeName={detail.store_name}
          dateDisplay={dateDisplay}
          timeDisplay={timeDisplay}
          serviceDisplay={detail.services}
          onConfirm={handleCancelConfirm}
          onClose={() => setShowCancelModal(false)}
        />
      )}

      {showRescheduleModal && detail && (
        <RescheduleRequestModal
          title="ขอเลื่อนนัด"
          oldDateDisplay={dateDisplay}
          oldTimeDisplay={timeDisplay}
          minDate={new Date().toISOString().slice(0, 10)}
          onSubmit={handleRescheduleSubmit}
          onClose={() => setShowRescheduleModal(false)}
        />
      )}
    </div>
  );
}
