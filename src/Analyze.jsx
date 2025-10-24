import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Analyze.css"; // ใช้ CSS ที่ prefix ด้วย .Analyze-root

// ===== helpers =====
const clamp = (v, mi, ma) => Math.max(mi, Math.min(ma, v));
const rgbToHex = (r, g, b) =>
  ("#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")).toUpperCase();

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const M = Math.max(r, g, b), m = Math.min(r, g, b);
  let h, s, l = (M + m) / 2;
  if (M === m) { h = s = 0; }
  else {
    const d = M - m;
    s = l > 0.5 ? d / (2 - M - m) : d / (M + m);
    switch (M) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h *= 60;
  }
  return { h, s, l };
}

function rgbToLabApprox(r, g, b) {
  const sr = [r, g, b]
    .map((v) => v / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  const [R, G, B] = sr;
  const X = R * 0.4124 + G * 0.3576 + B * 0.1805;
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const Z = R * 0.0193 + G * 0.1192 + B * 0.9505;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(X / 0.95047), fy = f(Y / 1), fz = f(Z / 1.08883);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

// ===== palettes & shapes =====
const PALETTES = {
  warm: [
    { hex: "#E3735E", name: "Coral Clay" }, { hex: "#C77966", name: "Caramel Latte" },
    { hex: "#A64B2A", name: "Terracotta" }, { hex: "#D8A25E", name: "Honey Beige" },
    { hex: "#DB5461", name: "Guava Red" }, { hex: "#E6A57E", name: "Apricot Nude" },
    { hex: "#F28C28", name: "Pumpkin" }, { hex: "#AD6C80", name: "Dusty Mauve" },
    { hex: "#8F6A2A", name: "Olive Gold" }, { hex: "#B87333", name: "Copper" },
    { hex: "#C65353", name: "Brick Rose" }, { hex: "#C7794D", name: "Butterscotch" },
  ],
  cool: [
    { hex: "#CC8899", name: "Antique Rose" }, { hex: "#9B6BB3", name: "Lilac Mist" },
    { hex: "#6D8DAA", name: "Slate" }, { hex: "#C55F90", name: "Raspberry" },
    { hex: "#4B6CB7", name: "Indigo" }, { hex: "#9EB3C2", name: "Frost" },
    { hex: "#7E5A9B", name: "Amethyst" }, { hex: "#4E6E81", name: "Steel Blue" },
    { hex: "#A15EA7", name: "Orchid" }, { hex: "#8AA4A7", name: "Sea Glass" },
    { hex: "#B76E79", name: "Rosewood" }, { hex: "#6FA3C8", name: "Powder Blue" },
  ],
  neutral: [
    { hex: "#BC8F8F", name: "Warm Taupe" }, { hex: "#C2B280", name: "Sand" },
    { hex: "#BDA7A0", name: "Blush Beige" }, { hex: "#977C6D", name: "Cocoa" },
    { hex: "#A39887", name: "Mushroom" }, { hex: "#8B6C5C", name: "Mocha" },
    { hex: "#B69B8F", name: "Rose Beige" }, { hex: "#9C8F7A", name: "Stone" },
    { hex: "#C8B7A6", name: "Oat Milk" }, { hex: "#7F675B", name: "Latte" },
    { hex: "#B99976", name: "Almond" }, { hex: "#8D7F70", name: "Soft Mink" },
  ],
};

const SHAPES = [
  { id: "squoval", name: "Squoval", tip: "อเนกประสงค์" },
  { id: "oval", name: "Oval", tip: "นิ้วยาว เรียบหรู" },
  { id: "almond", name: "Almond", tip: "เรียวสวย" },
  { id: "square", name: "Square", tip: "เท่ ชิค" },
  { id: "round", name: "Round", tip: "ธรรมชาติ" },
  { id: "coffin", name: "Coffin", tip: "ลุคจัดเต็ม" },
  { id: "stiletto", name: "Stiletto", tip: "สายแฟ" },
];

function nailSVG(id, hex = "#E3735E") {
  const base = `<rect x="22" y="8" rx="16" ry="16" width="16" height="64" fill="${hex}" opacity=".95"/><rect x="18" y="6" width="24" height="76" rx="12" fill="url(#g)"/>`;
  let tip = "";
  switch (id) {
    case "round": tip = `<ellipse cx="30" cy="70" rx="8" ry="6" fill="${hex}"/>`; break;
    case "squoval": tip = `<rect x="22" y="60" width="16" height="12" rx="4" fill="${hex}"/>`; break;
    case "oval": tip = `<ellipse cx="30" cy="72" rx="7" ry="10" fill="${hex}"/>`; break;
    case "almond": tip = `<path d="M23,70 Q30,78 37,70 Q30,60 23,70Z" fill="${hex}"/>`; break;
    case "square": tip = `<rect x="22" y="66" width="16" height="8" rx="0" fill="${hex}"/>`; break;
    case "coffin": tip = `<path d="M24,66 L36,66 L34,74 L26,74 Z" fill="${hex}"/>`; break;
    case "stiletto": tip = `<path d="M30,58 L35,76 L25,76 Z" fill="${hex}"/>`; break;
    default: break;
  }
  return `<svg class="svg" viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".06"/></linearGradient></defs>${base}${tip}</svg>`;
}

const SAMPLE_URLS = [
  "https://images.unsplash.com/photo-1604908554027-8124d8499c02?q=80&w=800",
  "https://images.unsplash.com/photo-1607330288403-5da3c2fba5b6?q=80&w=800",
  "https://images.unsplash.com/photo-1603652435157-5d401e33ad49?q=80&w=800",
  "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=800",
];

export default function Analyze() {
  // canvas & sampler refs
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const samplerRef = useRef(null);
  const dropRef = useRef(null);

  // image object
  const imgRef = useRef(new Image());

  // drag sampler state
  const R = 75;
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // UI state
  const [hasImage, setHasImage] = useState(false);
  const [hex, setHex] = useState("—");
  const [rgbText, setRgbText] = useState("rgb(—)");
  const [dotColor, setDotColor] = useState("#ddd");

  const [depth, setDepth] = useState("—");
  const [undertone, setUndertone] = useState("—");
  const [confidence, setConfidence] = useState(null);
  const [lab, setLab] = useState({ L: null, a: null, b: null });

  const [tips, setTips] = useState([]);
  const [swatches, setSwatches] = useState([]);
  const [shapes, setShapes] = useState([]); // {id,name,tip,active,svg}
  const [activeShapeId, setActiveShapeId] = useState(null);

  // copy with toast
  const [toast, setToast] = useState("");
  const showToast = useCallback((text) => {
    setToast(text);
    setTimeout(() => setToast(""), 1100);
  }, []);

  // ===== load image into canvas (scale to width) =====
  const drawImageFit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const img = imgRef.current;
    const maxW = (previewRef.current?.clientWidth || 540);
    const scale = Math.min(1, maxW / img.width);

    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, []);

  const setEmpty = useCallback((on) => setHasImage(!on), []);

  const loadImage = useCallback((src) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      // ให้ preview โผล่ก่อน แล้วค่อยวาด เพื่อให้วัดขนาดได้
      setEmpty(false);
      requestAnimationFrame(() => {
        drawImageFit();
        centerSampler();
        doSample();
      });
    };
    // เพิ่ม cache-buster สำหรับ URL ภายนอก ป้องกัน CORS แคชเพี้ยน
    if (/^https?:\/\//.test(src)) {
      try {
        const u = new URL(src);
        u.searchParams.set("_", Date.now().toString());
        img.src = u.toString();
      } catch {
        img.src = src;
      }
    } else {
      img.src = src;
    }
  }, [drawImageFit, setEmpty]);

  // ===== sampler positioning =====
  const centerSampler = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    moveSampler(canvas.width / 2, canvas.height / 2);
  }, []);

  const moveSampler = useCallback((cx, cy) => {
    const canvas = canvasRef.current;
    const sampler = samplerRef.current;
    if (!canvas || !sampler) return;
    const x = clamp(cx, R, canvas.width - R);
    const y = clamp(cy, R, canvas.height - R);
    sampler.style.left = `${x - R}px`;
    sampler.style.top = `${y - R}px`;
  }, []);

  // ===== sampling color =====
  const doSample = useCallback(() => {
    const canvas = canvasRef.current;
    const sampler = samplerRef.current;
    if (!canvas || !sampler || !canvas.width) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const cx = sampler.offsetLeft + R;
    const cy = sampler.offsetTop + R;
    const r = R - 4;

    const sx = Math.max(0, cx - r);
    const sy = Math.max(0, cy - r);
    const sw = Math.min(canvas.width - sx, r * 2);
    const sh = Math.min(canvas.height - sy, r * 2);

    const data = ctx.getImageData(sx, sy, sw, sh).data;
    let rs = 0, gs = 0, bs = 0, n = 0;

    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const dx = x - (r - (cx - sx));
        const dy = y - (r - (cy - sy));
        if (dx * dx + dy * dy > r * r) continue;
        const idx = (y * sw + x) * 4;
        rs += data[idx];
        gs += data[idx + 1];
        bs += data[idx + 2];
        n++;
      }
    }
    if (!n) return;
    const rAvg = Math.round(rs / n), gAvg = Math.round(gs / n), bAvg = Math.round(bs / n);
    const h = rgbToHex(rAvg, gAvg, bAvg);
    setHex(h);
    setRgbText(`rgb(${rAvg}, ${gAvg}, ${bAvg})`);
    setDotColor(h);
  }, []);

  // ===== analyze =====
  const analyze = useCallback(() => {
    const m = rgbText.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!m) {
      alert("ยังไม่มีรูปหรือยังไม่ได้วางวงวัดบนผิว");
      return;
    }
    const r = +m[1], g = +m[2], b = +m[3];
    const { h, s, l } = rgbToHsl(r, g, b);
    const { L, a, b: bb } = rgbToLabApprox(r, g, b);

    let _depth = "Fair";
    if (l >= 0.78) _depth = "Fair";
    else if (l >= 0.60) _depth = "Medium";
    else if (l >= 0.42) _depth = "Tan";
    else _depth = "Deep";

    let _tone = "Neutral";
    if ((r - b > 18 && a > 6 && bb > 6) || (h >= 10 && h <= 70 && s > 0.20)) _tone = "Warm";
    else if ((b >= r && a < 6) || (h >= 200 && h <= 260)) _tone = "Cool";

    const dist = Math.sqrt(a * a + bb * bb);
    const conf = clamp(Math.round(s * 100 * 0.6 + dist * 0.8), 40, 96);

    setDepth(_depth);
    setUndertone(_tone);
    setConfidence(conf);
    setLab({ L, a, b: bb });

    const t = [];
    if (_tone === "Warm") t.push("โทนส้ม/พีช/คาราเมลละมุน");
    if (_tone === "Cool") t.push("ชมพูอมฟ้า/ม่วงพาสเทล");
    if (_tone === "Neutral") t.push("นู้ดตุ่นใช้ง่าย");
    if (_depth === "Deep") t.push("เฉดเข้ม/เมทัลลิกคอนทราสต์");
    if (_depth === "Fair") t.push("พาสเทล/นู้ดชมพูใส");
    setTips(t);

    const baseKey = (_tone || "neutral").toLowerCase();
    const base = PALETTES[baseKey] || PALETTES.neutral;
    const adj = (hex, amt) => {
      let rr = parseInt(hex.slice(1, 3), 16);
      let gg = parseInt(hex.slice(3, 5), 16);
      let bb2 = parseInt(hex.slice(5, 7), 16);
      rr = clamp(rr + amt, 0, 255);
      gg = clamp(gg + amt, 0, 255);
      bb2 = clamp(bb2 + amt, 0, 255);
      return rgbToHex(rr, gg, bb2);
    };
    let delta = 0;
    if (_depth === "Fair") delta = -20;
    else if (_depth === "Tan") delta = +10;
    else if (_depth === "Deep") delta = +25;
    const recs = base.slice(0, 12).map((c) => ({ hex: adj(c.hex, delta), name: c.name }));
    setSwatches(recs);

    const scored = (() => {
      const score = { round: 2, squoval: 5, oval: 4, almond: 5, square: 3, coffin: 2, stiletto: 1 };
      if (_depth === "Fair") { score.oval++; score.round++; }
      if (_depth === "Medium") { score.squoval++; score.almond++; }
      if (_depth === "Tan") { score.almond += 2; score.square++; score.coffin++; }
      if (_depth === "Deep") { score.almond++; score.coffin += 2; score.square++; }
      if (_tone === "Warm") { score.almond++; score.squoval++; }
      if (_tone === "Cool") { score.oval++; score.square++; }
      if (_tone === "Neutral") { score.round++; score.squoval++; }
      return SHAPES.map((s) => ({ ...s, score: score[s.id] })).sort((a, b) => b.score - a.score);
    })();

    const topIds = new Set(scored.slice(0, 4).map((s) => s.id));
    const ordered = [
      ...scored.filter((s) => topIds.has(s.id)),
      ...scored.filter((s) => !topIds.has(s.id)),
    ];

    setShapes(
      ordered.map((s, idx) => ({
        ...s,
        active: idx === 0,
        svg: nailSVG(s.id, hex),
      }))
    );
    setActiveShapeId(ordered[0]?.id || null);
  }, [rgbText, hex]);

  // ===== swatch click (copy + update sample nail color) =====
  const onClickSwatch = useCallback((colorHex) => {
    navigator.clipboard?.writeText(colorHex);
    showToast("คัดลอกสีแล้ว");
    setShapes((prev) =>
      prev.map((s) =>
        s.id === activeShapeId ? { ...s, svg: nailSVG(s.id, colorHex) } : s
      )
    );
  }, [activeShapeId, showToast]);

  // ===== shape click =====
  const onClickShape = useCallback((id) => {
    setActiveShapeId(id);
    setShapes((prev) =>
      prev.map((s) => ({
        ...s,
        active: s.id === id,
        svg: s.id === id ? nailSVG(s.id, hex) : s.svg,
      }))
    );
  }, [hex]);

  // ===== handlers: file picking, drag & drop, paste =====
  const fileInputRef = useRef(null);
  const onPick = useCallback(() => fileInputRef.current?.click(), []);
  const onChangeFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => loadImage(ev.target.result);
    r.readAsDataURL(f);
  }, [loadImage]);

  const onUseSample = useCallback(() => {
    loadImage("https://images.unsplash.com/photo-1604908554027-8124d8499c02?q=80&w=1400");
  }, [loadImage]);

  const onPaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const it of items) {
        const imgType = it.types.find((t) => t.startsWith("image/"));
        if (imgType) {
          const blob = await it.getType(imgType);
          const url = URL.createObjectURL(blob);
          loadImage(url);
          break;
        }
      }
    } catch {
      alert("เบราว์เซอร์ไม่อนุญาตการอ่านคลิปบอร์ด");
    }
  }, [loadImage]);

  // paste from OS
  useEffect(() => {
    const onWinPaste = (e) => {
      const file = [...e.clipboardData.items]
        .find((it) => it.type.startsWith("image/"))
        ?.getAsFile();
      if (file) {
        const r = new FileReader();
        r.onload = (ev) => loadImage(ev.target.result);
        r.readAsDataURL(file);
      }
    };
    window.addEventListener("paste", onWinPaste);
    return () => window.removeEventListener("paste", onWinPaste);
  }, [loadImage]);

  // drag & drop (รองรับทั้ง dataTransfer.items และ files)
  useEffect(() => {
    const drop = dropRef.current;
    if (!drop) return;
    const onEnter = (e) => { e.preventDefault(); drop.classList.add("drag"); };
    const onOver  = (e) => { e.preventDefault(); };
    const onLeave = (e) => { e.preventDefault(); drop.classList.remove("drag"); };
    const onDrop  = (e) => {
      e.preventDefault();
      drop.classList.remove("drag");

      let file = null;
      const items = e.dataTransfer?.items;
      if (items && items.length) {
        for (const it of items) {
          if (it.kind === "file") {
            file = it.getAsFile();
            if (file) break;
          }
        }
      }
      if (!file && e.dataTransfer?.files?.length) {
        file = e.dataTransfer.files[0];
      }
      if (!file) return;

      const r = new FileReader();
      r.onload = (ev) => loadImage(ev.target.result);
      r.readAsDataURL(file);
    };
    drop.addEventListener("dragenter", onEnter);
    drop.addEventListener("dragover", onOver);
    drop.addEventListener("dragleave", onLeave);
    drop.addEventListener("drop", onDrop);
    return () => {
      drop.removeEventListener("dragenter", onEnter);
      drop.removeEventListener("dragover", onOver);
      drop.removeEventListener("dragleave", onLeave);
      drop.removeEventListener("drop", onDrop);
    };
  }, [loadImage]);

  // sampler drag
  useEffect(() => {
    const sampler = samplerRef.current;
    if (!sampler) return;

    const onDown = (e) => {
      draggingRef.current = true;
      sampler.style.cursor = "grabbing";
      dragOffsetRef.current = { x: e.offsetX, y: e.offsetY };
    };
    const onUp = () => {
      draggingRef.current = false;
      sampler.style.cursor = "grab";
    };
    const onMove = (e) => {
      if (!draggingRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      moveSampler(
        e.clientX - rect.left - dragOffsetRef.current.x + R,
        e.clientY - rect.top  - dragOffsetRef.current.y + R
      );
      doSample();
    };

    sampler.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    return () => {
      sampler.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
    };
  }, [doSample, moveSampler]);

  // init -> empty
  useEffect(() => { setEmpty(true); }, [setEmpty]);

  const samples = useMemo(() => SAMPLE_URLS, []);

  return (
    <div className="Analyze-root">

      <main className="container">
        <div className="grid">
          {/* LEFT */}
          <section className="card">
            <div className="card-head">
              <strong>อัปโหลดรูปมือ</strong>
              <span className="chip">รองรับ .jpg/.png/.webp</span>
            </div>
            <div className="card-body">
              <div ref={dropRef} className="drop">
                {/* Empty state */}
                {!hasImage && (
                  <div className="empty">
                    <div className="empty-hero">
                      <div className="empty-blob"></div>
                      <div className="hand" aria-hidden="true">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0" stopColor="#ffe1ec"/>
                              <stop offset="1" stopColor="#ffd2e4"/>
                            </linearGradient>
                          </defs>
                          <path d="M120 150c-30 10-58-5-58-30 0-25 15-36 28-39 5-1 9-5 11-10 3-9 11-20 21-19 8 1 12 9 9 17-2 6-1 13 4 17 7 5 12 11 12 21 0 21-9 35-27 43z" fill="url(#skin)" stroke="#f2c2d4" strokeWidth="2" />
                          <circle cx="155" cy="78" r="6" fill="#ffc1d8"/>
                        </svg>
                      </div>
                      <span className="arrow">ลากรูปมาวางได้</span>
                    </div>

                    <div className="quick">
                      <button className="btn btn-primary btn-long" type="button" onClick={onPick}>
                        เลือกไฟล์จากเครื่อง
                      </button>
                      <button className="btn btn-ghost btn-long" type="button" onClick={onUseSample}>
                        ใช้รูปตัวอย่าง
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem", marginTop: ".6rem" }}>
                      <button className="btn btn-long" type="button" onClick={onPaste}>
                        วางจากคลิปบอร์ด ⌘/Ctrl + V
                      </button>
                      <label className="btn btn-long" style={{ cursor: "pointer" }}>
                        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" hidden onChange={onChangeFile}/>
                        ถ่ายจากกล้อง
                      </label>
                    </div>

                    <div className="hint" style={{ marginTop: ".4rem" }}>
                      ทริค: ถ่ายใต้แสงธรรมชาติ / หลีกเลี่ยงเงาเข้มบนผิว
                    </div>

                    <div className="hint" style={{ marginTop: ".8rem" }}>หากไม่มีรูป ลองตัวอย่างเหล่านี้</div>
                    <div className="sample-row">
                      {samples.map((u) => (
                        <img key={u} className="sample" src={u} alt="sample" onClick={() => loadImage(u)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview */}
                {hasImage && (
                  <div className="preview" ref={previewRef}>
                    <canvas ref={canvasRef} />
                    <div className="sampler" ref={samplerRef} style={{ left: 20, top: 20 }} />
                  </div>
                )}
              </div>

              <div className="kpi">
                <span className="dot" style={{ background: dotColor }}></span>
                <strong>{hex}</strong>
                <span className="hint">{rgbText}</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                  <button className="btn btn-primary" type="button" onClick={analyze}>วิเคราะห์</button>
                  <button className="btn" type="button" onClick={centerSampler}>จัดวงกลางภาพ</button>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <section className="card">
            <div className="card-head">
              <strong>ผลการวิเคราะห์</strong>
              <span className="chip">
                {confidence == null ? "ความเชื่อมั่น —" : `ความเชื่อมั่น ~${confidence}%`}
              </span>
            </div>
            <div className="card-body">
              <div className="row2">
                <div>
                  <div className="hint">ระดับสีผิว (Depth)</div>
                  <h2 style={{ margin: ".25rem 0 .4rem" }}>{depth}</h2>
                  <div className="bar"><span style={{ width: confidence ? `${confidence}%` : 0 }} /></div>
                </div>
                <div>
                  <div className="hint">อันเดอร์โทน (Undertone)</div>
                  <h2 style={{ margin: ".25rem 0 .4rem" }}>{undertone}</h2>
                  <div style={{ display: "flex", gap: ".45rem", flexWrap: "wrap" }}>
                    {tips.map((t) => <span key={t} className="chip">{t}</span>)}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: ".45rem", flexWrap: "wrap", marginTop: ".9rem" }}>
                <span className="chip">{lab.L == null ? "L* —" : `L* ≈ ${lab.L.toFixed(1)}`}</span>
                <span className="chip">{lab.a == null ? "a* —" : `a* ≈ ${lab.a.toFixed(1)}`}</span>
                <span className="chip">{lab.b == null ? "b* —" : `b* ≈ ${lab.b.toFixed(1)}`}</span>
              </div>

              <h3 style={{ margin: "1rem 0 .4rem" }}>สีแนะนำ</h3>
              <div className="swrap">
                <div className="swatches">
                  {swatches.map((c) => (
                    <div className="swatch" key={c.hex} title={`คลิกเพื่อคัดลอก ${c.hex}`} onClick={() => onClickSwatch(c.hex)}>
                      <div className="swatch-top" style={{ background: c.hex }} />
                      <div className="swatch-body">
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                        <span className="pill">{c.hex}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shape-head">
                <h3 style={{ margin: 0 }}>ทรงเล็บแนะนำ</h3>
                <span className="hint">
                  {shapes.length
                    ? `แนะนำ (${shapes.slice(0, 4).map((s) => s.name).join(" • ")})`
                    : "เลือกทรงเพื่อดูตัวอย่างสี"}
                </span>
              </div>

              <div className="shape-grid">
                {shapes.map((s) => (
                  <div
                    key={s.id}
                    className={`shape ${s.active ? "active" : ""}`}
                    onClick={() => onClickShape(s.id)}
                  >
                    <div
                      className="shape-ico"
                      dangerouslySetInnerHTML={{ __html: s.svg }}
                    />
                    <div className="shape-row">
                      <strong>{s.name}</strong>
                      <span className="hint" style={{ fontSize: ".88rem" }}>{s.tip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className={`toast ${toast ? "show" : ""}`}>{toast || "คัดลอกสีแล้ว"}</div>
    </div>
  );
}
