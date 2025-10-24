import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home2() {
  // ----- ค่าฟอร์มค้นหา -----
  const [searchArea, setSearchArea] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchTime, setSearchTime] = useState("14:30");
  const [searchService, setSearchService] = useState("เจลมือ / เท้า");

  const navigate = useNavigate();
  const goSearch = () => {
    const params = new URLSearchParams();
    if (searchArea) params.set("q", searchArea);
    if (searchService) params.set("service", searchService);
    if (searchDate) params.set("date", searchDate);
    if (searchTime) params.set("time", searchTime);
    navigate(`/AllStores?${params.toString()}`);
  };

  // ----- ช่วยจำสถานะ (favorite, chips, sort) -----
  const [favorites, setFavorites] = useState(new Set());
  const toggleFav = (id) =>
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });  

  const [chips, setChips] = useState({
    near: false,
    promo: false,
    gel: false,
    spa: false,
    open: false,
  });
  const toggleChip = (key) => setChips((c) => ({ ...c, [key]: !c[key] }));

  const popular = useMemo(
    () => [
      {
        id: "pop-1",
        title: "Rose Quartz Studio",
        tag: "เพ้นท์มินิมอลชมพู",
        rating: 4.95,
        price: 990,
        img: "/Nailshop/Nailshop1.png",
      },
      {
        id: "pop-2",
        title: "Blossom Pink Lab",
        tag: "เจลชมพูใส",
        rating: 4.88,
        price: 750,
        img: "/Nailshop/Nailshop9.jpg",
      },
      {
        id: "pop-3",
        title: "Milk & Peony",
        tag: "โทนชมพู-ขาว",
        rating: 4.9,
        price: 820,
        img: "/Nailshop/Nailshop7.jpg",
      },
      {
        id: "pop-4",
        title: "Blush Bar",
        tag: "สปามือ-เท้า",
        rating: 4.85,
        price: 680,
        img: "/Nailshop/Nailshop6.jpg",
      },
    ],
    []
  );

  const baseStores = useMemo(
    () => [
      {
        id: "s-1",
        title: "Pink Atelier Siam",
        desc: "BTS สยาม • เจลมือ/เท้า • เพ้นท์ลายมินิมอล",
        tag: "โทนชมพูมินิมอล",
        rating: 4.9,
        price: 890,
        distance: 0.9,
        img: "/Nailshop/Nailshop7.jpg",
        times: ["14:00", "15:30", "17:00"],
        badge: "Top Rated",
      },
      {
        id: "s-2",
        title: "Blush & Buff Ari",
        desc: "BTS อารีย์ • สปา • ต่อเล็บธรรมชาติ",
        tag: "สปามือ-เท้า",
        rating: 4.7,
        price: 690,
        distance: 3.2,
        img: "/Nailshop/Nailshop8.jpg",
        times: ["13:00", "16:00", "18:30"],
        badge: "Promo",
      },
      {
        id: "s-3",
        title: "Milk Pink Studio KK",
        desc: "ขอนแก่น • โทนชมพู-ขาว • เพ้นท์มินิมอล",
        tag: "เจลชมพูใส",
        rating: 4.8,
        price: 790,
        distance: 1.5,
        img: "/Nailshop/Nailshop8.jpg",
        times: ["11:30", "15:00", "19:00"],
        badge: "New",
      },
    ],
    []
  );

  const [sortMode, setSortMode] = useState("best");
  const stores = useMemo(() => {
    const arr = [...baseStores];
    const score = {
      rating: (s) => -s.rating,
      price: (s) => s.price,
      distance: (s) => s.distance,
      best: (s) => -s.rating + s.price / 1000,
    };
    return arr.sort((a, b) => score[sortMode](a) - score[sortMode](b));
  }, [baseStores, sortMode]);

  // ----- JSX -----
  return (
    <main className="home">
      {/* HERO + SEARCH */}
      <section className="hero">
        <div className="container hero-head">
          <div>
            <span className="badge">แพลตฟอร์มรวมร้านทำเล็บ • โทนชมพู-ขาว</span>
            <h1>จองคิวทำเล็บจากหลายร้าน ในที่เดียว ✨</h1>
            <p>
              เปรียบเทียบราคา รีวิว ระยะทาง และคิวว่าง — เลือกเวลาที่ใช่ แล้วกดจองได้ทันที
            </p>
          </div>

          <div className="hero-art">
            <div className="bg">
              <div className="phone">
                <div style={{ padding: 12 }}>
                  <h3 style={{ margin: "0 0 .2rem" }}>ค้นหาร้านใกล้คุณ</h3>
                  <div className="card" style={{ padding: ".6rem", margin: ".5rem 0" }}>
                    <small className="muted">วันที่</small>
                    <div style={{ fontWeight: 600 }}>
                      {searchDate || "—"}
                    </div>
                  </div>
                  <div className="card" style={{ padding: ".6rem", margin: ".5rem 0" }}>
                    <small className="muted">บริการ</small>
                    <div style={{ fontWeight: 600 }}>
                      {searchService}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: ".4rem" }}
                    onClick={goSearch}
                  >
                    ค้นหา
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="container search-wrap">
          <div className="search-card card">
            <div className="field">
              <small>ค้นหาพื้นที่ / สถานที่</small>
              <input
                type="text"
                placeholder="เช่น สยาม, ขอนแก่น, BTS อารีย์"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
              />
            </div>
            <div className="field">
              <small>วันที่</small>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
            <div className="field">
              <small>เวลา</small>
              <input
                type="time"
                value={searchTime}
                onChange={(e) => setSearchTime(e.target.value)}
              />
            </div>
            <div className="field">
              <small>บริการ</small>
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
            {/* ปุ่มนำทางไป AllStores พร้อม query */}
            <button className="btn btn-primary search-btn" onClick={goSearch}>
              ค้นหาคิวว่าง
            </button>
          </div>
        </div>
      </section>

      {/* POPULAR */}
      <section id="popular">
        <div className="container">
          <div className="sec-head">
            <div>
              <h2>ร้านยอดฮิต 🔥</h2>
              <p className="muted">จองบ่อย เรตติ้งสูง โทนชมพู-ขาวสุดละมุน</p>
            </div>
            <a className="seeall" href="#">ดูทั้งหมด →</a>
          </div>

          <div className="grid grid-4" id="popular-grid">
            {popular.map((p) => (
              <article className="store-v card" key={p.id}>
                <button
                  className={`heart ${favorites.has(p.id) ? "active" : ""}`}
                  onClick={() => toggleFav(p.id)}
                  aria-label="favorite"
                >
                  {favorites.has(p.id) ? "❤" : "♡"}
                </button>
                <div className="cover">
                  <img src={p.img} alt={p.title} />
                </div>
                <div className="store-body">
                  <div className="meta">
                    <span className="badge-hot">ยอดฮิต</span>
                    <span className="tag">{p.tag}</span>
                  </div>
                  <h3>{p.title}</h3>
                  <div className="meta">
                    <span className="stars">★★★★★</span>
                    <span className="muted">({p.rating.toFixed(2)})</span>
                    <span className="price">เริ่ม ฿{p.price}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="filterbar">
        <div className="container filter-inner">
          {[
            { key: "near", label: "📍 ใกล้ฉัน" },
            { key: "promo", label: "🎉 โปรใหม่" },
            { key: "gel", label: "💖 เจลชมพู" },
            { key: "spa", label: "🛁 สปา" },
            { key: "open", label: "🟢 ว่างวันนี้" },
          ].map((c) => (
            <button
              key={c.key}
              className="chip"
              onClick={() => toggleChip(c.key)}
              style={{
                background: chips[c.key] ? "#fff0f6" : "#fff",
                borderColor: chips[c.key] ? "#ffb8d2" : "var(--stroke)",
              }}
              aria-pressed={chips[c.key]}
            >
              {c.label}
            </button>
          ))}

          <div className="sort">
            <label className="muted" htmlFor="sortSel">
              เรียงโดย
            </label>{" "}
            <select
              id="sortSel"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
            >
              <option value="best">แนะนำ</option>
              <option value="rating">เรตติ้งสูงสุด</option>
              <option value="price">ราคาต่ำสุด</option>
              <option value="distance">ใกล้ที่สุด</option>
            </select>
          </div>
        </div>
      </div>

      {/* DISCOVER */}
      <section id="discover">
        <div className="container">
          <div className="sec-head">
            <div>
              <h2>ร้านแนะนำในพื้นที่ของคุณ</h2>
              <p className="muted">รวมดีลชมพู-ขาว เรียบหรู ราคาดี</p>
            </div>
            <a className="seeall" href="#">ดูทั้งหมด →</a>
          </div>

          <div className="grid grid-3" id="store-grid">
            {stores.map((s) => (
              <article className="store-v card" key={s.id}>
                <button
                  className={`heart ${favorites.has(s.id) ? "active" : ""}`}
                  onClick={() => toggleFav(s.id)}
                  aria-label="favorite"
                >
                  {favorites.has(s.id) ? "❤" : "♡"}
                </button>

                {/* รูปอยู่ด้านบน */}
                <div className="cover">
                  <img src={s.img} alt={s.title} />
                </div>

                {/* ข้อความอยู่ด้านล่าง */}
                <div className="store-body">
                  <div className="meta">
                    <span className="badge">{s.badge}</span>
                    <span className="tag">{s.tag}</span>
                  </div>

                  <h3 style={{ margin: ".2rem 0 .3rem" }}>{s.title}</h3>

                  <div className="meta">
                    <span className="stars">★★★★★</span>
                    <span className="muted">({s.rating.toFixed(1)})</span>
                    <span className="distance">• {s.distance} กม.</span>
                    <span className="price">เริ่ม ฿{s.price}</span>
                  </div>

                  <p className="muted" style={{ margin: ".4rem 0" }}>{s.desc}</p>

                  <div className="avail">
                    {s.times.map((t) => (
                      <span className="chip" key={t}>{t}</span>
                    ))}
                  </div>

                  <div className="cta-inline">
                    <a className="btn btn-light" href="#">ดูรายละเอียด</a>
                    <a className="btn btn-primary" href="#">จองคิว</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* MAP MOCK */}
      <section id="map">
        <div className="container">
          <div className="sec-head">
            <div>
              <h2>ดูบนแผนที่</h2>
              <p className="muted">เลือกดูคิวว่างตามตำแหน่งร้าน</p>
            </div>
            <button className="seeall btn btn-ghost">เปิดแผนที่แบบเต็ม</button>
          </div>
          <div className="map card">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 42, lineHeight: 1 }}>🗺️</div>
              <p className="muted" style={{ margin: ".3rem 0 0" }}>
                พื้นที่แผนที่จำลอง — ฝัง Google Maps/Leaflet ได้ภายหลัง
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="container">
          <div className="sec-head">
            <div>
              <h2>จองง่ายใน 3 ขั้นตอน</h2>
              <p className="muted">ค้นหา → เลือกเวลา → ยืนยัน</p>
            </div>
          </div>
          <div className="grid grid-3">
            <div className="step">
              <div className="num">1</div>
              <h4>ค้นหาร้าน</h4>
              <p className="muted">กรองตามพื้นที่ ประเภทบริการ งบประมาณ และคิวว่าง</p>
            </div>
            <div className="step">
              <div className="num">2</div>
              <h4>เลือกวัน-เวลา</h4>
              <p className="muted">เห็นคิวว่างแบบเรียลไทม์จากหลายร้าน</p>
            </div>
            <div className="step">
              <div className="num">3</div>
              <h4>กดจองทันที</h4>
              <p className="muted">รับการยืนยันผ่าน SMS/LINE แก้ไข/ยกเลิกได้</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container">
          <div
            className="card"
            style={{
              padding: "1.4rem",
              textAlign: "center",
              borderRadius: 22,
              border: "1px solid var(--brand-2)",
              background: "linear-gradient(180deg,#fff,#fff5f7)",
            }}
          >
            <h3 style={{ margin: ".2rem 0 .4rem" }}>
              มีร้านทำเล็บ? มาเข้าร่วมแพลตฟอร์มกับเรา 💗
            </h3>
            <p className="muted" style={{ margin: "0 0 .8rem" }}>
              รับลูกค้าใหม่ เพิ่มการจองอัตโนมัติ พร้อมระบบจัดการคิว
            </p>
            <a className="btn btn-primary" href="#">สมัครเป็นพาร์ทเนอร์</a>
          </div>
        </div>
      </section>
    </main>
  );
}
