import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getStores } from "./callapi/call_api_user.jsx";
import useNearbyStores from "./hooks/useNearbyStores";
import PageHero from "./components/PageHero";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import AOS from "aos"; // 1. Import AOS
import "aos/dist/aos.css"; // 2. Import CSS
import "./AllStores.css";

const PER_PAGE = 8;
const IMAGE_BASE_URL = "http://localhost:5010/static/images";
const NEARBY_PROVINCES = ["ขอนแก่น", "กรุงเทพมหานคร", "เชียงราย", "ชัยภูมิ", "นครสวรรค์", "กระบี่"];

// คำค้นหาที่ใช้จับคู่ตัวเลือก "บริการ" จากแถบค้นหาหน้าแรก กับชื่อบริการจริงของร้าน
// (ฐานข้อมูลเก็บแค่ชื่อบริการเป็นข้อความอิสระ ไม่มีหมวดหมู่ตรงกับตัวเลือกในแถบค้นหา)
const SERVICE_KEYWORDS = {
  "เจลมือ / เท้า": ["เจล", "gel", "manicure", "pedicure"],
  "เพ้นท์ลาย": ["เพ้นท์", "ลาย", "art", "french"],
  "ต่อเล็บ": ["ต่อเล็บ", "extension", "acrylic"],
  "สปามือ-เท้า": ["สปา", "spa", "massage", "scrub", "paraffin"],
};

export default function AllStores() {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const [q, setQ] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [area, setArea] = useState("");
  const [sort, setSort] = useState("best");
  const [page, setPage] = useState(1);
  const [store, setStore] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    // ดึงข้อมูลจาก localStorage มาตั้งต้น (ถ้ามี)
    const saved = localStorage.getItem("my_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // บันทึกลง localStorage ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem("my_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  // 3. Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  useEffect(() => {
    async function fetchStore() {
      try {
        const res = await getStores();
        setStore(res.data || []);
      } catch (err) { console.error("Error loading data:", err); }
    }
    fetchStore();
  }, []);

  // ร้านใกล้ฉัน -- เปิดใช้เมื่อกดปุ่ม "ร้านใกล้ฉัน"
  const [nearbyMode, setNearbyMode] = useState(false);
  const {
    stores: nearbyStores,
    loading: nearbyLoading,
    permissionDenied: nearbyPermissionDenied,
    searchByProvince,
  } = useNearbyStores();

  useEffect(() => {
    if (nearbyMode) setSort("distance");
    else if (sort === "distance") setSort("best");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearbyMode]);

  useEffect(() => {
    const qParam = params.get("q") || "";
    setQ(qParam);
    setServiceFilter(params.get("service") || "");
    setDateFilter(params.get("date") || "");
  }, [params]);

  const sourceStores = nearbyMode ? nearbyStores : store;

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    const serviceKeywords = SERVICE_KEYWORDS[serviceFilter] || [];

    return sourceStores.filter((s) => {
      if (qLower) {
        // ค้นหาจาก "สถานที่" -- จับคู่ทั้งชื่อร้านและที่อยู่ (ที่อยู่/ตำบล/อำเภอ/จังหวัด)
        const haystack = [s.store_name, s.address, s.street, s.subdistrict, s.district, s.province]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(qLower)) return false;
      }
      if (serviceKeywords.length > 0) {
        const serviceNames = (s.service_names || "").toLowerCase();
        if (!serviceKeywords.some((kw) => serviceNames.includes(kw))) return false;
      }
      if (area && s.area !== area) return false;
      return true;
    });
  }, [sourceStores, q, serviceFilter, area]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === "rating") arr.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
    else if (sort === "price_asc") arr.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") arr.sort((a, b) => b.price - a.price);
    else if (sort === "distance") arr.sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity));
    return arr;
  }, [filtered, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const items = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => setPage(1), [q, serviceFilter, area, sort]);

  return (
    <div className="ag-root">
      <PageHero
        eyebrow="ร้านทำเล็บทั้งหมด"
        title="ร้านทำเล็บคุณภาพ ที่คุณวางใจ"
        description="ค้นหาร้านทำเล็บที่ใช่ พร้อมจองคิวได้ง่ายในไม่กี่คลิก คัดสรรร้านคุณภาพทั่วประเทศ"
        chips={["ร้านคัดสรร", "รีวิวจริง", "จองคิวออนไลน์", "ร้านใกล้ฉัน"]}
      />

      {/* Filter Bar */}
      <div className="ag-filter-bar" data-aos="fade-up">
        <div className="ag-container">
          <div className="ag-filter-group">
            <button className={area === "" ? "active" : ""} onClick={() => setArea("")}>ร้านทั้งหมด</button>
            {["สยาม", "อารีย์", "ขอนแก่น", "ลาดพร้าว"].map(a => (
              <button key={a} className={area === a ? "active" : ""} onClick={() => setArea(a)}>{a}</button>
            ))}
            <button
              className={nearbyMode ? "active" : ""}
              onClick={() => setNearbyMode((v) => !v)}
            >
              <FiMapPin /> ร้านใกล้ฉัน
            </button>
          </div>
          <div className="ag-search-wrapper">
            <input type="text" placeholder="ค้นหาร้าน..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        {nearbyMode && nearbyPermissionDenied && (
          <div className="ag-container nearby-fallback">
            <span>ไม่ได้อนุญาตให้เข้าถึงตำแหน่ง — เลือกจังหวัดเพื่อค้นหาร้านแทน:</span>
            <select
              defaultValue=""
              onChange={(e) => e.target.value && searchByProvince(e.target.value)}
            >
              <option value="" disabled>เลือกจังหวัด</option>
              {NEARBY_PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}
        {nearbyMode && nearbyLoading && (
          <div className="ag-container" style={{ textAlign: "center" }}>กำลังค้นหาร้านใกล้คุณ...</div>
        )}
      </div>

      {/* Main Content */}
      <main className="ag-container">
        {(serviceFilter || dateFilter) && (
          <div className="ag-active-filters" data-aos="fade-up">
            <span>กำลังค้นหา:</span>
            {serviceFilter && <span className="ag-filter-chip">บริการ: {serviceFilter}</span>}
            {dateFilter && <span className="ag-filter-chip">วันที่: {dateFilter}</span>}
            <button
              type="button"
              className="ag-filter-clear"
              onClick={() => { setServiceFilter(""); setDateFilter(""); }}
            >
              ล้างตัวกรอง
            </button>
          </div>
        )}
        <div className="ag-section-title" data-aos="fade-right">
          <h2>ร้านของเรา</h2>
          <div className="ag-sort-group">
            <label htmlFor="ag-sort">เรียงตาม</label>
            <select id="ag-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="best">แนะนำ</option>
              <option value="rating">คะแนนสูงสุด</option>
              <option value="price_asc">ราคาต่ำ-สูง</option>
              <option value="price_desc">ราคาสูง-ต่ำ</option>
              {nearbyMode && <option value="distance">ระยะทางใกล้สุด</option>}
            </select>
          </div>
        </div>

        <div className="ag-grid">
          {items.map((s, index) => (
            <div
              key={s.store_id || index}
              className="ag-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="ag-card-img">
                <img
                  src={s.image ? `${IMAGE_BASE_URL}/${s.image}` : "/Nailshop/placeholder.jpg"}
                  alt={s.store_name}
                  onError={(e) => {
                    e.currentTarget.src = "/Nailshop/placeholder.jpg";
                  }}
                />
                {Number(s.avg_rating) > 0 && (
                  <span className="ag-rating-chip">★ {Number(s.avg_rating).toFixed(1)}</span>
                )}
                {nearbyMode && (
                  <span className={`ag-status-chip ${s.is_open ? "is-open" : "is-closed"}`}>
                    {s.is_open ? "เปิดอยู่" : "ปิดแล้ว"}
                  </span>
                )}
              </div>

              <div className="ag-card-content">
                {/* ส่วนที่แก้ไข: จัดกลุ่มชื่อและปุ่มหัวใจ */}
                <div className="title-row">
                  <h3>{s.store_name}</h3>
                  <button
                    className={`fav-btn ${favorites.includes(s.store_id) ? "active" : ""}`}
                    onClick={() => toggleFavorite(s.store_id)}
                  >
                    {favorites.includes(s.store_id) ? (
                      <FaHeart className="heart-icon" />
                    ) : (
                      <FaRegHeart className="heart-icon" />
                    )}
                  </button>

                </div>

                {s.area && (
                  <div className="ag-area-row">
                    <FiMapPin /> {s.area}
                  </div>
                )}

                {nearbyMode && (
                  <div className="ag-area-row">
                    <FiMapPin />
                    {s.distance_km != null ? `ห่าง ${s.distance_km} กม.` : [s.district, s.province].filter(Boolean).join(" ")}
                    {" · "}คิวว่าง {s.available_slots} คิว
                  </div>
                )}

                <div className="price-row">
                  <span className="price-label">เริ่มต้น</span>
                  <span className="price">฿{Number(s.price || 0).toLocaleString()}</span>
                </div>
                <Link to={`/store2/${s.store_id}`} className="ag-add-btn">
                  จองคิว
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="ag-pagination" data-aos="fade-up">
          {[...Array(pages)].map((_, i) => (
            <button key={i + 1} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>
              {i + 1}
            </button>
          ))}
        </div>
      </main>

      {/* Special Offer Section */}
      <section className="ag-offer-banner" data-aos="fade-in">
        <div className="ag-container offer-flex">
          <div className="offer-image" data-aos="zoom-out-right" data-aos-delay="200">
            <img src="https://i.pinimg.com/736x/4b/c1/5b/4bc15bdb3aabb81077b49fcc066efb41.jpg" alt="special offer" />
            <div className="offer-text-box">
              <h3>ข้อเสนอพิเศษ</h3>
              <p>คอร์สทำลายเล็บ</p>
              <button className="learn-more">ดูรายละเอียด</button>
            </div>
          </div>
          <div className="offer-content" data-aos="fade-left" data-aos-delay="400">
            <h2>รับส่วนลด <strong>25%</strong></h2>
            <p>โปรโมชั่นพิเศษสำหรับการจองผ่านระบบออนไลน์วันนี้ รับส่วนลดทันทีสำหรับทุกบริการ</p>
            <div className="subscribe-box">
              <input type="email" placeholder="อีเมล" />
              <button>ติดตาม</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
