import { useEffect, useRef, useState } from "react";
import { FiCamera, FiX, FiRefreshCw } from "react-icons/fi";
import "./CameraCapture.css";

// Modal ถ่ายภาพจากกล้องอุปกรณ์ ใช้ร่วมกันได้ทุกจุดที่ต้องการรูปมือ (เช่นหน้า Analyze)
// คืนค่ารูปที่ถ่ายเป็น data URL ผ่าน onCapture แล้วปิดตัวเองให้อัตโนมัติ
export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setError("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้อง หรือเลือกรูปจากอุปกรณ์แทน");
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleShoot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL("image/jpeg", 0.92));
  };

  return (
    <div className="cam-overlay" onClick={onClose}>
      <div className="cam-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cam-header">
          <span>ถ่ายภาพมือของคุณ</span>
          <button className="cam-close" onClick={onClose} aria-label="ปิด">
            <FiX />
          </button>
        </div>

        <div className="cam-viewport">
          {error ? (
            <div className="cam-error">{error}</div>
          ) : (
            <video ref={videoRef} playsInline muted />
          )}
        </div>

        <div className="cam-actions">
          <button className="btn-luxury" onClick={handleShoot} disabled={!ready}>
            <FiCamera /> ถ่ายภาพ
          </button>
          <button className="cam-retry" onClick={onClose}>
            <FiRefreshCw /> ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}
