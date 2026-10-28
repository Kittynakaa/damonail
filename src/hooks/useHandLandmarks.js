import { useEffect, useRef, useState } from "react";

// นิ้ว 5 นิ้ว: [ปลายนิ้ว(tip), ข้อกลาง(dip)] ตาม index ของ MediaPipe HandLandmarker (21 จุด)
const FINGER_LANDMARKS = {
  thumb: { tip: 4, dip: 3 },
  index: { tip: 8, dip: 7 },
  middle: { tip: 12, dip: 11 },
  ring: { tip: 16, dip: 15 },
  pinky: { tip: 20, dip: 19 },
};

export const FINGER_ORDER = ["thumb", "index", "middle", "ring", "pinky"];

// ตำแหน่งเริ่มต้น (สัดส่วน % ของรูป) ใช้ตอนตรวจจับมือไม่สำเร็จ ผู้ใช้ลากปรับเองได้
const DEFAULT_LANDMARKS = {
  thumb: { x: 24, y: 62, widthPct: 7, heightPct: 11, rotationDeg: -35 },
  index: { x: 38, y: 30, widthPct: 6.5, heightPct: 11, rotationDeg: -8 },
  middle: { x: 52, y: 20, widthPct: 6.5, heightPct: 11.5, rotationDeg: 0 },
  ring: { x: 65, y: 25, widthPct: 6.5, heightPct: 11, rotationDeg: 8 },
  pinky: { x: 77, y: 38, widthPct: 5.5, heightPct: 9.5, rotationDeg: 18 },
};

let landmarkerPromise = null;

// โหลด HandLandmarker แบบ lazy (ครั้งเดียวต่อ session) เพื่อไม่ให้ bundle หลักหนักขึ้นโดยไม่จำเป็น
function loadHandLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { HandLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      return HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "IMAGE",
        numHands: 1,
      });
    })();
  }
  return landmarkerPromise;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

// แปลงจุด landmark ดิบ (0-1 normalized) ของแต่ละนิ้ว เป็นตำแหน่ง/ขนาด/มุมของกรอบเล็บ (% ของรูป)
function computeNailRectsFromLandmarks(points) {
  const rects = {};
  for (const finger of FINGER_ORDER) {
    const { tip, dip } = FINGER_LANDMARKS[finger];
    const p1 = points[tip];
    const p2 = points[dip];
    if (!p1 || !p2) {
      rects[finger] = DEFAULT_LANDMARKS[finger];
      continue;
    }
    const dx = (p1.x - p2.x) * 100;
    const dy = (p1.y - p2.y) * 100;
    const segLenPct = Math.hypot(dx, dy);
    const rotationDeg = toDeg(Math.atan2(dx, -dy));
    // เล็บอยู่ค่อนไปทางปลายนิ้ว: เยื้องจาก tip เข้าหา dip เล็กน้อย
    const nailCenterX = p1.x * 100 - dx * 0.18;
    const nailCenterY = p1.y * 100 - dy * 0.18;
    rects[finger] = {
      x: nailCenterX,
      y: nailCenterY,
      widthPct: Math.max(3.5, segLenPct * 0.58),
      heightPct: Math.max(6, segLenPct * 0.62),
      rotationDeg,
    };
  }
  return rects;
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ตรวจจับตำแหน่งเล็บอัตโนมัติจากรูปมือด้วย MediaPipe Hand Landmarker
// ถ้าตรวจจับไม่สำเร็จ (โหลดโมเดลไม่ได้ / ไม่พบมือในรูป) จะ fallback เป็นตำแหน่งเริ่มต้นให้ลากปรับเอง
export default function useHandLandmarks(imageUrl) {
  const [landmarks, setLandmarks] = useState(DEFAULT_LANDMARKS);
  const [mode, setMode] = useState("idle"); // idle | loading | auto | manual
  const currentImageRef = useRef(null);

  useEffect(() => {
    if (!imageUrl) {
      setMode("idle");
      return;
    }
    let cancelled = false;
    currentImageRef.current = imageUrl;
    setMode("loading");

    (async () => {
      try {
        const [landmarker, imgEl] = await Promise.all([
          loadHandLandmarker(),
          loadImageElement(imageUrl),
        ]);
        if (cancelled || currentImageRef.current !== imageUrl) return;

        const result = landmarker.detect(imgEl);
        const hand = result?.landmarks?.[0];
        if (!hand) throw new Error("no hand detected");

        const rects = computeNailRectsFromLandmarks(hand);
        if (cancelled) return;
        setLandmarks(rects);
        setMode("auto");
      } catch {
        if (cancelled) return;
        setLandmarks(DEFAULT_LANDMARKS);
        setMode("manual");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  const updateLandmark = (finger, patch) => {
    setLandmarks((prev) => ({ ...prev, [finger]: { ...prev[finger], ...patch } }));
  };

  const resetLandmarks = () => setLandmarks(DEFAULT_LANDMARKS);

  return { landmarks, mode, updateLandmark, resetLandmarks, FINGER_ORDER };
}
