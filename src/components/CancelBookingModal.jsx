import { useState } from "react";
import "./BookingModals.css";

export default function CancelBookingModal({ storeName, dateDisplay, timeDisplay, serviceDisplay, onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(reason);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bkm-overlay bkm-nested" onClick={onClose}>
      <div className="bkm-sheet bkm-small" onClick={(e) => e.stopPropagation()}>
        <div className="bkm-header">
          <h3>ยืนยันการยกเลิกการจอง?</h3>
          <button className="bkm-close-btn" onClick={onClose} aria-label="ปิด">×</button>
        </div>
        <div className="bkm-body">
          <p style={{ margin: "0 0 16px", color: "#94727f", fontSize: 13.5 }}>
            คุณต้องการยกเลิกการจองบริการนี้ใช่หรือไม่
          </p>

          <div className="bkm-row"><span className="bkm-row-label">ร้าน</span><span className="bkm-row-value">{storeName}</span></div>
          <div className="bkm-row"><span className="bkm-row-label">วันที่</span><span className="bkm-row-value">{dateDisplay}</span></div>
          <div className="bkm-row"><span className="bkm-row-label">เวลา</span><span className="bkm-row-value">{timeDisplay} น.</span></div>
          <div className="bkm-row"><span className="bkm-row-label">บริการ</span><span className="bkm-row-value">{serviceDisplay}</span></div>

          <div className="bkm-field" style={{ marginTop: 16 }}>
            <label>เหตุผล (ถ้ามี)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ระบุเหตุผลที่ต้องการยกเลิก..."
            />
          </div>

          <div className="bkm-actions">
            <button className="bkm-btn bkm-btn-danger" onClick={handleConfirm} disabled={loading}>
              {loading ? "กำลังยกเลิก..." : "ยกเลิกการจอง"}
            </button>
            <button className="bkm-btn bkm-btn-ghost" onClick={onClose} disabled={loading}>
              กลับไป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
