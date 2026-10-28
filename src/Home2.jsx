import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getClick_log } from "./callapi/call_api_home.jsx";
import "./Home2.css";

const IMAGE_BASE_URL = "http://localhost:5010/static/images";

export default function Home2() {
  const [searchArea, setSearchArea] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchTime, setSearchTime] = useState("14:30");
  const [searchService, setSearchService] = useState("เจลมือ / เท้า");
  const [clickLog, setClickLog] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    async function fetchClickLog() {
      try {
        const res = await getClick_log();
        if (Array.isArray(res.data)) {
          setClickLog(res.data);
        } else {
          console.error("No data or invalid format:", res);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }
    }

    fetchClickLog();
  }, []);

  const navigate = useNavigate();

  const goSearch = () => {
    const params = new URLSearchParams();
    if (searchArea) params.set("q", searchArea);
    if (searchService) params.set("service", searchService);
    if (searchDate) params.set("date", searchDate);
    if (searchTime) params.set("time", searchTime);
    navigate(`/AllStores?${params.toString()}`);
  };

  const toggleFav = (id) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const stores = useMemo(
    () => [
      {
        id: "s-1",
        title: "Pink Atelier Siam",
        desc: "BTS สยาม • เจลมือ/เท้า • เพ้นท์ลายมินิมอล",
        rating: 4.9,
        price: 890,
        distance: 0.9,
        img: "/Nailshop/Nailshop7.jpg",
        times: ["14:00", "15:30", "17:00"],
        badge: "อันดับต้น",
      },
      {
        id: "s-2",
        title: "Blush & Buff Ari",
        desc: "BTS อารีย์ • สปา • ต่อเล็บธรรมชาติ",
        rating: 4.7,
        price: 690,
        distance: 3.2,
        img: "/Nailshop/Nailshop9.jpg",
        times: ["13:00", "16:00", "18:30"],
        badge: "โปรโมชั่น",
      },
      {
        id: "s-3",
        title: "Milk Pink Studio KK",
        desc: "ขอนแก่น • โทนชมพู-ขาว • เพ้นท์มินิมอล",
        rating: 4.8,
        price: 790,
        distance: 1.5,
        img: "/Nailshop/Nailshop8.jpg",
        times: ["11:30", "15:00", "19:00"],
        badge: "ใหม่",
      },
    ],
    []
  );

  return (
    <main className="home">
      <section className="hero-container">
        <div className="container">
          <h1 className="beatrice-title">Crystal Shine</h1>

          <div className="hero-image-wrapper">
            <img src="/Nailshop/model.jpg" alt="Nail Art Design" />
          </div>

          <div className="hero-float-text">
            ค้นพบสีเล็บที่ใช่และทรงเล็บที่ชอบ
            <br />
            ผ่านเทคโนโลยี AI วิเคราะห์สีผิว
            <br />
            เพื่อลุคที่สมบูรณ์แบบที่สุดสำหรับคุณ
          </div>

          <Link to="/AllStores" className="shop-now-pill">
            จองคิวออนไลน์ &rarr;
          </Link>
        </div>
      </section>

      <div className="marquee-strip">
        <div className="marquee-track">
          <div className="marquee-content">
            <span>AI วิเคราะห์สีผิว ✹ สตูดิโอทำเล็บระดับพรีเมียม ✹ จับคู่สีแม่นยำ ✹</span>
            <span>AI วิเคราะห์สีผิว ✹ สตูดิโอทำเล็บระดับพรีเมียม ✹ จับคู่สีแม่นยำ ✹</span>
            <span>AI วิเคราะห์สีผิว ✹ สตูดิโอทำเล็บระดับพรีเมียม ✹ จับคู่สีแม่นยำ ✹</span>
            <span>AI วิเคราะห์สีผิว ✹ สตูดิโอทำเล็บระดับพรีเมียม ✹ จับคู่สีแม่นยำ ✹</span>
          </div>
          <div className="marquee-content" aria-hidden="true">
            <span>AI วิเคราะห์สีผิว ✹ สตูดิโอทำเล็บระดับพรีเมียม ✹ จับคู่สีแม่นยำ ✹</span>
            <span>AI วิเคราะห์สีผิว ✹ สตูดิโอทำเล็บระดับพรีเมียม ✹ จับคู่สีแม่นยำ ✹</span>
            <span>AI วิเคราะห์สีผิว ✹ สตูดิโอทำเล็บระดับพรีเมียม ✹ จับคู่สีแม่นยำ ✹</span>
            <span>AI วิเคราะห์สีผิว ✹ สตูดิโอทำเล็บระดับพรีเมียม ✹ จับคู่สีแม่นยำ ✹</span>
          </div>
        </div>
      </div>

      <div
        className="container search-container-luxury"
        style={{ marginTop: "72px", marginBottom: "28px", position: "relative", zIndex: 10 }}
      >
        <div className="search-card-editorial">
          <div className="search-grid">
            <div className="search-field">
              <label>สถานที่</label>
              <input
                type="text"
                placeholder="สยาม, อารีย์..."
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
              />
            </div>
            <div className="search-field">
              <label>วันที่</label>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
            <div className="search-field">
              <label>บริการ</label>
              <select
                value={searchService}
                onChange={(e) => setSearchService(e.target.value)}
              >
                <option>เจลมือ / เท้า</option>
                <option>เพ้นท์ลาย</option>
                <option>ต่อเล็บ</option>
                <option>สปามือ-เท้า</option>
              </select>
            </div>
            <button className="search-submit-btn" onClick={goSearch}>
              ค้นหาคิวว่าง
            </button>
          </div>
        </div>
      </div>

      <section id="popular" style={{ padding: "100px 0" }}>
        <div className="container">
          <div className="section-header-editorial">
            <h2 className="playfair-title">ร้านยอดนิยม</h2>
            <p className="cormorant-subtitle">
              สตูดิโอยอดนิยมที่ได้รับการจัดอันดับสูงสุดในสัปดาห์นี้
            </p>
          </div>

          <div className="grid grid-4 home-popular-grid" style={{ marginTop: "50px" }}>
            {clickLog.slice(0, 4).map((p, index) => (
              <article className="st-card-luxury" key={index}>
                <Link to="/AllStores" style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="st-img-wrapper">
                      <img
                        src={p.image ? `${IMAGE_BASE_URL}/${p.image}` : "/Nailshop/placeholder.jpg"}
                        alt={p.store_name}
                        onError={(e) => {
                          e.currentTarget.src = "/Nailshop/placeholder.jpg";
                        }}
                      />
                    <span className="badge-luxury">มาแรง</span>
                  </div>
                  <div className="st-content">
                    <h3>{p.store_name}</h3>
                    <div className="st-meta-luxury">
                      <span>★ {Number(p.rating || 0).toFixed(1)}</span>
                      <span className="st-price-tag">เริ่ม ฿{p.price}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: "80px 0" }}>
        <div
          className="category-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "40px" }}
        >
          <div className="category-card" style={{ textAlign: "center" }}>
            <div className="img-frame">
              <img src="/Nailshop/store.jpg" alt="สตูดิโอระดับพรีเมียม" />
            </div>
            <h4 style={{ fontSize: "24px", letterSpacing: "2px" }}>ร้านค้า</h4>
            <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}>
              รวมสตูดิโอทำเล็บระดับพรีเมียม การันตีคุณภาพและงานดีไซน์ที่ประณีต
            </p>
            <Link to="/AllStores" style={{ textDecoration: "none", color: "#000", fontSize: "12px", fontWeight: "bold" }}>
              ดูร้านทั้งหมด &rarr;
            </Link>
          </div>

          <div className="category-card" style={{ textAlign: "center" }}>
            <div className="img-frame">
              <img src="/Nailshop/nailai.jpg" alt="สี AI" />
            </div>
            <h4 style={{ fontSize: "24px", letterSpacing: "2px" }}>สี AI</h4>
            <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}>
              วิเคราะห์ Undertone ของคุณ เพื่อค้นหาสีเล็บที่ช่วยขับผิวให้ดูโดดเด่น
            </p>
            <Link to="#" style={{ textDecoration: "none", color: "#000", fontSize: "12px", fontWeight: "bold" }}>
              เริ่มวิเคราะห์ &rarr;
            </Link>
          </div>

          <div className="category-card" style={{ textAlign: "center" }}>
            <div className="img-frame">
              <img src="/Nailshop/nailshap.jpg" alt="ทรงเล็บ" />
            </div>
            <h4 style={{ fontSize: "24px", letterSpacing: "2px" }}>ทรงเล็บ</h4>
            <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}>
              จาก Oval ถึง Coffin ค้นหาทรงเล็บที่ช่วยให้มือของคุณดูเรียวยาวและสวยงาม
            </p>
            <Link to="#" style={{ textDecoration: "none", color: "#000", fontSize: "12px", fontWeight: "bold" }}>
              ดูทรงเล็บที่แนะนำ &rarr;
            </Link>
          </div>
        </div>
      </section>

      <section className="tone-section">
        <div className="container" style={{ display: "flex", alignItems: "center", gap: "80px" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "56px", margin: "0 0 20px", fontWeight: "400" }}>
              นิยามใหม่แห่งความงาม
            </h2>
            <p
              style={{
                color: "#555",
                fontSize: "17px",
                lineHeight: "1.8",
                marginBottom: "40px",
                fontWeight: "300",
              }}
            >
              เราเชื่อว่าเล็บที่สวยคือเล็บที่รับกับบุคลิกและสีผิว แพลตฟอร์มของเราใช้ AI
              ในการช่วยคุณตัดสินใจเลือกสิ่งที่ดีที่สุด ไม่ว่าจะเป็นสีเจลโทนสุภาพสำหรับออกงาน
              หรือดีไซน์มินิมอลสำหรับวันทำงาน
            </p>
            <button
              className="btn"
              style={{
                background: "#000",
                color: "#fff",
                padding: "15px 45px",
                borderRadius: 0,
                border: "none",
                cursor: "pointer",
              }}
            >
              ค้นหาแรงบันดาลใจ
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <div className="video-frame">
              <video autoPlay muted loop playsInline poster="//Nailshop/nailshap.jpg">
                <source src="/Nailshop/nailvedio.mov" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      <section id="discover" className="luxury-sec gray-bg">
        <div className="container">
          <div className="editorial-head">
            <div>
              <h2 className="playfair-title">ร้านแนะนำประจำย่าน</h2>
              <p className="cormorant-subtitle">
                คัดสรรร้านแนะนำที่อยู่ใกล้ตำแหน่งปัจจุบันของคุณ
              </p>
            </div>
            <Link className="editorial-link" to="/AllStores">
              ดูเพิ่มเติม →
            </Link>
          </div>

          <div className="editorial-grid" id="store-grid">
            {stores.map((s) => (
              <article className="luxury-card full-detail" key={s.id}>
                <button
                  className={`luxury-heart ${favorites.has(s.id) ? "active" : ""}`}
                  onClick={() => toggleFav(s.id)}
                  aria-label="favorite"
                >
                  {favorites.has(s.id) ? "❤" : "♡"}
                </button>

                <div className="luxury-cover">
                  <img src={s.img} alt={s.title} />
                  <span className="top-badge">{s.badge}</span>
                </div>

                <div className="luxury-body">
                  <h3 className="playfair-name">{s.title}</h3>
                  <p className="luxury-desc">{s.desc}</p>

                  <div className="luxury-meta">
                    <span className="stars">★ {s.rating.toFixed(1)}</span>
                    <span className="dist">• {s.distance} กม.</span>
                    <span className="price">฿{s.price}</span>
                  </div>

                  <div className="luxury-avail">
                    {s.times.map((time) => (
                      <span className="time-chip" key={time}>
                        {time}
                      </span>
                    ))}
                  </div>

                  <div className="luxury-cta">
                    <Link className="btn-outline-thin" to="/store2" state={{ storeId: s.id }}>
                      ดูรายละเอียด
                    </Link>
                    <Link className="btn-black-thin" to="#">
                      จองเลย
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-section-luxury">
        <div className="container ai-editorial-grid">
          <div className="ai-text-side">
            <span className="editorial-tag">นวัตกรรม</span>
            <h2 className="playfair-title" style={{ fontSize: "48px" }}>
              AI วิเคราะห์<br />
              ความงาม
            </h2>
            <p className="ai-manifesto">
              เพราะเราเชื่อว่าเล็บที่สวยที่สุดคือเล็บที่รับกับตัวตนของคุณ ระบบ AI ของเราจะช่วยวิเคราะห์
              Skin Undertone และรูปทรงมือ เพื่อผลลัพธ์ที่สมบูรณ์แบบเสมือนมีสไตลิสต์ส่วนตัว
            </p>
            <div className="ai-feature-list">
              <div className="feature-item">
                <h4>01 / จับคู่โทนสีผิว</h4>
                <p>ค้นหาเฉดสีที่ช่วยขับผิวให้ดูสว่างและสุขภาพดี</p>
              </div>
              <div className="feature-item">
                <h4>02 / วิเคราะห์รูปทรงมือ</h4>
                <p>แนะนำทรงเล็บที่ช่วยให้นิ้วดูเรียวยาวและสมส่วน</p>
              </div>
            </div>
          </div>
          <div className="ai-visual-side">
            <div className="img-frame-editorial">
              <img src="/Nailshop/nailai.jpg" alt="AI Analysis" />
            </div>
          </div>
        </div>
      </section>

      <section className="nail-shapes-editorial" style={{ padding: "120px 0", background: "#fff" }}>
        <div className="container">
          <div className="section-header-editorial center">
            <h2 className="playfair-title">ศิลปะแห่งทรงเล็บ</h2>
            <p className="cormorant-subtitle">
              ค้นพบรูปทรงที่เหมาะกับบุคลิกและลักษณะมือของคุณ
            </p>
          </div>

          <div className="shapes-grid-magazine">
            {[
              { name: "Oval", desc: "หรูหรา ช่วยให้นิ้วดูเรียวยาว", img: "/nails/oval.jpg" },
              { name: "Almond", desc: "ทันสมัย ปลายเรียวดูแพง", img: "/nails/almond.jpg" },
              { name: "Square", desc: "คลาสสิก แข็งแรง มั่นใจ", img: "/nails/square.jpg" },
              { name: "Coffin", desc: "สายแฟชั่น ยอดนิยมระดับโลก", img: "/nails/coffin.jpg" },
            ].map((shape, i) => (
              <div className="shape-card-mag" key={i}>
                <div className="shape-img-box">
                  <img src={shape.img} alt={shape.name} />
                </div>
                <h4>{shape.name}</h4>
                <p>{shape.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-minimal">
        <div className="container">
          <div className="cta-box-editorial">
            <h2 className="playfair-title">เข้าร่วมเครือข่ายพาร์ตเนอร์ของเรา</h2>
            <p>
              คุณเป็นเจ้าของสตูดิโอทำเล็บที่ใส่ใจในงานศิลปะใช่หรือไม่?
              <br />
              มาร่วมเป็นส่วนหนึ่งของแพลตฟอร์มที่รวบรวมร้านระดับพรีเมียมที่สุด
            </p>
            <Link to="/addStore" className="btn-luxury-outline">
              สมัครเป็นพาร์ตเนอร์
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
