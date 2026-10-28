import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./HelpCenter.css";
import PageHero from "./components/PageHero";

const TOPICS = [
  {
    id: "account",
    title: "บัญชีผู้ใช้",
    summary: "สมัครและจัดการข้อมูลส่วนตัว",
    answer: "แก้ไขข้อมูลส่วนตัว รูปโปรไฟล์ และดูประวัติการจองทั้งหมดได้ที่หน้าโปรไฟล์ของคุณ",
    linkTo: "/UserProfile",
    linkLabel: "ไปที่โปรไฟล์ของฉัน",
  },
  {
    id: "payment",
    title: "การชำระเงิน",
    summary: "โปรโมชั่นและช่องทางการชำระเงิน",
    answer: "แต่ละร้านกำหนดช่องทางชำระเงินของตัวเอง (เงินสด/บัตร/พร้อมเพย์) โปรโมชั่นที่ใช้ได้จะแสดงในหน้ารายละเอียดร้านก่อนยืนยันการจองเสมอ",
  },
  {
    id: "membership",
    title: "สมาชิก",
    summary: "การสะสมแต้มและสิทธิพิเศษ",
    answer: "ขณะนี้ยังไม่เปิดให้บริการระบบสะสมแต้มสมาชิก หากเปิดให้บริการจะแจ้งเตือนผ่านกระดิ่งแจ้งเตือนบนเว็บไซต์",
  },
  {
    id: "policy",
    title: "นโยบาย",
    summary: "กติกาและนโยบายความเป็นส่วนตัว",
    answer: "หากมีข้อสงสัยเรื่องนโยบายการยกเลิก/คืนเงิน หรือความเป็นส่วนตัว ติดต่อฝ่ายบริการลูกค้าได้ทางอีเมลหรือเบอร์โทรด้านล่าง",
  },
];

export default function HelpCenter() {
  const [q, setQ] = useState("");
  const [openTopicId, setOpenTopicId] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const topicRefs = useRef({});

  // เริ่มต้นใช้งาน AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-expo", // จังหวะการเคลื่อนไหวแบบหรูหรา
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = q.trim().toLowerCase();
    if (!term) return;

    const match = TOPICS.find(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        t.summary.toLowerCase().includes(term) ||
        t.answer.toLowerCase().includes(term)
    );

    if (match) {
      setNotFound(false);
      setOpenTopicId(match.id);
      topicRefs.current[match.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setNotFound(true);
    }
  };

  return (
    <div className="hc-luxury">
      {/* HERO SECTION */}
      <PageHero
        eyebrow="ศูนย์ช่วยเหลือลูกค้า"
        title={<>วันนี้ให้เรา<br />ช่วยเหลือคุณ เรื่องอะไรดี?</>}
      >
        <form className="hc-search-wrapper" data-aos="zoom-in" data-aos-delay="600" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="ค้นหาความช่วยเหลือ... (เช่น การจอง, ราคา)"
            value={q}
            onChange={(e) => { setQ(e.target.value); setNotFound(false); }}
          />
          <button type="submit">ค้นหา</button>
        </form>
        {notFound && (
          <p className="hc-search-empty">
            ไม่พบหัวข้อที่ตรงกับ "{q}" — ลองค้นหาคำอื่น หรือ
            <button
              type="button"
              className="hc-link-inline"
              onClick={() => document.querySelector(".hc-contact-banner")?.scrollIntoView({ behavior: "smooth" })}
            >
              {" "}ติดต่อฝ่ายบริการลูกค้า
            </button>
          </p>
        )}
      </PageHero>

      {/* QUICK ACTIONS */}
      <section className="hc-container-v2">
        <div className="hc-services-grid">
          <div className="hc-service-card" data-aos="fade-up" data-aos-delay="200">
            <div className="hc-bg-text">01</div>
            <div className="hc-card-inner">
              <h3>ติดตามการจอง</h3>
              <p>ตรวจสอบสถานะนัดหมายล่าสุดของคุณได้ที่นี่</p>
              <Link to="/UserProfile" className="hc-link">ตรวจสอบเลย</Link>
            </div>
          </div>

          <div className="hc-service-card" data-aos="fade-up" data-aos-delay="400">
            <div className="hc-bg-text">02</div>
            <div className="hc-card-inner">
              <h3>จัดการนัดหมาย</h3>
              <p>เปลี่ยนแปลงหรือยกเลิกการจองได้ด้วยตัวเอง</p>
              <Link to="/UserProfile" className="hc-link">จัดการ</Link>
            </div>
          </div>

          <div className="hc-service-card" data-aos="fade-up" data-aos-delay="600">
            <div className="hc-bg-text">03</div>
            <div className="hc-card-inner">
              <h3>ค้นหาสาขา</h3>
              <p>ดูแผนที่สาขา เวลาทำการ และที่จอดรถ</p>
              <Link to="/AllStores" className="hc-link">ดูแผนที่</Link>
            </div>
          </div>
        </div>
      </section>

      {/* TOPICS SECTION */}
      <section className="hc-topics-section">
        <div className="hc-container-v2">
           <div className="hc-flex-header">
              <h2 className="hc-side-title" data-aos="fade-right">หัวข้อ</h2>
              <div className="hc-topics-grid">
                  {TOPICS.map((topic, i) => {
                    const isOpen = openTopicId === topic.id;
                    return (
                      <div
                        key={topic.id}
                        className="hc-topic-item"
                        ref={(el) => { topicRefs.current[topic.id] = el; }}
                        data-aos="fade-left"
                        data-aos-delay={(i + 1) * 100}
                      >
                        <button
                          type="button"
                          className="hc-topic-trigger"
                          aria-expanded={isOpen}
                          onClick={() => setOpenTopicId(isOpen ? null : topic.id)}
                        >
                          <span>{topic.title}</span>
                          <small>{topic.summary}</small>
                        </button>
                        {isOpen && (
                          <div className="hc-topic-answer">
                            <p>{topic.answer}</p>
                            {topic.linkTo && (
                              <Link to={topic.linkTo} className="hc-link">{topic.linkLabel}</Link>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
           </div>
        </div>
      </section>

      {/* CONTACT BANNER */}
      <section className="hc-contact-banner">
        <div className="hc-banner-box" data-aos="zoom-out-up">
           <p data-aos="fade-in" data-aos-delay="400">ยังต้องการความช่วยเหลืออยู่ใช่ไหม?</p>
           <h2 data-aos="fade-up" data-aos-delay="600">ติดต่อเรา</h2>
           <div className="hc-contact-links" data-aos="fade-up" data-aos-delay="800">
              <a href="mailto:hello@glamnail.com">อีเมลหาเรา</a>
              <span className="hc-dot"></span>
              <a href="tel:0812345678">โทรหาฝ่ายบริการ</a>
           </div>
        </div>
      </section>
    </div>
  );
}