import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./Booking.css"; 

export default function BookingPage() {
    // ------- อ่าน payload จาก sessionStorage -------
    const [payload, setPayload] = useState(null);
    useEffect(() => {
      try {
        const p = JSON.parse(sessionStorage.getItem("bookingPayload") || "null");
        setPayload(p);
      } catch {
        setPayload(null);
      }
    }, []);
  
    const storeName = payload?.storeName || "—";
    const allServices = useMemo(
      () => (payload?.allServices ? payload.allServices : payload?.services || []),
      [payload]
    );
    const preselected = useMemo(
      () => new Set((payload?.services || []).map((s) => s.id)),
      [payload]
    );
  
    // ------- ฟอร์ม/สถานะต่าง ๆ -------
    const [checkedIds, setCheckedIds] = useState([]);
    useEffect(() => {
      // set ค่าเช็คเริ่มต้นตาม preselected
      setCheckedIds(Array.from(preselected));
    }, [preselected]);
  
    const toggleService = (id) =>
      setCheckedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
  
    const chosen = useMemo(
      () => allServices.filter((s) => checkedIds.includes(s.id)),
      [allServices, checkedIds]
    );
    const totalMins = useMemo(
      () => chosen.reduce((acc, s) => acc + Number(s.minutes || 0), 0),
      [chosen]
    );
    const totalPrice = useMemo(
      () => chosen.reduce((acc, s) => acc + Number(s.price || 0), 0),
      [chosen]
    );
    const thb = (n) => "฿" + Number(n || 0).toLocaleString("th-TH");
  
    // ช่าง/วันเวลา/ลูกค้า/เงื่อนไข
    const [tech, setTech] = useState("Aom");
    const [dateStr, setDateStr] = useState("");
    const [timeStr, setTimeStr] = useState("");
    const [agree, setAgree] = useState(false);
  
    const [cName, setCName] = useState("");
    const [cPhone, setCPhone] = useState("");
    const [cLine, setCLine] = useState("");
    const [cEmail, setCEmail] = useState("");
    const [cNote, setCNote] = useState("");
    const [saveProfile, setSaveProfile] = useState(false);
  
    // วาลิเดชันลูกค้า
    const nameOk = (cName || "").trim().length >= 2;
    const phoneOk = /^0\d{8,9}$/.test((cPhone || "").replace(/\D/g, ""));
    const emailOk = !cEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cEmail);
    const customerOk = nameOk && phoneOk && emailOk;
  
    // สเต็ปเปอร์
    const [activeKey, setActiveKey] = useState("services");
    const stepRefs = {
      services: useRef(null),
      tech: useRef(null),
      datetime: useRef(null),
      customer: useRef(null),
    };
    const scrollTo = (key) => {
      const el = stepRefs[key]?.current;
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveKey(key);
    };
  
    // IntersectionObserver เพื่อ sync active step ตามสกอร์ล
    useEffect(() => {
      const sections = Object.entries(stepRefs)
        .map(([key, r]) => ({ key, el: r.current }))
        .filter((x) => x.el);
  
      const io = new IntersectionObserver(
        (entries) => {
          const vis = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (vis[0]) {
            const key = sections.find((s) => s.el === vis[0].target)?.key;
            if (key) setActiveKey(key);
          }
        },
        { root: null, rootMargin: "-40% 0px -50% 0px", threshold: [0.2, 0.5, 0.8] }
      );
  
      sections.forEach((s) => io.observe(s.el));
      return () => io.disconnect();
    }, []);
  
    // สถานะผ่าน/ไม่ผ่านของแต่ละสเต็ป (ทำให้ปุ่ม/แถบสรุปอัปเดตอัตโนมัติ)
    const stepValid = {
      services: chosen.length > 0,
      tech: !!tech,
      datetime: !!dateStr && !!timeStr,
      customer: customerOk,
    };
    const canConfirm =
      stepValid.services && stepValid.tech && stepValid.datetime && stepValid.customer && agree;
  
    // แจ้งเตือน (แถบบน)
    const [globalAlert, setGlobalAlert] = useState({ show: false, msg: "" });
    const showGlobal = (msg) => {
      setGlobalAlert({ show: true, msg: msg || "กรุณากรอกข้อมูลให้ครบ" });
      setTimeout(() => setGlobalAlert({ show: false, msg: "" }), 3000);
    };
  
    // Autofill
    const handleAutofill = () => {
      let prof = null;
      try {
        prof = JSON.parse(localStorage.getItem("customerProfile") || "null");
      } catch {
        prof = null;
      }
      if (!prof) {
        prof = {
          name: "กนกวรรณ ใจดี",
          phone: "0812345678",
          line: "kanokwan.j",
          email: "kanokwan@example.com",
          note: "โทนชมพูมินิมอล มีจุดเงินเล็ก ๆ",
        };
      }
      setCName(prof.name || "");
      setCPhone(prof.phone || "");
      setCLine(prof.line || "");
      setCEmail(prof.email || "");
      setCNote(prof.note || "");
      scrollTo("customer");
    };
  
    // Save profile
    const maybeSaveProfile = () => {
      if (!saveProfile) return;
      const profile = {
        name: cName.trim(),
        phone: cPhone.trim(),
        line: cLine.trim(),
        email: cEmail.trim(),
        note: cNote.trim(),
      };
      localStorage.setItem("customerProfile", JSON.stringify(profile));
    };
  
    // ยืนยันการจอง
    const [doneMsg, setDoneMsg] = useState(null);
    const confirmBooking = () => {
      // focus step ที่ยังไม่ผ่าน
      if (!stepValid.services) {
        scrollTo("services");
        showGlobal("กรุณาเลือกบริการอย่างน้อย 1 รายการ");
        return;
      }
      if (!stepValid.datetime) {
        scrollTo("datetime");
        showGlobal("กรุณาเลือกวันที่และเวลา");
        return;
      }
      if (!stepValid.customer) {
        scrollTo("customer");
        showGlobal("กรุณากรอกข้อมูลลูกค้าให้ครบถ้วน");
        return;
      }
      if (!agree) {
        showGlobal("กรุณายอมรับข้อกำหนดและเงื่อนไข");
        return;
      }
  
      const booking = {
        storeId: payload?.storeId,
        storeName: payload?.storeName,
        services: chosen,
        tech: tech || "Any",
        date: dateStr,
        time: timeStr,
        customer: {
          name: cName.trim(),
          phone: cPhone.trim(),
          line: cLine.trim(),
          email: cEmail.trim(),
          note: cNote.trim(),
        },
      };
  
      maybeSaveProfile();
  
      const all = JSON.parse(sessionStorage.getItem("myBookings") || "[]");
      all.push(booking);
      sessionStorage.setItem("myBookings", JSON.stringify(all));
  
      setDoneMsg({ store: booking.storeName, dt: `${booking.date} ${booking.time}` });
    };
  
    // guard: ไม่มี payload
    const noPayload = !payload || !payload.storeName || !Array.isArray(payload.services);
  
    return (
      <div className="booking-page">
        {/* GLOBAL ALERT */}
        <div id="globalAlert" className={`alert alert-danger alert-dismissible ${globalAlert.show ? "show" : "fade"}`} role="alert">
          <span id="globalAlertMsg">{globalAlert.msg || "กรุณากรอกข้อมูลให้ครบ"}</span>
          <button type="button" className="btn-close" onClick={() => setGlobalAlert({ show: false, msg: "" })} aria-label="Close"></button>
        </div>
  
        {/* CONTENT */}
        <main className="py-4">
          <div className="container">
            {noPayload && (
              <div id="guard" className="alert alert-warning">
                ไม่มีข้อมูลการจอง กรุณาเลือกบริการจากหน้าร้านก่อน{" "}
                <a href="/store2" className="alert-link">กลับไปที่ร้าน</a>
              </div>
            )}
  
            {/* Header + Stepper */}
            <div className="cardy mb-3">
              <div className="cardy-body d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <div className="meta">คุณกำลังจองกับ</div>
                  <h4 id="storeName" className="m-0">{storeName}</h4>
                </div>
                <a href="/store2" className="pill text-decoration-none">
                  <i className="bi bi-arrow-left"></i> แก้ไขบริการที่ร้าน
                </a>
              </div>
              <div className="cardy-body pt-0">
                <div className="stepper" id="stepper">
                  {[
                    { key: "services", label: "บริการ", num: 1 },
                    { key: "tech", label: "ช่าง", num: 2 },
                    { key: "datetime", label: "วัน&เวลา", num: 3 },
                    { key: "customer", label: "ข้อมูลลูกค้า", num: 4 },
                  ].map((s, i, arr) => (
                    <React.Fragment key={s.key}>
                      <div
                        className={`step ${activeKey === s.key ? "active" : ""} ${stepValid[s.key] ? "completed" : ""}`}
                        onClick={() => scrollTo(s.key)}
                      >
                        <div className="dot">{stepValid[s.key] ? "✔" : s.num}</div>
                        <div className="label">{s.label}</div>
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`dash ${activeKey === s.key || stepValid[s.key] ? "on" : ""}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
  
            <div className="row g-4">
              {/* LEFT */}
              <div className="col-12 col-lg-8">
                {/* STEP 1: Services */}
                <section id="step-services" ref={stepRefs.services} className="cardy mb-3">
                  <div className="cardy-head d-flex justify-content-between align-items-center">
                    <div className="fw-semibold"><i className="bi bi-list-check"></i> บริการในร้าน</div>
                    <span className="pill"><i className="bi bi-bag-plus"></i> เลือกได้หลายบริการ</span>
                  </div>
                  <div className="cardy-body">
                    <div className={`alert alert-danger section-alert py-2 px-3 ${!stepValid.services ? "show" : ""}`} id="alert-services">
                      กรุณาเลือกบริการอย่างน้อย 1 รายการ
                    </div>
                    <div id="serviceList" className="vstack gap-2">
                      {allServices.map((s) => (
                        <label key={s.id} className="svc-item d-flex align-items-start gap-2">
                          <input
                            type="checkbox"
                            checked={checkedIds.includes(s.id)}
                            onChange={() => toggleService(s.id)}
                          />
                          <div className="w-100">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="fw-semibold">{s.name}</div>
                              <div className="price">{thb(s.price)}</div>
                            </div>
                            <div className="meta"><i className="bi bi-clock"></i> {Number(s.minutes || 0)} นาที</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </section>
  
                {/* STEP 2: Technician */}
                <section id="step-tech" ref={stepRefs.tech} className="cardy mb-3">
                  <div className="cardy-head fw-semibold"><i className="bi bi-person-badge"></i> เลือกช่าง</div>
                  <div className="cardy-body">
                    <div className="row g-2">
                      {[
                        { id: "Aom", name: "อ้อม", meta: "เจล/เพ้นท์", img: "/images/tech_aom.jpg" },
                        { id: "Bow", name: "โบว์", meta: "ต่อเล็บ", img: "/images/tech_bow.jpg" },
                        { id: "Mint", name: "มิ้นท์", meta: "มินิมอล", img: "/images/tech_mint.jpg" },
                        { id: "Any", name: "อัตโนมัติ", meta: "ร้านจัดให้", img: "/images/tech_any.jpg" },
                      ].map((t) => (
                        <div key={t.id} className="col-6 col-md-3 tech-card">
                          <input
                            type="radio"
                            name="tech"
                            id={`tech_${t.id}`}
                            checked={tech === t.id}
                            onChange={() => setTech(t.id)}
                          />
                          <label htmlFor={`tech_${t.id}`}>
                            <img src={t.img} alt={t.name} />
                            <div>
                              <div className="fw-semibold">{t.name}</div>
                              <div className="meta">{t.meta}</div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
  
                {/* STEP 3: Date & Time */}
                <section id="step-datetime" ref={stepRefs.datetime} className="cardy mb-3">
                  <div className="cardy-head fw-semibold"><i className="bi bi-calendar-check"></i> เลือกวันและเวลา</div>
                  <div className="cardy-body">
                    <div className={`alert alert-danger section-alert py-2 px-3 ${!stepValid.datetime ? "show" : ""}`} id="alert-datetime">
                      กรุณาเลือกวันที่และเวลา
                    </div>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label req">วันที่</label>
                        <input
                          id="date"
                          type="date"
                          className={`form-control ${!dateStr ? "is-invalid" : ""}`}
                          value={dateStr}
                          onChange={(e) => setDateStr(e.target.value)}
                          required
                        />
                        <div className="invalid-feedback">กรุณาเลือกวันที่</div>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label req">เวลา</label>
                        <select
                          id="time"
                          className={`form-select ${!timeStr ? "is-invalid" : ""}`}
                          value={timeStr}
                          onChange={(e) => setTimeStr(e.target.value)}
                          required
                        >
                          <option value="" disabled>เลือกเวลา</option>
                          {["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"].map(t=>(
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <div className="invalid-feedback">กรุณาเลือกเวลา</div>
                      </div>
                    </div>
                    <div className="form-text mt-2">* เวลาจริงอาจเปลี่ยนตามคิวว่างของช่าง</div>
                  </div>
                </section>
  
                {/* STEP 4: Customer info */}
                <section id="step-customer" ref={stepRefs.customer} className="cardy mb-3">
                  <div className="cardy-head d-flex justify-content-between align-items-center">
                    <div className="fw-semibold"><i className="bi bi-person-lines-fill"></i> ข้อมูลลูกค้า</div>
                    <div className="d-flex gap-2">
                      <button id="btnAutofill" className="btn btn-sm btn-outline-secondary" type="button" onClick={handleAutofill}>
                        <i className="bi bi-magic"></i> กรอกอัตโนมัติ
                      </button>
                    </div>
                  </div>
                  <div className="cardy-body">
                    <div className={`alert alert-danger section-alert py-2 px-3 ${!stepValid.customer ? "show" : ""}`} id="alert-customer">
                      กรุณากรอกชื่อ–นามสกุล และเบอร์โทรให้ถูกต้อง (อีเมลถ้ามี)
                    </div>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label req">ชื่อ–นามสกุล</label>
                        <input
                          id="c_name"
                          className={`form-control ${!nameOk ? "is-invalid" : ""}`}
                          placeholder="เช่น กนกวรรณ ใจดี"
                          value={cName}
                          onChange={(e) => setCName(e.target.value)}
                          required
                        />
                        <div className="invalid-feedback">กรุณากรอกชื่อ–นามสกุล</div>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label req">เบอร์โทร</label>
                        <input
                          id="c_phone"
                          className={`form-control ${!phoneOk ? "is-invalid" : ""}`}
                          inputMode="tel"
                          placeholder="เช่น 08x-xxx-xxxx"
                          value={cPhone}
                          onChange={(e) => setCPhone(e.target.value)}
                          required
                        />
                        <div className="invalid-feedback">กรุณากรอกเบอร์โทร 10 หลัก (ขึ้นต้นด้วย 0)</div>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">LINE ID</label>
                        <input id="c_line" className="form-control" placeholder="(ถ้ามี)" value={cLine} onChange={(e)=>setCLine(e.target.value)} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">อีเมล</label>
                        <input
                          id="c_email"
                          type="email"
                          className={`form-control ${!emailOk ? "is-invalid" : ""}`}
                          placeholder="(ถ้ามี)"
                          value={cEmail}
                          onChange={(e) => setCEmail(e.target.value)}
                        />
                        <div className="invalid-feedback">รูปแบบอีเมลไม่ถูกต้อง</div>
                      </div>
                      <div className="col-12">
                        <label className="form-label">หมายเหตุ</label>
                        <textarea
                          id="c_note"
                          className="form-control"
                          rows="2"
                          placeholder="ระบุโทนสี/ลายที่อยากได้ หรือเงื่อนไขอื่น ๆ"
                          value={cNote}
                          onChange={(e) => setCNote(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-check mt-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="saveProfile"
                        checked={saveProfile}
                        onChange={(e) => setSaveProfile(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="saveProfile">
                        <small>บันทึกโปรไฟล์ลูกค้าไว้ใช้ครั้งถัดไป</small>
                      </label>
                    </div>
                  </div>
                </section>
              </div>
  
              {/* RIGHT: Summary */}
              <div className="col-12 col-lg-4">
                <div className="cardy cart">
                  <div className="cardy-head d-flex justify-content-between align-items-center">
                    <h6 className="m-0">สรุปรายการ</h6>
                    <span className="pill">
                      <i className="bi bi-bag-check me-1"></i>
                      <span id="selCount">{chosen.length}</span> รายการ
                    </span>
                  </div>
                  <div className="cardy-body">
                    <div id="cartItems" className="vstack gap-2">
                      {chosen.length ? (
                        chosen.map((s) => (
                          <div key={s.id} className="d-flex justify-content-between align-items-center">
                            <div className="meta">{s.name} • {Number(s.minutes || 0)} นาที</div>
                            <div className="fw-semibold">{thb(s.price)}</div>
                          </div>
                        ))
                      ) : (
                        <div className="meta">ยังไม่เลือกบริการ</div>
                      )}
                    </div>
                    <div className="line"></div>
                    <div className="d-flex justify-content-between">
                      <span className="meta">ระยะเวลาโดยประมาณ</span>
                      <span><strong id="totalMins">{totalMins}</strong> นาที</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="meta">ยอดรวม</span>
                      <span className="fs-5"><strong id="totalPrice">{thb(totalPrice)}</strong></span>
                    </div>
  
                    <div className="form-check mt-3">
                      <input className="form-check-input" type="checkbox" id="agree" checked={agree} onChange={(e)=>setAgree(e.target.checked)} />
                      <label className="form-check-label" htmlFor="agree">
                        <small>ฉันยอมรับ <a href="#" onClick={(e)=>e.preventDefault()}>ข้อกำหนดและเงื่อนไข</a></small>
                      </label>
                    </div>
  
                    <button id="btnConfirm" className="btn btn-brand w-100 mt-3" disabled={!canConfirm} onClick={confirmBooking}>
                      ยืนยันการจอง
                    </button>
                  </div>
                </div>
  
                {doneMsg && (
                  <div id="done" className="alert alert-success mt-3">
                    ✅ บันทึกคำจองเรียบร้อย! <span id="doneStore">{doneMsg.store}</span> •{" "}
                    <span id="doneDateTime">{doneMsg.dt}</span>
                  </div>
                )}
              </div>
            </div>
  
            {/* Mobile bar */}
            <div className="mobile-bar">
              <div>
                <div className="meta">รวม</div>
                <div className="fw-semibold" id="mTotal">{thb(totalPrice)}</div>
              </div>
              <button id="mConfirm" className="btn btn-brand" disabled={!canConfirm} onClick={confirmBooking}>
                ยืนยัน
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }