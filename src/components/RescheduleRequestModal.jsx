import { useState } from "react";
import "./BookingModals.css";

const REASON_OPTIONS = [
  "ไม่สะดวกในวันดังกล่าว",
  "มีธุระ",
  "ต้องการเปลี่ยนเวลา",
  "อื่น ๆ",
];

export default function RescheduleRequestModal({
  title = "ขอเลื่อนนัด",
  oldDateDisplay,
  oldTimeDisplay,
  minDate,
  onSubmit,
  onClose,
  submitLabel = "ส่งคำขอเลื่อนนัด",
}) {
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [reasonOption, setReasonOption] = useState(REASON_OPTIONS[0]);
  const [reasonDetail, setReasonDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!proposedDate || !proposedTime) {
      setError("กรุณาเลือกวันและเวลาที่ต้องการใหม่");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const reason = reasonOption === "อื่น ๆ" && reasonDetail
        ? reasonDetail
        : [reasonOption, reasonDetail].filter(Boolean).join(" - ");

      await onSubmit({ proposed_date: proposedDate, proposed_time: proposedTime, reason });
    } catch (err) {
      setError(err?.response?.data?.error || "ส่งคำขอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bkm-overlay bkm-nested" onClick={onClose}>
      <div className="bkm-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bkm-header">
          <h3>{title}</h3>
          <button className="bkm-close-btn" onClick={onClose} aria-label="ปิด">×</button>
        </div>
        <div className="bkm-body">
          <div className="bkm-old-datetime">
            <strong>วันนัดเดิม</strong>
            {oldDateDisplay} · {oldTimeDisplay} น.
          </div>

          <div className="bkm-field-row">
            <div className="bkm-field">
              <label>วันที่ต้องการใหม่</label>
              <input
                type="date"
                min={minDate}
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
              />
            </div>
            <div className="bkm-field">
              <label>เวลาที่ต้องการใหม่</label>
              <input
                type="time"
                value={proposedTime}
                onChange={(e) => setProposedTime(e.target.value)}
              />
            </div>
          </div>

          <div className="bkm-field">
            <label>เหตุผลที่ต้องการเลื่อนนัด</label>
            <select value={reasonOption} onChange={(e) => setReasonOption(e.target.value)}>
              {REASON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="bkm-field">
            <label>รายละเอียดเพิ่มเติม (ถ้ามี)</label>
            <textarea
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              placeholder="พิมพ์รายละเอียดเพิ่มเติม..."
            />
          </div>

          {error && (
            <div className="bkm-notice bkm-notice-danger">{error}</div>
          )}

          <div className="bkm-actions">
            <button className="bkm-btn bkm-btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "กำลังส่งคำขอ..." : submitLabel}
            </button>
            <button className="bkm-btn bkm-btn-ghost" onClick={onClose} disabled={loading}>
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
