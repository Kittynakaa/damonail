import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css"; // อย่าลืม Import CSS ของ AOS
import PageHero from "./components/PageHero";
import "./Articles.css";

const ARTICLES = [
  // ... ข้อมูลเดิมของคุณ ...
  {
    id: "acrylic",
    title: "5 ข้อควรเช็คก่อน “ต่อเล็บอะคริลิค” ครั้งแรก",
    date: "29 กันยายน 2025",
    author: "ทีมงาน Crystal Shine",
    img: "https://i.pinimg.com/1200x/30/1a/bf/301abf18f73caf5a56e467e31a262b53.jpg",
    desc: "ก่อนจะต่อเล็บอะคริลิค ควรรู้ 5 สิ่งนี้ เพื่อป้องกันปัญหาเล็บพังและให้เล็บอยู่ทนสวยยาวนาน ",
    tags: ["Acrylic", "Nail Care"],
  },
  {
    id: "gelcare",
    title: "เคล็ดลับดูแลเล็บเจลให้อยู่ทนนาน ไม่หลุดง่าย",
    date: "5 กันยายน 2025",
    author: "ทีมงาน Crystal Shine",
    img: "https://i.pinimg.com/736x/d6/81/9d/d6819d63cce9d7694bb506f13ada303d.jpg",
    desc: "เล็บเจลสวยเงาแต่ก็ต้องดูแลให้ถูกวิธี มาดูเทคนิคที่ทำให้เล็บของคุณอยู่ได้เป็นเดือน ",
    tags: ["Gel", "Care Tips"],
  },
  {
    id: "colorskin",
    title: "เลือกสีเล็บให้เข้ากับสีผิว: คู่มือสำหรับมือใหม่",
    date: "22 สิงหาคม 2025",
    author: "ทีมงาน Crystal Shine",
    img: "https://i.pinimg.com/736x/ca/9e/06/ca9e0624fbe2a0d62c7031c57e23c587.jpg",
    desc: "โทนผิวของคุณเข้ากับสีเล็บไหนที่สุด? บทความนี้มีคำตอบ พร้อมตัวอย่างเฉดที่ช่วยขับผิวให้ดูโดดเด่น ",
    tags: ["Color", "Skin Tone"],
  },
  {
    id: "nailtrend",
    title: "เทรนด์สีเล็บปี 2025 ที่ทุกคนต้องลอง!",
    date: "15 กรกฎาคม 2025",
    author: "ทีมงาน Crystal Shine",
    img: "https://i.pinimg.com/736x/db/a9/1e/dba91eb8af6dc17e380840fb3308c5c7.jpg",
    desc: "รวมสีเล็บสุดชิคที่กำลังมาแรงในปี 2025 พร้อมแนวทางจับคู่ลุคให้สวยหรูทุกโอกาส ",
    tags: ["Trend", "2025"],
  },
];

const HELPFUL_LINKS = [
  {
    title: "คลินิกดูแลสุขภาพเล็บ ดูแลเรื่องเล็บให้เป็นเรื่องเล็ก",
    source: "โรงพยาบาลศิริราช ปิยมหาราชการุณย์",
    desc: "รวมข้อมูลปัญหาเล็บที่พบบ่อย เช่น เล็บขบ เล็บเป็นเชื้อรา เล็บผิดรูป และแนวทางดูแลโดยทีมแพทย์ในไทย",
    url: "https://www.siphhospital.com/th/news/news-activities/share/88",
  },
  {
    title: "ดูแค่เล็บ ก็เช็คโรคได้",
    source: "โรงพยาบาลพริ้นซ์ สุวรรณภูมิ",
    desc: "อธิบายลักษณะเล็บที่อาจเชื่อมโยงกับภาวะสุขภาพต่าง ๆ และช่วยให้สังเกตความผิดปกติได้ง่ายขึ้น",
    url: "https://www.princsuvarnabhumi.com/articles/content-nail-disease-check",
  },
  {
    title: "เรื่องเล็บที่ไม่ควรมองข้าม",
    source: "Asoke Skin Hospital",
    desc: "เหมาะกับคนที่ทำเล็บบ่อย เพราะมีคำแนะนำเรื่องการตัดหนังรอบเล็บ ความชุ่มชื้น และการลดความเสี่ยงเชื้อรา",
    url: "https://asokeskin.com/hospital-services/nail-issues-you-shouldnt-ignore-nail-care-you-shouldnt-overlook",
  },
  {
    title: "คลินิกดูแลเท้าและเล็บ",
    source: "โรงพยาบาลบำรุงราษฎร์",
    desc: "ข้อมูลบริการดูแลเล็บและปัญหาเท้า-เล็บแบบครบวงจรในประเทศไทย โดยเฉพาะกลุ่มที่ต้องการการดูแลเฉพาะทาง",
    url: "https://www.bumrungrad.com/th/centers/holistic-wound-care-center-bangkok-thailand",
  },
];

export default function Articles() {
  // เริ่มต้นใช้งาน AOS
  useEffect(() => {
    AOS.init({
      duration: 1200, // ความเร็วในการเล่นแอนิเมชัน
      once: true,     // เล่นครั้งเดียวตอนเลื่อนมาเจอ
      easing: "ease-out-quart", // จังหวะการเคลื่อนไหวแบบพรีเมียม
    });
  }, []);

  const others = ARTICLES.slice(1);

  return (
    <div className="articles-page-wrapper">
      {/* Header Section */}
      <PageHero
        eyebrow="เจาะลึกเรื่องเล็บและความงาม"
        title={<>รวมบทความมากมาย<br />ที่ช่วยให้เล็บของคุณดูสมบูรณ์แบบ!</>}
        description="ดูแลความงามด้วยความช่วยเหลือจาก AI พร้อมเคล็ดลับดูแลเล็บจากทีมงาน Crystal Shine"
        chips={["Nail Care", "Trend 2025", "AI สีผิว", "เคล็ดลับผู้เชี่ยวชาญ"]}
      />

      {/* Services/Topics Section */}
      <section className="container-articles">
        <div className="articles-section-header">
            <h2 className="articles-background-text" data-aos="fade-up" data-aos-offset="0">บทความ</h2>
            <div className="articles-grid-three">
                <div className="articles-topic-card" data-aos="fade-up" data-aos-delay="200">
                    <h3 className="articles-topic-title">ความรู้พื้นฐาน</h3>
                    <p className="articles-topic-label">พื้นฐานการดูแลเล็บ</p>
                    <p className="articles-topic-desc">พื้นฐานเรื่องเล็บที่ควรรู้ก่อนทำเล็บทุกประเภท เพื่อสุขภาพเล็บที่ยั่งยืน</p>
                    <a className="articles-btn-readmore" href="https://www.siphhospital.com/th/news/news-activities/share/88" target="_blank" rel="noopener noreferrer">อ่านเพิ่มเติม</a>
                </div>
                <div className="articles-topic-card" data-aos="fade-up" data-aos-delay="400">
                    <h3 className="articles-topic-title">วิเคราะห์ด้วย AI</h3>
                    <p className="articles-topic-label">ความงามอัจฉริยะ</p>
                    <p className="articles-topic-desc">การนำเทคโนโลยี AI มาช่วยวิเคราะห์โทนผิวและรูปทรงเล็บที่เหมาะกับคุณ</p>
                    <Link className="articles-btn-readmore" to="/analyze">อ่านเพิ่มเติม</Link>
                </div>
                <div className="articles-topic-card" data-aos="fade-up" data-aos-delay="600">
                    <h3 className="articles-topic-title">เทรนด์ 2025</h3>
                    <p className="articles-topic-label">ลุคแฟชั่น</p>
                    <p className="articles-topic-desc">อัปเดตเทรนด์สีเล็บและดีไซน์สุดชิคก่อนใครในปี 2025</p>
                    <a className="articles-btn-readmore" href="https://www.princsuvarnabhumi.com/articles/content-nail-disease-check" target="_blank" rel="noopener noreferrer">อ่านเพิ่มเติม</a>
                </div>
            </div>
        </div>
      </section>

      <section className="container-articles articles-resource-section">
        <div className="articles-resource-header" data-aos="fade-right">
          <p className="articles-sub-title">ลิงก์ที่เกี่ยวข้อง</p>
          <h3 className="articles-resource-title">แหล่งข้อมูลเพิ่มเติมที่น่าสนใจ</h3>
        </div>
        <div className="articles-resource-grid">
          {HELPFUL_LINKS.map((item, index) => (
            <a
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="articles-resource-card"
              data-aos="fade-up"
              data-aos-delay={index * 120}
            >
              <p className="articles-resource-source">{item.source}</p>
              <h4>{item.title}</h4>
              <p className="articles-resource-desc">{item.desc}</p>
              <span className="articles-resource-link">เปิดลิงก์ ↗</span>
            </a>
          ))}
        </div>
      </section>

      {/* Get In Touch Banner */}
      <section className="articles-banner-section" data-aos="fade-in">
        <div className="articles-banner-content" data-aos="zoom-out-up" data-aos-delay="200">
            <p style={{ fontStyle: 'italic', fontSize: '18px' }}>ต้องการข้อมูลเพิ่มเติมใช่ไหม?</p>
            <h2 className="articles-banner-title">ติดต่อเรา</h2>
            <p className="articles-banner-sub">พร้อมปรึกษาเรื่องสุขภาพเล็บและการเลือกสีที่ใช่สำหรับคุณผ่าน AI ของเรา</p>
            <Link className="articles-btn-white" to="/helpCenter">ส่งข้อความหาเรา</Link>
        </div>
      </section>

      {/* Latest Articles Grid */}
      <section className="container-articles">
        <h3 
            style={{fontWeight:'300', fontFamily: 'Playfair Display', fontSize: '32px', textAlign: 'center', marginBottom: '40px' }}
            data-aos="fade-right"
        >
            บทความล่าสุด
        </h3>
        <div className="articles-list-grid">
          {others.map((a, index) => (
            <Link 
                key={a.id} 
                to={`/article/${a.id}`} 
                className="articles-mini-card"
                data-aos="fade-up"
                data-aos-delay={index * 150} // ให้แต่ละ Card ทยอยขึ้นมา
            >
              <img src={a.img} alt={a.title} className="articles-mini-img" />
              <div className="articles-mini-info">
                <p className="articles-meta-text">{a.author} • {a.date}</p>
                <h4 className="articles-mini-title">{a.title}</h4>
                <p className="articles-mini-desc">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer / Freebie Section */}
      <section className="articles-footer-section">
          <div className="articles-footer-inner" data-aos="fade-up">
              <div className="articles-freebie-box" data-aos="fade-right" data-aos-delay="300">
                  <img src="https://i.pinimg.com/1200x/c8/64/09/c86409eb01de7fbdf642a315ffad038f.jpg" alt="คู่มือดูแลเล็บ" className="articles-freebie-img" />
                  <div className="articles-freebie-overlay">คู่มือดูแลเล็บ</div>
              </div>
              <div className="articles-subscribe-box" data-aos="fade-left" data-aos-delay="500">
                  <h2 className="articles-subscribe-title">รับ "คู่มือดูแลเล็บ" ฟรี</h2>
                  <input type="email" placeholder="อีเมล" className="articles-input-field" />
                  <button className="articles-btn-waitlist">เข้าร่วมรายชื่อรอ</button>
              </div>
          </div>
      </section>
    </div>
  );
}
