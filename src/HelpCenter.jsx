import React, { useState } from "react";
import "./Helpcenter.css"; // ✅ แยก CSS ออก และสcope ด้วย .hc ไม่ไปทับหน้ อื่น

export default function HelpCenter() {
  const [q, setQ] = useState("");

  const onSearch = (e) => {
    e.preventDefault();
    // TODO: hook this up to your search logic or router
    alert(`ค้นหา: ${q}`);
  };

  return (
    <div className="hc">

      {/* HERO SEARCH */}
      <section className="hc-hero">
        <div className="hc-container">
          <h1>เราจะช่วยคุณได้อย่างไร?</h1>
          <div className="hc-searchbar">
            <form onSubmit={onSearch} role="search" aria-label="ค้นหา">
              <input
                type="search"
                placeholder="ค้นหาคำถาม เช่น จองคิว, ราคา, ยกเลิกนัด"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="ค้นหาในศูนย์ช่วยเหลือ"
              />
              <button type="submit" aria-label="ค้นหา">ค้นหา</button>
            </form>
          </div>
        </div>
      </section>

      <main className="hc-container">
        {/* QUICK SELF SERVICE */}
        <h3 className="hc-section-title">บริการตนเอง</h3>
        <div className="hc-quick-grid">
          <a className="hc-qcard" href="#/bookings">
            <div className="hc-qicon" aria-hidden>🗓️</div>
            <div>
              <div className="hc-qtitle">ติดตาม/ยืนยันการจอง</div>
              <div className="hc-qdesc">เช็กสถานะนัดหมายของคุณ</div>
            </div>
          </a>
          <a className="hc-qcard" href="#/manage">
            <div className="hc-qicon" aria-hidden>✏️</div>
            <div>
              <div className="hc-qtitle">เปลี่ยนแปลง/ยกเลิกนัด</div>
              <div className="hc-qdesc">จัดการนัดที่จองไว้</div>
            </div>
          </a>
          <a className="hc-qcard" href="#/locations">
            <div className="hc-qicon" aria-hidden>📍</div>
            <div>
              <div className="hc-qtitle">ค้นหาสาขา/ที่จอด</div>
              <div className="hc-qdesc">ดูแผนที่ & เวลาให้บริการ</div>
            </div>
          </a>
        </div>

        {/* CATEGORIES */}
        <h3 className="hc-section-title">หัวข้อช่วยเหลือ</h3>
        <div className="hc-cat-grid">
          <a className="hc-cat" href="#/account"><span>บัญชีผู้ใช้</span><small>สมัคร/เข้าสู่ระบบ</small></a>
          <a className="hc-cat" href="#/booking"><span>การจองคิว</span><small>ขั้นตอน/ตรวจสอบ</small></a>
          <a className="hc-cat" href="#/payment"><span>การชำระเงิน</span><small>ส่วนลด & โปรโมชั่น</small></a>
          <a className="hc-cat" href="#/services"><span>บริการ & ราคา</span><small>แพ็กเกจเล็บ & สปา</small></a>
          <a className="hc-cat" href="#/artists"><span>ช่างทำเล็บ</span><small>เลือกช่าง/ดูผลงาน</small></a>
          <a className="hc-cat" href="#/policy"><span>นโยบายร้าน</span><small>กติกา & เงื่อนไข</small></a>
        </div>

        {/* CHANNELS */}
        <div className="hc-channels">
          <a className="hc-ch" href="#/chat"><b>แชท</b><span>คุยกับแอดมินตอนนี้</span></a>
          <a className="hc-ch" href="mailto:hello@glamnail.com"><b>อีเมล</b><span>hello@glamnail.com</span></a>
          <a className="hc-ch" href="tel:0812345678"><b>โทรศัพท์</b><span>081-234-5678 (10:00–20:00)</span></a>
        </div>
      </main>
    </div>
  );
}

