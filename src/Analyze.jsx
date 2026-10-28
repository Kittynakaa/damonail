import React, { useMemo, useRef, useState } from 'react';
import './Analyze.css';
import PageHero from './components/PageHero';
import CameraCapture from './components/CameraCapture';
import NailCanvasOverlay from './components/NailCanvasOverlay';
import useHandLandmarks, { FINGER_ORDER } from './hooks/useHandLandmarks';
import { FiImage, FiCamera, FiX, FiRefreshCw, FiDownload, FiInfo, FiCheck } from 'react-icons/fi';

// 1. ข้อมูล Palette แบ่งตาม Undertone (สีที่ AI แนะนำ)
const COLOR_DATA = {
  warm: {
    title: "Warm",
    label: "โทนผิวอุ่น",
    desc: "ผิวโทนอุ่นเหมาะกับเฉดสีกลุ่ม Earth Tone, ทอง และส้มอิฐ เพื่อขับเน้นรัศมีของผิวให้ดูผ่องใสและสุขภาพดีที่สุด",
    palette: [
      { hex: "#A64B2A", name: "Terra" }, { hex: "#D8A25E", name: "Honey" },
      { hex: "#E3735E", name: "Coral" }, { hex: "#C77966", name: "Caramel" },
      { hex: "#8B6C5C", name: "Mocha" }
    ]
  },
  cool: {
    title: "Cool",
    label: "โทนผิวเย็น",
    desc: "ผิวโทนเย็นเหมาะกับเฉดสีกลุ่มพาสเทล, ชมพูตุ่น, ม่วงลาเวนเดอร์ หรือสีเงิน เพื่อขับผิวให้ดูขาวกระจ่างใสและนุ่มนวล",
    palette: [
      { hex: "#CC8899", name: "Rose" }, { hex: "#9B6BB3", name: "Lilac" },
      { hex: "#6D8DAA", name: "Slate" }, { hex: "#C55F90", name: "Berry" },
      { hex: "#9EB3C2", name: "Frost" }
    ]
  },
  neutral: {
    title: "Neutral",
    label: "โทนผิวกลาง",
    desc: "ผิวโทนกลางมีความยืดหยุ่นสูง สามารถใช้ได้ทั้งสีโทนร้อนและเย็น โดยเฉพาะสีกลุ่ม Nude, Taupe และสีสว่างจะช่วยให้ดูแพง",
    palette: [
      { hex: "#BC8F8F", name: "Taupe" }, { hex: "#C2B280", name: "Sand" },
      { hex: "#BDA7A0", name: "Blush" }, { hex: "#A39887", name: "Mushroom" },
      { hex: "#977C6D", name: "Cocoa" }
    ]
  }
};

const SHAPES = [
  { id: 'almond', name: 'Almond', desc: 'ทรงยอดนิยมที่ช่วยให้นิ้วดูเรียวยาวและหรูหราแบบ Editorial.', svg: 'M20,50 Q30,10 40,50 L40,90 L20,90 Z' },
  { id: 'oval', name: 'Oval', desc: 'ทรงคลาสสิกที่ให้ความละมุน ดูสะอาดและเป็นธรรมชาติ.', svg: 'M20,40 Q30,5 40,40 L40,90 L20,90 Z' },
  { id: 'squoval', name: 'Squoval', desc: 'ทันสมัย มั่นใจ แต่ยังมีความนุ่มนวลของขอบมน.', svg: 'M20,30 Q30,25 40,30 L40,90 L20,90 Z' },
  { id: 'square', name: 'Square', desc: 'เฉียบคมและทรงพลัง เหมาะกับลุคที่ต้องการความชัดเจน.', svg: 'M20,20 L40,20 L40,90 L20,90 Z' }
];

// สีอื่น ๆ นอกเหนือจากที่ AI แนะนำ ให้เลือกเพิ่มเติมได้อิสระ
const OTHER_SHADES = [
  { hex: "#8B2635", name: "Ruby" }, { hex: "#2C3E50", name: "Midnight" },
  { hex: "#EAD1DC", name: "Petal" }, { hex: "#4A4A4A", name: "Graphite" },
  { hex: "#B8973F", name: "Gold" }, { hex: "#5C4B51", name: "Espresso" },
  { hex: "#94A187", name: "Sage" }, { hex: "#F1EAE0", name: "Milk" },
];

const PATTERNS = [
  { id: 'minimal', name: 'Minimal' },
  { id: 'french', name: 'French' },
  { id: 'glitter', name: 'Glitter' },
  { id: 'ombre', name: 'Ombre' },
  { id: 'marble', name: 'Marble' },
  { id: 'floral', name: 'Floral' },
  { id: 'line-art', name: 'Line Art' },
  { id: 'chrome', name: 'Chrome' },
];

const FINISHES = [
  { id: 'cream', name: 'Cream' },
  { id: 'matte', name: 'Matte' },
  { id: 'jelly', name: 'Jelly' },
  { id: 'sheer', name: 'Sheer' },
  { id: 'shimmer', name: 'Shimmer' },
  { id: 'chrome', name: 'Chrome' },
];

const FINGERS = [
  { id: 'all', label: 'ทุกเล็บ' },
  { id: 'thumb', label: 'นิ้วโป้ง' },
  { id: 'index', label: 'นิ้วชี้' },
  { id: 'middle', label: 'นิ้วกลาง' },
  { id: 'ring', label: 'นิ้วนาง' },
  { id: 'pinky', label: 'นิ้วก้อย' },
];

const HOW_TO_STEPS = [
  { num: '01', title: 'ถ่ายหรือเลือกรูปมือ', desc: 'ถ่ายรูปมือในบริเวณที่มีแสงเพียงพอ แนะนำให้เห็นเล็บครบทุกนิ้ว' },
  { num: '02', title: 'อัปโหลดรูป', desc: 'เลือกรูปจากอุปกรณ์ของคุณ รองรับไฟล์ JPG และ PNG' },
  { num: '03', title: 'รอ AI วิเคราะห์', desc: 'ระบบจะวิเคราะห์โทนผิวและแนะนำสี/ทรงเล็บที่เหมาะสมให้ทันที' },
];

const TIPS = [
  'ใช้ภาพมือที่มีแสงสว่างเพียงพอ',
  'หลีกเลี่ยงแสงสีเหลืองหรือภาพมืด',
  'ควรถอดถุงมือและสิ่งที่บดบังเล็บ',
  'ควรเห็นนิ้วและเล็บอย่างชัดเจน',
];

function patternThumbStyle(id, hex) {
  switch (id) {
    case 'french':
      return { background: `linear-gradient(${hex}, ${hex}), radial-gradient(circle at 50% -20%, #fbf7f1 55%, transparent 56%)`, backgroundBlendMode: 'normal' };
    case 'glitter':
      return { background: `radial-gradient(circle, #fff 1px, transparent 1.5px) 0 0/6px 6px, radial-gradient(circle, #f4d78c 1px, transparent 1.5px) 3px 3px/8px 8px, ${hex}` };
    case 'ombre':
      return { background: `linear-gradient(0deg, ${hex}, #ffffff)` };
    case 'marble':
      return { background: `repeating-linear-gradient(120deg, rgba(255,255,255,0.5) 0 2px, transparent 2px 10px), ${hex}` };
    case 'floral':
      return { background: `radial-gradient(circle at 50% 70%, #fff 18%, transparent 19%), ${hex}` };
    case 'line-art':
      return { background: `repeating-linear-gradient(70deg, rgba(255,255,255,0.7) 0 2px, transparent 2px 12px), ${hex}` };
    case 'chrome':
      return { background: `linear-gradient(135deg, #cfd8dc, #ffffff 40%, #9aa5ab 65%, #e8edf0)` };
    default:
      return { background: hex };
  }
}

const defaultDesignFor = (color) => ({
  all: { hex: color.hex, name: color.name, pattern: 'minimal', finish: 'cream' },
  thumb: null, index: null, middle: null, ring: null, pinky: null,
});

const AnalyzePage = () => {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, analyzing, completed
  const [result, setResult] = useState(null);
  const [selectedShape, setSelectedShape] = useState(SHAPES[0]);
  const [showCamera, setShowCamera] = useState(false);
  const [design, setDesign] = useState(null);
  const [activeFinger, setActiveFinger] = useState('all');

  const fileInputRef = useRef(null);
  const canvasOverlayRef = useRef(null);

  const { landmarks, mode: detectMode, updateLandmark, resetLandmarks } = useHandLandmarks(
    status === 'completed' ? image : null
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (dataUrl) => {
    setImage(dataUrl);
    setShowCamera(false);
  };

  const removeImage = () => setImage(null);

  const runAnalysis = () => {
    setStatus('analyzing');
    setTimeout(() => {
      const tones = ['warm', 'cool', 'neutral'];
      const picked = tones[Math.floor(Math.random() * tones.length)];
      const pickedResult = COLOR_DATA[picked];
      const aiShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      setResult({ ...pickedResult, recommendedShapeId: aiShape.id });
      setSelectedShape(aiShape);
      setDesign(defaultDesignFor(pickedResult.palette[0]));
      setActiveFinger('all');
      setStatus('completed');
    }, 2000);
  };

  const currentDesign = useMemo(() => {
    if (!design) return null;
    return activeFinger === 'all' ? design.all : (design[activeFinger] ?? design.all);
  }, [design, activeFinger]);

  const resolvedDesign = useMemo(() => {
    if (!design) return {};
    return FINGER_ORDER.reduce((acc, f) => {
      acc[f] = design[f] ?? design.all;
      return acc;
    }, {});
  }, [design]);

  const applyToTarget = (patch) => {
    setDesign((prev) => {
      const key = activeFinger;
      const base = key === 'all' ? prev.all : (prev[key] ?? prev.all);
      return { ...prev, [key]: { ...base, ...patch } };
    });
  };

  const selectColor = (color) => applyToTarget({ hex: color.hex, name: color.name });
  const selectPattern = (patternId) => applyToTarget({ pattern: patternId });
  const selectFinish = (finishId) => applyToTarget({ finish: finishId });

  const handleReset = () => {
    if (!result) return;
    setDesign(defaultDesignFor(result.palette[0]));
    setActiveFinger('all');
    resetLandmarks();
  };

  const handleReanalyze = () => {
    setStatus('idle');
    setResult(null);
    setDesign(null);
    setActiveFinger('all');
    setImage(null);
  };

  const handleSave = () => {
    const dataUrl = canvasOverlayRef.current?.exportPNG();
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'my-nail-design.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="analyze-container analyze-page">
      <input ref={fileInputRef} id="f" type="file" accept="image/*" hidden onChange={handleFileChange} />
      {showCamera && (
        <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
      )}

      <div className="analyze-content">
        {status !== 'completed' && (
          <div className="upload-section">
            <PageHero
              compact
              eyebrow="AI Nail Analyzer"
              title="วิเคราะห์โทนสีผิวของคุณ"
              description="ค้นหาสีเล็บและทรงเล็บที่เหมาะกับคุณด้วย AI — อัปโหลดรูปมือ ให้ AI วิเคราะห์โทนสีผิว พร้อมแนะนำสีเล็บและทรงเล็บที่ใช่สำหรับคุณ"
            />

            {/* วิธีใช้งาน 3 ขั้นตอน */}
            <div className="how-to-grid">
              {HOW_TO_STEPS.map((s) => (
                <div className="how-to-card" key={s.num}>
                  <span className="how-to-num">{s.num}</span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="upload-box">
              <div
                className={`upload-inner ${image ? 'has-image' : ''}`}
                onClick={() => !image && fileInputRef.current?.click()}
              >
                {image ? (
                  <img src={image} alt="รูปที่อัปโหลด" />
                ) : (
                  <div className="upload-placeholder">
                    <FiImage className="upload-icon" />
                    <h3>อัปโหลดรูปมือของคุณ</h3>
                    <p>ถ่ายหรือเลือกรูปมือที่เห็นเล็บชัดเจน เพื่อให้ AI วิเคราะห์ได้แม่นยำขึ้น</p>
                  </div>
                )}
              </div>

              {!image ? (
                <div className="upload-actions">
                  <button className="btn-luxury" onClick={() => fileInputRef.current?.click()}>
                    <FiImage /> เลือกภาพจากอุปกรณ์
                  </button>
                  <button className="btn-outline" onClick={() => setShowCamera(true)}>
                    <FiCamera /> ถ่ายภาพด้วยกล้อง
                  </button>
                </div>
              ) : (
                <div className="upload-actions">
                  <button className="btn-outline" onClick={() => fileInputRef.current?.click()}>
                    <FiRefreshCw /> เปลี่ยนรูป
                  </button>
                  <button className="btn-outline btn-danger" onClick={removeImage}>
                    <FiX /> ลบรูป
                  </button>
                </div>
              )}
            </div>

            {image && (
              status === 'analyzing' ? (
                <div className="loading-spinner" style={{ marginTop: '30px' }}>กำลังวิเคราะห์เนื้อผิวและโทนสี...</div>
              ) : (
                <button className="btn-luxury btn-block" onClick={runAnalysis}>
                  เริ่มวิเคราะห์
                </button>
              )
            )}

            {/* คำแนะนำก่อนอัปโหลด */}
            <div className="tips-card">
              <div className="tips-card-header">
                <FiInfo /> เพื่อผลการวิเคราะห์ที่แม่นยำที่สุด
              </div>
              <ul className="tips-list">
                {TIPS.map((t) => (
                  <li key={t}><FiCheck className="tip-check" />{t}</li>
                ))}
              </ul>
              <p className="tips-note">
                <strong>หมายเหตุ:</strong> ผลการวิเคราะห์เป็นคำแนะนำเบื้องต้นจากภาพ ไม่ใช่การวิเคราะห์สีผิวทางการแพทย์
                และผลลัพธ์อาจแตกต่างตามสภาพแสงและคุณภาพของภาพ
              </p>
            </div>
          </div>
        )}

        {status === 'completed' && result && design && (
          <div className="results-wrap">
            {/* SECTION A: ผลการวิเคราะห์ */}
            <div className="results-area">
              <div>
                <div className="result-header">
                  <span className="result-label">01 / ผลการวิเคราะห์</span>
                  <h2 className="result-title">ผลการวิเคราะห์ของคุณ</h2>
                </div>
                <div className="result-photo-frame">
                  <img src={image} alt="รูปที่วิเคราะห์" />
                </div>
              </div>

              <div>
                <div className="result-header">
                  <span className="result-label">02 / คำแนะนำ</span>
                  <h2 className="result-title">โทนผิว: {result.title}</h2>
                </div>
                <p className="result-desc">"{result.desc}"</p>

                <div className="palette-block">
                  <h3 className="block-heading">สีที่เหมาะกับคุณ</h3>
                  <div className="palette-grid">
                    {result.palette.map((c) => (
                      <div key={c.hex} className="swatch-card">
                        <div className="swatch-color" style={{ background: c.hex }}></div>
                        <span className="swatch-name">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="block-heading">ทรงเล็บที่เหมาะกับคุณ</h3>
                  <div className="shape-grid">
                    {SHAPES.map((s) => (
                      <div
                        key={s.id}
                        className={`shape-card ${selectedShape.id === s.id ? 'active' : ''}`}
                        onClick={() => setSelectedShape(s)}
                      >
                        {s.id === result.recommendedShapeId && <span className="ai-badge">AI แนะนำ</span>}
                        <svg viewBox="0 0 60 100" className="shape-svg"><path d={s.svg} fill="currentColor" /></svg>
                        <div className="shape-name">{s.name}</div>
                      </div>
                    ))}
                  </div>
                  <div className="shape-desc-box">
                    <h4>รายละเอียดทรง {selectedShape.name}</h4>
                    <p>{selectedShape.desc}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION B: ลองออกแบบเล็บของคุณ */}
            <div className="studio-section">
              <div className="result-header">
                <span className="result-label">03 / ลองออกแบบ</span>
                <h2 className="result-title">ลองออกแบบเล็บของคุณ</h2>
                <p className="result-desc">เลือกสีและลายที่คุณชอบ แล้วดูตัวอย่างบนเล็บของคุณได้ทันที</p>
              </div>

              <div className="studio-grid">
                <div className="studio-canvas-col">
                  <NailCanvasOverlay
                    ref={canvasOverlayRef}
                    imageUrl={image}
                    landmarks={landmarks}
                    design={resolvedDesign}
                    activeFinger={activeFinger}
                    showMarkers
                    onDragLandmark={updateLandmark}
                  />
                  <p className={`detect-hint ${detectMode}`}>
                    {detectMode === 'loading' && 'กำลังตรวจจับตำแหน่งเล็บด้วย AI...'}
                    {detectMode === 'auto' && 'ตรวจพบตำแหน่งเล็บอัตโนมัติแล้ว — ลากจุดสีชมพูเพื่อปรับตำแหน่งเพิ่มเติมได้'}
                    {detectMode === 'manual' && 'ไม่พบตำแหน่งมือชัดเจน กรุณาลากจุดให้ตรงกับเล็บแต่ละนิ้ว'}
                  </p>
                </div>

                <div className="studio-controls-col">
                  <div className="control-block">
                    <h3 className="block-heading">ตกแต่ง</h3>
                    <div className="chip-row">
                      {FINGERS.map((f) => (
                        <button
                          key={f.id}
                          className={`chip ${activeFinger === f.id ? 'active' : ''}`}
                          onClick={() => setActiveFinger(f.id)}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="control-block">
                    <h3 className="block-heading">สีที่แนะนำสำหรับคุณ</h3>
                    <div className="palette-grid studio-palette">
                      {result.palette.map((c) => (
                        <div
                          key={c.hex}
                          className={`swatch-card ${currentDesign.hex === c.hex ? 'active' : ''}`}
                          onClick={() => selectColor(c)}
                        >
                          <div className="swatch-color" style={{ background: c.hex }}></div>
                          <span className="swatch-name">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="control-block">
                    <h3 className="block-heading">สีอื่น ๆ</h3>
                    <div className="palette-grid studio-palette">
                      {OTHER_SHADES.map((c) => (
                        <div
                          key={c.hex}
                          className={`swatch-card ${currentDesign.hex === c.hex ? 'active' : ''}`}
                          onClick={() => selectColor(c)}
                        >
                          <div className="swatch-color" style={{ background: c.hex }}></div>
                          <span className="swatch-name">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="control-block">
                    <h3 className="block-heading">Finish</h3>
                    <div className="chip-row">
                      {FINISHES.map((f) => (
                        <button
                          key={f.id}
                          className={`chip ${currentDesign.finish === f.id ? 'active' : ''}`}
                          onClick={() => selectFinish(f.id)}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="control-block">
                    <h3 className="block-heading">เลือกลายเล็บ</h3>
                    <div className="pattern-grid">
                      {PATTERNS.map((p) => (
                        <div
                          key={p.id}
                          className={`pattern-card ${currentDesign.pattern === p.id ? 'active' : ''}`}
                          onClick={() => selectPattern(p.id)}
                        >
                          <div className="pattern-thumb" style={patternThumbStyle(p.id, currentDesign.hex)} />
                          <span className="pattern-name">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="studio-actions">
                    <button className="btn-luxury btn-block" onClick={handleSave}>
                      <FiDownload /> บันทึกดีไซน์นี้
                    </button>
                    <div className="studio-actions-row">
                      <button className="btn-outline" onClick={handleReset}>
                        <FiRefreshCw /> เริ่มออกแบบใหม่
                      </button>
                      <button className="btn-outline" onClick={handleReanalyze}>
                        <FiImage /> วิเคราะห์รูปใหม่
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzePage;
