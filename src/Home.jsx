import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getClick_log } from "./callapi/call_api_home.jsx"; // ส่วนดึงข้อมูลยอดนิยม
import useNearbyStores from "./hooks/useNearbyStores";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Home.css";
import { FiMapPin, FiCalendar, FiScissors, FiDroplet, FiTarget, FiZap, FiTag, FiUsers } from "react-icons/fi";

const IMAGE_BASE_URL = "http://localhost:5010/static/images";
const NEARBY_PROVINCES = ["ขอนแก่น", "กรุงเทพมหานคร", "เชียงราย", "ชัยภูมิ", "นครสวรรค์", "กระบี่"];

const NAIL_SHAPES = [
  {
    id: "oval",
    nameEn: "Oval",
    nameTh: "ทรงไข่",
    feature: "โค้งมนละมุนตามรูปทรงธรรมชาติของปลายนิ้ว",
    suitable: "คนที่มีหน้าเล็บสั้น หรือนิ้วค่อนข้างสั้น ช่วยพรางตาให้อิริยาบถมือดูเรียวยาว อ่อนหวาน และดูแลรักษาง่าย",
  },
  {
    id: "almond",
    nameEn: "Almond",
    nameTh: "ทรงอัลมอนด์",
    feature: "ฐานกว้าง ค่อย ๆ เรียวแหลมขึ้นไปทางปลายเล็บและลบมุมมน",
    suitable: "ผู้ที่ต้องการลุคหรูหรา สายแฟชั่น ช่วยให้นิ้วมือดูยาวและเพรียว เหมาะกับทั้งเล็บจริงที่ยาวและเล็บต่อ",
  },
  {
    id: "square",
    nameEn: "Square",
    nameTh: "ทรงเหลี่ยม",
    feature: "ตัดตรงที่ปลายเล็บ ทำมุมฉาก 90 องศากับขอบข้าง",
    suitable: "คนที่มีหน้าเล็บยาวเรียวอยู่แล้ว หรือชอบความโมเดิร์น เรียบเท่ สไตล์สายแฟชั่น",
    highlight: "โครงสร้างแข็งแรงและเหมาะกับผู้ที่ต้องการลุคเรียบคม",
  },
  {
    id: "coffin",
    nameEn: "Coffin / Ballerina",
    nameTh: "ทรงคอฟฟิน / บัลเลต์",
    feature: "เรียวแคบลงเข้าหาปลายเล็บ แต่ตัดตรงที่ปลายสุด คล้ายทรงโลงศพหรือรองเท้าบัลเลต์",
    suitable: "การต่อเล็บยาวโดยเฉพาะ เสริมลุคให้ดูโดดเด่น มีเสน่ห์ และเหมาะกับการเพ้นท์ลายหรือประดับอะไหล่",
  },
];

// ขนาดจริงของรูปแต่ละทรงเล็บ (ใช้ตั้ง width/height ของ <img> กันหน้าเว็บเด้งตอนโหลดรูป)
const NAIL_SHAPE_DIMS = {
  oval: { w: 300, h: 466 },
  almond: { w: 254, h: 402 },
  square: { w: 298, h: 392 },
  coffin: { w: 284, h: 426 },
};

export default function Home() {
  // 1. State สำหรับค้นหา
  const [searchArea, setSearchArea] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchTime, setSearchTime] = useState("14:30");
  const [searchService, setSearchService] = useState("เจลมือ / เท้า");

  // 2. State สำหรับเก็บข้อมูลจาก Database (API)
  const [Click_log, setClick_log] = useState([]);

  // 3. ส่วนดึงข้อมูล (API Fetching) และ Initial AOS
  useEffect(() => {
    // ตั้งค่า AOS
    AOS.init({
      duration: 1200,
      once: true,
      easing: 'ease-out-quart'
    });

    // ฟังก์ชันดึงข้อมูล Popular Stores
    async function fetchClick_log() {
      try {
        const res = await getClick_log();
        if (Array.isArray(res.data) && res.data.length > 0) {
          setClick_log(res.data); // เก็บข้อมูลร้านที่ถูกคลิกบ่อย/ยอดนิยม
        }
      } catch (err) {
        console.error("Error fetching click log:", err);
      }
    }
    fetchClick_log();
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

  // 4. Favorites & Chips Logic
  const [favorites, setFavorites] = useState(new Set());
  const toggleFav = (id) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // 5. ร้านใกล้ฉัน -- ขอตำแหน่ง GPS อัตโนมัติ, fallback เป็นเลือกจังหวัดถ้าไม่อนุญาต
  const {
    stores: nearbyStores,
    loading: nearbyLoading,
    permissionDenied: nearbyPermissionDenied,
    searchByProvince,
  } = useNearbyStores();

  return (
    <main className="home">
      {/* HERO SECTION */}
      <section className="hero-container">
        <div className="container">
          <h1 className="beatrice-title" data-aos="fade-down">Crystal Shine</h1>
          <div className="hero-image-wrapper" data-aos="zoom-in" data-aos-duration="1500">
            <picture>
              <source srcSet="/Nailshop/model.webp" type="image/webp" />
              <img
                src="/Nailshop/model.jpg"
                alt="Nail Art Design"
                width={735}
                height={980}
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          </div>
          <div className="hero-float-text" data-aos="fade-up" data-aos-delay="400">
            ค้นพบสีเล็บที่ใช่และทรงเล็บที่ชอบ ผ่านเทคโนโลยี AI วิเคราะห์สีผิว
          </div>
          <Link to="/AllStores" className="shop-now-pill" data-aos="fade-up" data-aos-delay="600">
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

      {/* SEARCH BAR */}
      <div className="container search-container-luxury" data-aos="fade-up" data-aos-offset="0">
        <div className="search-card-editorial">
          <div className="search-grid">
            <div className="search-field">
              <label htmlFor="home-search-area"><FiMapPin className="search-field-icon" /> สถานที่</label>
              <input id="home-search-area" type="text" placeholder="สยาม, อารีย์..." value={searchArea} onChange={(e) => setSearchArea(e.target.value)} />
            </div>
            <div className="search-field">
              <label htmlFor="home-search-date"><FiCalendar className="search-field-icon" /> วันที่</label>
              <input id="home-search-date" type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
            </div>
            <div className="search-field">
              <label htmlFor="home-search-service"><FiScissors className="search-field-icon" /> บริการ</label>
              <select id="home-search-service" value={searchService} onChange={(e) => setSearchService(e.target.value)}>
                <option>เจลมือ / เท้า</option>
                <option>เพ้นท์ลาย</option>
                <option>ต่อเล็บ</option>
                <option>สปามือ-เท้า</option>
              </select>
            </div>
            <button className="search-submit-btn" onClick={goSearch}>ค้นหาคิวว่าง</button>
          </div>
        </div>
      </div>

      {/* POPULAR STORES - ดึงข้อมูลจาก Click_log */}
      <section id="popular" style={{ padding: "100px 0" }}>
        <div className="container">
          <div className="section-header-editorial" data-aos="fade-right">
            <span className="section-eyebrow">คัดสรรเพื่อคุณ</span>
            <h2 className="playfair-title">ร้านยอดนิยม</h2>
            <p className="cormorant-subtitle">สตูดิโอยอดนิยมที่ได้รับการจัดอันดับสูงสุดในสัปดาห์นี้</p>
          </div>

          <div
            className="grid grid-4 home-popular-grid"
            style={{ marginTop: "50px" }}
          >
            {Click_log.slice(0, 4).map((p, index) => (
              <article className="st-card-luxury" key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <Link to="/AllStores" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="st-img-wrapper">
                    <img
                      src={p.image ? `${IMAGE_BASE_URL}/${p.image}` : "/Nailshop/placeholder.jpg"}
                      alt={p.store_name}
                      loading="lazy"
                      decoding="async"
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



   

      {/* DISCOVER - ร้านใกล้ฉัน (GPS อัตโนมัติ) */}
      <section id="discover" className="luxury-sec gray-bg">
        <div className="container">
          <div className="editorial-head" data-aos="fade-right">
            <div>
              <span className="section-eyebrow">ใกล้คุณที่สุด</span>
              <h2 className="playfair-title">ร้านแนะนำใกล้คุณ</h2>
            </div>
            <Link className="editorial-link" to="/AllStores">ดูเพิ่มเติม →</Link>
          </div>

          {nearbyPermissionDenied && (
            <div className="nearby-fallback" data-aos="fade-up">
              <span>ไม่ได้อนุญาตให้เข้าถึงตำแหน่ง — เลือกจังหวัดเพื่อค้นหาร้านแทน:</span>
              <select
                defaultValue=""
                aria-label="เลือกจังหวัดเพื่อค้นหาร้านแทน"
                onChange={(e) => e.target.value && searchByProvince(e.target.value)}
              >
                <option value="" disabled>เลือกจังหวัด</option>
                {NEARBY_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          )}

          {nearbyLoading && <p style={{ textAlign: "center" }}>กำลังค้นหาร้านใกล้คุณ...</p>}

          {!nearbyLoading && nearbyStores.length === 0 && !nearbyPermissionDenied && (
            <p style={{ textAlign: "center" }}>ไม่พบร้านใกล้เคียงในขณะนี้</p>
          )}

          <div className="editorial-grid">
            {nearbyStores.slice(0, 3).map((s, idx) => (
              <article className="luxury-card full-detail" key={s.store_id} data-aos="fade-up" data-aos-delay={idx * 150}>
                <div className="luxury-cover">
                  <img
                    src={s.image ? `${IMAGE_BASE_URL}/${s.image}` : "/Nailshop/placeholder.jpg"}
                    alt={s.store_name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.currentTarget.src = "/Nailshop/placeholder.jpg"; }}
                  />
                  <span className="luxury-rating-badge">★ {Number(s.avg_rating || 0).toFixed(1)}</span>
                  <span className={`luxury-tag-badge ${s.is_open ? "is-open" : "is-closed"}`}>
                    {s.is_open ? "เปิดอยู่" : "ปิดแล้ว"}
                  </span>
                </div>
                <div className="luxury-body">
                  <div className="luxury-name-row">
                    <h3 className="playfair-name">{s.store_name}</h3>
                  </div>
                  <p className="luxury-desc">{[s.street, s.subdistrict, s.district, s.province].filter(Boolean).join(" ")}</p>
                  <div className="luxury-meta-row">
                    {s.distance_km != null && (
                      <span className="luxury-distance">📍 ห่าง {s.distance_km} กม.</span>
                    )}
                    <span className="luxury-distance">คิวว่าง {s.available_slots} คิว</span>
                  </div>
                  <div className="luxury-cta">
                    <Link className="btn-outline-thin" to={`/store2/${s.store_id}`}>ดูรายละเอียด</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
         {/* CATEGORIES - ทยอยโผล่ทีละอัน */}
         <section className="container" style={{ padding: "80px 0" }}>
        <div className="category-grid">
          {['ร้านค้า', 'สี AI', 'ทรงเล็บ'].map((item, idx) => {
            const base = idx === 0 ? 'store' : idx === 1 ? 'nailai' : 'nailshap';
            const dims = idx === 0 ? { w: 1179, h: 1473 } : idx === 1 ? { w: 736, h: 1308 } : { w: 736, h: 981 };
            return (
            <div className="category-card" key={item} data-aos="fade-up" data-aos-delay={idx * 200}>
              <div className="img-frame">
                <picture>
                  <source srcSet={`/Nailshop/${base}.webp`} type="image/webp" />
                  <img src={`/Nailshop/${base}.jpg`} alt={item} width={dims.w} height={dims.h} loading="lazy" decoding="async" />
                </picture>
              </div>
              <h3>{item}</h3>
              <p>รายละเอียดคำอธิบายบริการ...</p>
              <Link to="/AllStores" style={{ textDecoration: "none", fontSize: "12px", fontWeight: "bold" }}>เพิ่มเติม &rarr;</Link>
            </div>
            );
          })}
        </div>
      </section>

      {/* AI SECTION - สไลด์สวนทางกัน */}
      <section className="ai-section-luxury">
        <div className="container ai-editorial-grid">
          <div className="ai-text-side" data-aos="fade-right">
            <span className="home-eyebrow-tag">นวัตกรรม</span>
            <h2 className="playfair-title" style={{ fontSize: "48px" }}>
              ปลดล็อกความงามเฉพาะตัวด้วย<br />AI Nail Analyzer
            </h2>
            <p className="ai-manifesto">
              ปลดล็อกความงามเฉพาะตัวด้วยนวัตกรรม AI Nail Analyzer ที่ประมวลผลจากรูปถ่ายมือของคุณ
              AI จะทำการวิเคราะห์โทนสีผิว (Undertone) และรูปทรงของนิ้วมือ เพื่อประมวลผลคำแนะนำที่แม่นยำที่สุด
              ไม่ว่าจะเป็นเฉดสีเจลที่ช่วยขับผิวให้ดูสว่าง หรือทรงเล็บที่ช่วยให้อิริยาบถมือดูเรียวยาว
              สมบูรณ์แบบทุกมิติโดยไม่ต้องเสียเวลาลองผิดลองถูก
            </p>

            <div className="feature-item">
              <h3><FiDroplet className="feature-item-icon" /> Skin Tone Detection</h3>
              <p>วิเคราะห์ Undertone ของผิว พร้อมแนะนำเฉดสีเล็บที่ช่วยขับผิวให้ดูโดดเด่น</p>
            </div>
            <div className="feature-item">
              <h3><FiTarget className="feature-item-icon" /> Hand Shape Analysis</h3>
              <p>ประเมินโครงสร้างและสัดส่วนของนิ้วมือ แนะนำทรงเล็บที่ช่วยให้มือดูสมดุลและเรียวยาว</p>
            </div>
            <div className="feature-item">
              <h3><FiZap className="feature-item-icon" /> Smart Matching</h3>
              <p>จับคู่ลายเล็บ สี และสไตล์ที่เหมาะกับผู้ใช้ ช่วยค้นหาสไตล์ที่เข้ากับบุคลิกและความชอบ</p>
            </div>

            <Link to="/analyze" className="btn-luxury-filled">ลองวิเคราะห์สไตล์ของคุณ</Link>
          </div>
          <div className="ai-visual-side" data-aos="fade-left">
            <div className="img-frame-editorial">
              <picture>
                <source srcSet="/Nailshop/nailai.webp" type="image/webp" />
                <img src="/Nailshop/nailai.jpg" alt="AI Analysis" width={736} height={1308} loading="lazy" decoding="async" />
              </picture>
            </div>
          </div>
        </div>
      </section>

      {/* SHAPES - เรียงลำดับจากซ้ายไปขวา */}
      <section className="nail-shapes-editorial">
        <div className="container">
          <div className="section-header-editorial" data-aos="fade-right">
            <div>
              <span className="section-eyebrow">คู่มือเลือกทรงเล็บ</span>
              <h2 className="playfair-title">เลือกทรงเล็บที่ใช่สำหรับคุณ</h2>
              <p className="cormorant-subtitle" style={{ marginTop: 8 }}>
                เลือกทรงเล็บที่ใช่ เพื่อปรับมือนิ้วให้ดูเรียวสวยและเข้ากับไลฟ์สไตล์การใช้งานของคุณ
              </p>
            </div>
            <Link className="editorial-link" to="/analyze">ลองเลือกทรงกับ AI →</Link>
          </div>

          <div className="shapes-grid-magazine">
            {NAIL_SHAPES.map((shape, i) => {
              const dims = NAIL_SHAPE_DIMS[shape.id];
              return (
              <div className="shape-card-mag" key={shape.id} data-aos="zoom-in" data-aos-delay={i * 100}>
                <div className="shape-img-box">
                  <picture>
                    <source srcSet={`/nails/${shape.id}.webp`} type="image/webp" />
                    <img src={`/nails/${shape.id}.png`} alt={shape.nameEn} width={dims.w} height={dims.h} loading="lazy" decoding="async" />
                  </picture>
                </div>
                <h3>{shape.nameEn}</h3>
                <h4 className="shape-name-th">{shape.nameTh}</h4>
                <p className="shape-desc"><strong>ลักษณะ:</strong> {shape.feature}</p>
                <p className="shape-desc"><strong>เหมาะสำหรับ:</strong> {shape.suitable}</p>
                {shape.highlight && (
                  <p className="shape-desc"><strong>จุดเด่น:</strong> {shape.highlight}</p>
                )}
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PARTNER NETWORK */}
      <section className="ai-section-luxury">
        <div className="container ai-editorial-grid">
          <div className="ai-text-side" data-aos="fade-right">
            <span className="home-eyebrow-tag">พาร์ตเนอร์</span>
            <h2 className="playfair-title" style={{ fontSize: "40px" }}>
              ยกระดับร้านทำเล็บของคุณสู่ยุคดิจิทัล
            </h2>
            <p className="ai-manifesto">
              ยกระดับร้านทำเล็บของคุณสู่ยุคดิจิทัลด้วยการเข้าร่วมเป็นพาร์ตเนอร์กับเรา
              แพลตฟอร์มที่เชื่อมโยงลูกค้าที่กำลังมองหาร้านทำเล็บคุณภาพเข้ากับร้านของคุณ
              พร้อมเทคโนโลยี AI ที่ช่วยเรียกลูกค้าและเพิ่มยอดขายอย่างยั่งยืน
            </p>

            <div className="benefit-grid">
              <div className="benefit-card">
                <span className="benefit-icon"><FiTag /></span>
                <h3>Free Listing</h3>
                <p>โปรโมตร้านค้า ผลงาน และโปรโมชันของคุณบนแพลตฟอร์มฟรี</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon"><FiUsers /></span>
                <h3>AI Customer Matching</h3>
                <p>ส่งต่อลูกค้าที่มีความต้องการตรงกับสไตล์งานของร้านคุณโดยตรง</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon"><FiCalendar /></span>
                <h3>Booking System</h3>
                <p>ระบบจัดการคิวและนัดหมายล่วงหน้า ลดปัญหาคิวหลุดหรือการรอหน้าร้าน</p>
              </div>
            </div>

            <div className="partner-cta-row">
              <Link to="/addStore" className="btn-luxury-filled">สมัครเป็นพาร์ตเนอร์</Link>
              <Link to="/helpCenter" className="btn-luxury-outline">เรียนรู้เพิ่มเติม</Link>
            </div>
          </div>
          <div className="ai-visual-side" data-aos="fade-left">
            <div className="img-frame-editorial">
              <picture>
                <source srcSet="/Nailshop/Nailshop3.webp" type="image/webp" />
                <img src="/Nailshop/Nailshop3.png" alt="Partner Network" width={550} height={224} loading="lazy" decoding="async" />
              </picture>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
