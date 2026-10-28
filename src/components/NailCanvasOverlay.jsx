import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { FINGER_ORDER } from "../hooks/useHandLandmarks";
import "./NailCanvasOverlay.css";

// PRNG แบบ seed คงที่ ใช้วาดจุดกากเพชร/ลายหินอ่อนให้ตำแหน่งเดิมทุกครั้งที่ finger/สี/ลายเดิม
function seededRandom(seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (Math.imul(31, h) + seedStr.charCodeAt(i)) | 0;
  return () => {
    h = (h ^ (h << 13)) | 0;
    h = (h ^ (h >>> 17)) | 0;
    h = (h ^ (h << 5)) | 0;
    return ((h >>> 0) % 10000) / 10000;
  };
}

function hexToRgb(hex) {
  const m = hex.replace("#", "");
  return {
    r: parseInt(m.slice(0, 2), 16),
    g: parseInt(m.slice(2, 4), 16),
    b: parseInt(m.slice(4, 6), 16),
  };
}

function desaturate(hex, amount = 0.45) {
  const { r, g, b } = hexToRgb(hex);
  const avg = (r + g + b) / 3;
  const mix = (c) => Math.round(c + (avg - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function lighten(hex, amount = 0.5) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

// วาดฐานสี ตาม Finish ที่เลือก (Cream / Matte / Jelly / Sheer / Shimmer / Chrome)
function paintFinish(ctx, w, h, hex, finish, rand) {
  ctx.globalCompositeOperation = "multiply";

  if (finish === "chrome") {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#cfd8dc");
    grad.addColorStop(0.35, "#ffffff");
    grad.addColorStop(0.6, "#9aa5ab");
    grad.addColorStop(1, "#e8edf0");
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    return;
  }

  if (finish === "matte") {
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = desaturate(hex, 0.28);
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    return;
  }

  if (finish === "jelly" || finish === "sheer") {
    ctx.globalAlpha = finish === "jelly" ? 0.5 : 0.3;
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.14;
    const gloss = ctx.createLinearGradient(0, 0, 0, h);
    gloss.addColorStop(0, "#ffffff");
    gloss.addColorStop(1, "transparent");
    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    return;
  }

  if (finish === "shimmer") {
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < 26; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const r = 0.4 + rand() * 0.9;
      ctx.globalAlpha = 0.35 + rand() * 0.4;
      ctx.fillStyle = rand() > 0.5 ? "#fffdf0" : "#ffe9b0";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return;
  }

  // cream (default)
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.16;
  const gloss = ctx.createLinearGradient(0, 0, 0, h);
  gloss.addColorStop(0, "#ffffff");
  gloss.addColorStop(0.4, "transparent");
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
}

// วาดลายทับบนฐานสี (Minimal / French / Glitter / Ombre / Marble / Floral / Line Art / Chrome)
function paintPattern(ctx, w, h, hex, pattern, rand) {
  if (!pattern || pattern === "minimal") return;

  if (pattern === "french") {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = "#fbf7f1";
    ctx.beginPath();
    ctx.ellipse(w / 2, 0, w * 0.62, h * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    return;
  }

  if (pattern === "glitter") {
    ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < 34; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const r = 0.5 + rand() * 1.1;
      ctx.globalAlpha = 0.45 + rand() * 0.5;
      ctx.fillStyle = rand() > 0.4 ? "#ffffff" : "#f4d78c";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return;
  }

  if (pattern === "ombre") {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.85;
    const grad = ctx.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0, hex);
    grad.addColorStop(1, lighten(hex, 0.75));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    return;
  }

  if (pattern === "marble") {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    for (let i = 0; i < 4; i++) {
      ctx.lineWidth = 0.6 + rand() * 0.8;
      ctx.globalAlpha = 0.4 + rand() * 0.3;
      ctx.beginPath();
      const sx = rand() * w;
      const sy = 0;
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(
        rand() * w, h * 0.35,
        rand() * w, h * 0.65,
        rand() * w, h
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    return;
  }

  if (pattern === "floral") {
    ctx.globalCompositeOperation = "source-over";
    const cx = w / 2;
    const cy = h * 0.78;
    const petalR = w * 0.14;
    ctx.globalAlpha = 0.9;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.cos(angle) * petalR,
        cy + Math.sin(angle) * petalR,
        petalR * 0.62,
        petalR * 0.4,
        angle,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.fillStyle = "#f4d78c";
    ctx.beginPath();
    ctx.arc(cx, cy, petalR * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    return;
  }

  if (pattern === "line-art") {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = Math.max(0.6, w * 0.03);
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.75 - i * 0.15;
      ctx.beginPath();
      ctx.moveTo(0, h * (0.25 + i * 0.22));
      ctx.lineTo(w, h * (0.05 + i * 0.22));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    return;
  }

  if (pattern === "chrome") {
    paintFinish(ctx, w, h, hex, "chrome", rand);
  }
}

function drawNail(ctx, canvasW, canvasH, rect, nailDesign, isActive) {
  const cx = (rect.x / 100) * canvasW;
  const cy = (rect.y / 100) * canvasH;
  const w = (rect.widthPct / 100) * canvasW;
  const h = (rect.heightPct / 100) * canvasH;
  const rot = ((rect.rotationDeg || 0) * Math.PI) / 180;
  const radius = Math.min(w, h) * 0.42;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);

  const path = new Path2D();
  path.moveTo(-w / 2 + radius, -h / 2);
  path.arcTo(w / 2, -h / 2, w / 2, h / 2, radius);
  path.arcTo(w / 2, h / 2, -w / 2, h / 2, radius);
  path.arcTo(-w / 2, h / 2, -w / 2, -h / 2, radius);
  path.arcTo(-w / 2, -h / 2, w / 2, -h / 2, radius);
  path.closePath();

  if (nailDesign) {
    ctx.save();
    ctx.clip(path);
    ctx.translate(-w / 2, -h / 2);
    const rand = seededRandom(`${nailDesign.hex}-${nailDesign.pattern}-${rect.x.toFixed(0)}`);
    paintFinish(ctx, w, h, nailDesign.hex, nailDesign.finish, rand);
    paintPattern(ctx, w, h, nailDesign.hex, nailDesign.pattern, rand);
    ctx.restore();
  }

  if (isActive) {
    ctx.strokeStyle = "#B76585";
    ctx.lineWidth = Math.max(1.2, w * 0.035);
    ctx.stroke(path);
  }

  ctx.restore();
}

// Canvas สำหรับ overlay สี/ลายเล็บลงบนรูปมือจริง วาดที่ความละเอียดเต็มของรูปเสมอ
// เพื่อให้ export ออกมาเป็นภาพคมชัด ไม่มี UI ใด ๆ ติดไปกับภาพ
const NailCanvasOverlay = forwardRef(function NailCanvasOverlay(
  { imageUrl, landmarks, design, activeFinger, showMarkers = false, onDragLandmark },
  ref
) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const imgElRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const dragState = useRef(null);

  useEffect(() => {
    if (!imageUrl) return;
    setImgLoaded(false);
    const img = new Image();
    img.onload = () => {
      imgElRef.current = img;
      setImgLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const redraw = () => {
    const canvas = canvasRef.current;
    const img = imgElRef.current;
    if (!canvas || !img || !imgLoaded) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    FINGER_ORDER.forEach((finger) => {
      const rect = landmarks?.[finger];
      if (!rect) return;
      const nailDesign = design?.[finger];
      const isActive = activeFinger !== "all" && activeFinger === finger;
      drawNail(ctx, canvas.width, canvas.height, rect, nailDesign, isActive);
    });
  };

  useEffect(() => {
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgLoaded, landmarks, design, activeFinger]);

  useImperativeHandle(ref, () => ({
    exportPNG: () => {
      redraw();
      return canvasRef.current?.toDataURL("image/png") || null;
    },
  }));

  const handlePointerDown = (finger) => (e) => {
    e.preventDefault();
    dragState.current = { finger, pointerId: e.pointerId };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const bounds = wrap.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - bounds.top) / bounds.height) * 100));
    onDragLandmark?.(drag.finger, { x, y });
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  return (
    <div
      className="nail-canvas-wrap"
      ref={wrapRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <canvas ref={canvasRef} className="nail-canvas" />
      {showMarkers &&
        FINGER_ORDER.map((finger) => {
          const rect = landmarks?.[finger];
          if (!rect) return null;
          return (
            <div
              key={finger}
              className={`nail-marker ${activeFinger === finger ? "active" : ""}`}
              style={{ left: `${rect.x}%`, top: `${rect.y}%` }}
              onPointerDown={handlePointerDown(finger)}
            />
          );
        })}
    </div>
  );
});

export default NailCanvasOverlay;
