import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserById, createBooking } from "./callapi/call_api_booking";
import { getEmployeeByStore, getAvailableStaff, getEmployeeAvailability, getEmployeeDayStatus } from "./callapi/call_api_employee";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import "./Booking.css";

const TIME_SLOTS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const STEP_LABELS = { services: "บริการ", tech: "ช่างทำเล็บ", datetime: "วันเวลา", customer: "ข้อมูลลูกค้า" };

export default function BookingPage() {
  const navigate = useNavigate();
  const [payload, setPayload] = useState(null);
  const [checkedIds, setCheckedIds] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tech, setTech] = useState(null);
  const [dateObj, setDateObj] = useState(null);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [agree, setAgree] = useState(false);
  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cLine, setCLine] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cNote, setCNote] = useState("");
  const [activeKey, setActiveKey] = useState("services");
  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [promotions, setPromotions] = useState([]);

  const today = new Date();
  const stepRefs = {
    services: useRef(null),
    tech: useRef(null),
    datetime: useRef(null),
    customer: useRef(null),
  };

  useEffect(() => {
    const p = JSON.parse(sessionStorage.getItem("bookingPayload") || "null");
    if (p) {
      setPayload(p);
      setCheckedIds((p.services || []).map(s => s.id));
      setPromoCode(p.promoCode || "");
      setPromotions(p.promotions || []);
    }
  }, []);

  useEffect(() => {
    // ห้ามใช้ toISOString() -- มันแปลงเป็น UTC ก่อน ถ้าเขตเวลาเครื่องอยู่ก่อน
    // UTC (เช่นไทย +7) วันที่จะเลื่อนถอยหลังไป 1 วันทันที ต้องดึงปี/เดือน/วัน
    // จากเวลาท้องถิ่นตรง ๆ
    if (dateObj) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, "0");
      const d = String(dateObj.getDate()).padStart(2, "0");
      setDateStr(`${y}-${m}-${d}`);
    }
  }, [dateObj]);

  useEffect(() => {
    if (!payload?.storeId) return;
    async function fetchEmployees() {
      try {
        const res = await getEmployeeByStore(payload.storeId);
        setEmployees(res || []);
      } catch (err) { console.error(err); }
    }
    fetchEmployees();
  }, [payload]);

  // สถานะลา/ขาดงานของช่างแต่ละคน สำหรับวันที่ลูกค้าเลือก -- ใช้แสดง badge
  // บนการ์ดเลือกช่างทันที ไม่ต้องรอให้ลูกค้ากดเปิด dropdown เวลาก่อน
  const [dayStatus, setDayStatus] = useState({});
  useEffect(() => {
    if (!payload?.storeId || !dateStr) {
      setDayStatus({});
      return;
    }
    async function fetchDayStatus() {
      try {
        const rows = await getEmployeeDayStatus(payload.storeId, dateStr);
        const map = {};
        rows.forEach(r => { map[r.employee_id] = r; });
        setDayStatus(map);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDayStatus();
  }, [payload?.storeId, dateStr]);

  // ถ้าช่างที่เลือกไว้ (ก่อนหน้านี้ตอนยังไม่ได้เลือกวันที่) กลายเป็นลา/ขาดงาน
  // ในวันที่ลูกค้าเพิ่งเลือก -- เอาออกจากตัวเลือกทันที ไม่ปล่อยให้ค้างเป็น
  // "เลือกอยู่" ทั้งที่จองไม่ได้จริง แล้วแจ้งให้ลูกค้ารู้ว่าต้องเลือกช่างใหม่
  useEffect(() => {
    if (!tech) return;
    const status = dayStatus[tech];
    if (status?.on_leave || status?.on_absent) {
      const emp = employees.find(e => e.employee_id === tech);
      setTech(null);
      Swal.fire({
        icon: "warning",
        title: `${emp?.fullname || "ช่างที่คุณเลือก"}ไม่สามารถให้บริการในวันนี้ได้`,
        text: status.on_absent ? "ช่างไม่มาทำงานในวันนี้" : "ช่างลาในวันนี้ กรุณาเลือกช่างคนอื่น หรือให้ระบบสุ่มช่างให้",
      });
    }
  }, [dayStatus, tech, employees]);

  const allServices = useMemo(() => payload?.services || [], [payload]);
  const chosen = useMemo(() => allServices.filter(s => checkedIds.includes(s.id)), [allServices, checkedIds]);
  const totalMins = chosen.reduce((acc, s) => acc + Number(s.minutes || 0), 0);
  const totalPrice = chosen.reduce((acc, s) => acc + Number(s.price || 0), 0);

  useEffect(() => {

    if (!dateStr || !payload?.storeId || chosen.length === 0) {
      setUnavailableTimes([]);
      return;
    }

    // ตรวจสอบทุกช่วงเวลาด้วย eligibility จริง (ทักษะ/ลา/ขาดงาน/เวลาทำงาน/คิวชน)
    // ไม่ใช่แค่ "มีคิวชนตรงเวลาเป๊ะ" แบบเดิม -- ใช้ทั้งกรณีเลือกช่างเองและ
    // System Match เพื่อไม่ให้ลูกค้าเลือกช่วงเวลาที่ช่างคนนั้นลา/ขาดงานอยู่ได้
    async function checkSlot(t) {
      const serviceIds = chosen.map(s => s.id).join(",");
      try {
        if (tech) {
          const res = await getEmployeeAvailability(tech, {
            date: dateStr,
            time: t,
            minutes: totalMins || 30,
            service_ids: serviceIds,
          });
          return { t, full: !res.eligible };
        }

        const list = await getAvailableStaff(payload.storeId, {
          date: dateStr,
          time: t,
          minutes: totalMins || 30,
          service_ids: serviceIds,
        });
        return { t, full: !list || list.length === 0 };
      } catch (err) {
        console.error(err);
        return { t, full: false };
      }
    }

    async function fetchAvailability() {
      const results = await Promise.all(TIME_SLOTS.map(checkSlot));
      setUnavailableTimes(results.filter(r => r.full).map(r => r.t));
    }

    fetchAvailability();

  }, [tech, dateStr, payload?.storeId, chosen, totalMins]);
  const normalizedPromoCode = promoCode.trim().toUpperCase();
  const activePromotion = normalizedPromoCode
    ? promotions.find(
        (promo) => String(promo.code || "").trim().toUpperCase() === normalizedPromoCode
      )
    : null;
  const promoDiscount = activePromotion
    ? Math.round(totalPrice * (Number(activePromotion.discountValue || 0) / 100))
    : 0;
  const finalPrice = Math.max(totalPrice - promoDiscount, 0);

  const thb = (n) => "฿" + Number(n || 0).toLocaleString();

  const stepValid = {
    services: chosen.length > 0,
    tech: true,
    datetime: !!dateStr && !!timeStr,
    customer: cName.trim().length >= 2 && /^0\d{8,9}$/.test(cPhone.replace(/\D/g, "")),
  };

  const canConfirm = stepValid.services && stepValid.datetime && stepValid.customer && agree;

  const scrollTo = (key) => {
    stepRefs[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveKey(key);
  };

  const handleAutofill = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.user_id) return;
      const user = await getUserById(storedUser.user_id);
      setCName(user.nickname || user.username || "");
      setCPhone(user.phone || "");
      setCEmail(user.email || "");
    } catch (err) { console.error(err); }
  };

  const ELIGIBILITY_ERROR_MESSAGES = [
    "พนักงานมีคิวในเวลานี้แล้ว",
    "พนักงานไม่สามารถให้บริการในช่วงเวลานี้",
  ];

  const submitBooking = async (employeeIdForSubmit) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      Swal.fire("แจ้งเตือน", "กรุณาเข้าสู่ระบบก่อนจอง", "warning");
      return;
    }

    const payloadSend = {
      booking_date: dateStr,
      booking_time: timeStr,
      user_id: storedUser.user_id,
      store_id: Number(payload.storeId),   // 👈 ป้องกัน type error
      employee_id: employeeIdForSubmit,
      customer: {
        name: cName,
        phone: cPhone,
        line: cLine,
        email: cEmail,
        note: cNote
      },
      services: chosen.map(s => ({
        service_id: s.id,
        name: s.name,
        price: s.price,
        minutes: s.minutes
      })),
      total_price: finalPrice,
      total_minutes: totalMins,
      type_booking_id: 1,
      status_booking_id: 1,
      promotion_code: normalizedPromoCode || null,
      promotion_discount: promoDiscount,
    };

    try {
      await createBooking(payloadSend);

      Swal.fire({
        title: "จองคิวสำเร็จ",
        html: `<p>${payload.storeName}</p>
               <p>วันที่ ${dateStr} เวลา ${timeStr}</p>
               <h3>${thb(finalPrice)}</h3>`,
        icon: "success",
        confirmButtonColor: "#2D4A43"
      }).then(() => navigate("/AllStores"));

    } catch (err) {

      console.log("BOOKING ERROR:", err.response?.data);

      const message =
        err.response?.data?.error ||
        "ไม่สามารถบันทึกการจองได้";

      // ช่างที่ลูกค้าเลือกเองใช้งานไม่ได้แล้ว (ลา/ขาดงาน/คิวชน ฯลฯ) -> เสนอทางเลือก
      // แทนที่จะสลับช่างให้เองเงียบ ๆ
      if (employeeIdForSubmit && ELIGIBILITY_ERROR_MESSAGES.includes(message)) {
        const result = await Swal.fire({
          title: "ช่างที่คุณเลือกไม่สามารถให้บริการในช่วงเวลานี้ได้",
          text: "ต้องการให้ระบบสุ่มช่างที่ว่างให้แทน หรือเลือกช่างคนอื่น?",
          icon: "warning",
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonText: "ให้ระบบสุ่มช่างแทน",
          denyButtonText: "เลือกช่างอื่น",
          cancelButtonText: "ยกเลิก",
        });

        if (result.isConfirmed) {
          await submitBooking(null);
          return;
        }
        if (result.isDenied) {
          scrollTo("tech");
          return;
        }
        return;
      }

      Swal.fire(
        "ไม่สามารถจองได้",
        message,
        "warning"
      );
    }
  };

  const confirmBooking = () => submitBooking(tech);

  return (
    <div className="bk-editorial-root">
      <header className="bk-header">
        <div className="bk-container">
          <div className="bk-header-flex">
            <div className="bk-title-area">
              <span className="bk-tag">ยืนยันรายการที่เลือก</span>
              <h1 className="bk-main-title">{payload?.storeName || "Crystal Shine"} <em></em></h1>
            </div>
            <nav className="bk-stepper">
              {["services", "tech", "datetime", "customer"].map((key, idx) => (
                <div key={key} className={`bk-step-node ${activeKey === key ? "active" : ""} ${stepValid[key] ? "done" : ""}`} onClick={() => scrollTo(key)}>
                  <span className="bk-step-num">0{idx + 1}</span>
                  <span className="bk-step-label">{STEP_LABELS[key]}</span>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="bk-container bk-content-layout">
        <div className="bk-forms-column">
          <section ref={stepRefs.services} className="bk-section">
            <h2 className="bk-section-title">บริการที่เลือก</h2>
            <div className="bk-svc-list">
              {chosen.map(s => (
                <div key={s.id} className="bk-svc-row">
                  <div className="bk-svc-info">
                    <div className="bk-check-dot" />
                    <span className="bk-svc-name">{s.name}</span>
                  </div>
                  <span className="bk-svc-price">{thb(s.price)}</span>
                </div>
              ))}
            </div>
          </section>

          <section ref={stepRefs.tech} className="bk-section">
            <h2 className="bk-section-title">เลือกช่างทำเล็บ</h2>
            <div className="bk-tech-flex">
              <div className={`bk-tech-card ${tech === null ? 'active' : ''}`} onClick={() => setTech(null)}>
                <div className="bk-tech-avatar"><span style={{ fontSize: '20px' }}>?</span></div>
                <label>ให้ระบบสุ่มช่างให้</label>
              </div>
              {employees.map(emp => {
                const status = dayStatus[emp.employee_id];
                const isUnavailable = !!(status?.on_leave || status?.on_absent);
                return (
                  <div
                    key={emp.employee_id}
                    className={`bk-tech-card ${tech === emp.employee_id ? 'active' : ''} ${isUnavailable ? 'unavailable' : ''}`}
                    onClick={() => { if (!isUnavailable) setTech(emp.employee_id); }}
                  >
                    <div className="bk-tech-avatar">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" alt={emp.fullname} />
                    </div>
                    <label>{emp.fullname}</label>
                    {isUnavailable && (
                      <span className="bk-tech-badge">
                        {status.on_absent ? "ไม่มาทำงาน" : "ลา"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section ref={stepRefs.datetime} className="bk-section">
            <h2 className="bk-section-title">วันและเวลา</h2>
            <div className="bk-dt-grid">
              <div className="bk-input-group">
                <label>วันที่นัดหมาย</label>
                <DatePicker selected={dateObj} onChange={date => setDateObj(date)} minDate={today} dateFormat="dd/MM/yyyy" className="bk-input" placeholderText="เลือกวันที่" />
              </div>
              <div className="bk-input-group">
                <label>เวลาที่ต้องการ</label>
                <select
                  className="bk-input"
                  value={timeStr}
                  onChange={e => setTimeStr(e.target.value)}
                >
                  <option value="">เลือกเวลา</option>

                  {TIME_SLOTS.map(t => {
                    const isFull = unavailableTimes.includes(t);
                    return (
                      <option
                        key={t}
                        value={t}
                        disabled={isFull}
                      >
                        {t} {isFull ? "(เต็ม)" : ""}
                      </option>
                    );
                  })}

                </select>
              </div>
            </div>
          </section>

          <section ref={stepRefs.customer} className="bk-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 className="bk-section-title">ข้อมูลส่วนตัว</h2>
              <button className="bk-autofill-btn" onClick={handleAutofill}>ดึงข้อมูลอัตโนมัติ</button>
            </div>
            <div className="bk-dt-grid">
              <div className="bk-input-group">
                <label>ชื่อ</label>
                <input className="bk-input" value={cName} onChange={e => setCName(e.target.value)} placeholder="ชื่อ-นามสกุล" />
              </div>
              <div className="bk-input-group">
                <label>เบอร์โทรศัพท์</label>
                <input className="bk-input" value={cPhone} onChange={e => setCPhone(e.target.value)} placeholder="0xx-xxx-xxxx" />
              </div>
            </div>
          </section>
        </div>

        <aside className="bk-sidebar">
          <div className="bk-summary-sticky">
            <h4 className="bk-summary-title">สรุปรายการจอง</h4>
            <div className="bk-summary-content">
              {chosen.map(s => (
                <div key={s.id} className="bk-summary-row">
                  <span>{s.name}</span>
                  <span>{thb(s.price)}</span>
                </div>
              ))}
            </div>

            <div className="bk-promo-box">
              <label htmlFor="booking-promo" className="bk-promo-label">โค้ดส่วนลด</label>
              <input
                id="booking-promo"
                className="bk-promo-input"
                type="text"
                placeholder="กรอกโค้ดส่วนลดของร้าน"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <p className="bk-promo-hint">โค้ดนี้จะตรวจจากโปรโมชั่นจริงของร้านที่คุณเลือก</p>
              {normalizedPromoCode && (
                <div className="bk-applied-promo">
                  <span>{promoDiscount > 0 ? "ใช้โค้ดแล้ว" : "กรอกโค้ดแล้ว"}</span>
                  <strong>{normalizedPromoCode}</strong>
                </div>
              )}
            </div>

            <div className="bk-total-area">
              {promoDiscount > 0 && (
                <div className="bk-total-row bk-discount-row">
                  <span>ส่วนลดโปรโมชั่น</span>
                  <span>-{thb(promoDiscount)}</span>
                </div>
              )}
              <div className="bk-total-row">
                <span style={{ fontSize: '10px', letterSpacing: '1px' }}>ยอดรวมทั้งหมด</span>
                <span className="bk-total-price">{thb(finalPrice)}</span>
              </div>
              <span className="bk-total-mins">{totalMins} นาทีการให้บริการ</span>
            </div>

            <label className="bk-checkbox-label">
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
              <span>ฉันยอมรับเงื่อนไขการจอง</span>
            </label>

            <button className="bk-btn-confirm" disabled={!canConfirm} onClick={confirmBooking}>
              ยืนยันการจอง
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
