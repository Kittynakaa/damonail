import React, { useState, useMemo, useEffect } from "react";
// ด้านบนสุดของไฟล์ AllStores.jsx
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
 // ✅ เพิ่ม Link
import "./AllStores.css";

// ===== ย้าย SHOPS + PER_PAGE ของคุณมาไว้ตรงนี้ =====
const SHOPS = [
    { id: 1, name: "Pink Atelier Siam", area: "สยาม", services: ["เจลมือ", "เพ้นท์"], price: 890, rating: 4.9, distance: 0.9, hot: true, img: "/Nailshop/Nailshop6.jpg" },
    { id: 2, name: "Blush & Buff Ari", area: "อารีย์", services: ["สปา", "ต่อเล็บ"], price: 690, rating: 4.7, distance: 3.2, img: "/Nailshop/Nailshop10.jpg" },
    { id: 3, name: "Milk Pink Studio KK", area: "ขอนแก่น", services: ["เจลมือ", "เพ้นท์"], price: 790, rating: 4.8, distance: 1.5, img: "/Nailshop/Nailshop4.png" },
    { id: 4, name: "Rose Quartz Studio", area: "สยาม", services: ["เพ้นท์", "ต่อเล็บ"], price: 990, rating: 4.95, distance: 1.1, hot: true, img: "/Nailshop/Nailshop3.png" },
    { id: 5, name: "Blossom Pink Lab", area: "อารีย์", services: ["เจลมือ", "สปา"], price: 750, rating: 4.88, distance: 2.4, hot: true, img: "/Nailshop/Nailshop11.jpg" },
    { id: 6, name: "Milk & Peony", area: "ขอนแก่น", services: ["เจลมือ", "ต่อเล็บ"], price: 820, rating: 4.9, distance: 0.7, hot: true, img: "/Nailshop/Nailshop8.jpg" },
    { id: 7, name: "Blush Bar", area: "ลาดพร้าว", services: ["สปา", "เจลมือ"], price: 680, rating: 4.85, distance: 4.0, hot: true, img: "/Nailshop/Nailshop1.png" },
    { id: 8, name: "Peachy Tips", area: "สยาม", services: ["เจลมือ"], price: 620, rating: 4.6, distance: 1.8, img: "/Nailshop/Nailshop12.jpg" },
    { id: 9, name: "Cotton Candy Nail", area: "อารีย์", services: ["เพ้นท์"], price: 720, rating: 4.55, distance: 2.9, img: "/Nailshop/Nailshop13.jpg" },
    { id: 10, name: "Bare Pink Studio", area: "ขอนแก่น", services: ["เจลมือ", "สปา"], price: 570, rating: 4.3, distance: 3.5, img: "/Nailshop/Nailshop9.jpg" },
];
const PER_PAGE = 6;

export default function AllStores() {
    const { search } = useLocation();
    const params = useMemo(() => new URLSearchParams(search), [search]);

    // state filter
    const [q, setQ] = useState("");
    const [area, setArea] = useState("");
    const [services, setServices] = useState([]);
    const [minp, setMinp] = useState("");
    const [maxp, setMaxp] = useState("");
    const [minr, setMinr] = useState("");

    // รับค่าเริ่มต้นจาก query ครั้งแรก
    useEffect(() => {
        const qParam = params.get("q") || "";
        const serviceParam = params.get("service") || "";
        const mappedService =
            serviceParam.includes("เจล") ? "เจลมือ" :
                serviceParam.includes("เพ้นท์") ? "เพ้นท์" :
                    serviceParam.includes("ต่อเล็บ") ? "ต่อเล็บ" :
                        serviceParam.includes("สปา") ? "สปา" : "";

        setQ(qParam);
        if (mappedService) setServices([mappedService]);
    }, [params]);

    // view/sort/page
    const [sort, setSort] = useState("best");
    const [view, setView] = useState("grid");
    const [page, setPage] = useState(1);

    const toggleService = (svc) => {
        setServices((prev) =>
            prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
        );
    };

    // filter
    const filtered = useMemo(() => {
        return SHOPS.filter((s) => {
            if (q && !s.name.toLowerCase().includes(q.toLowerCase())) return false;
            if (area && s.area !== area) return false;
            if (services.length && !services.every((x) => s.services.includes(x))) return false;
            if (minp && s.price < +minp) return false;
            if (maxp && s.price > +maxp) return false;
            if (minr && s.rating < +minr) return false;
            return true;
        });
    }, [q, area, services, minp, maxp, minr]);

    // sort
    const sorted = useMemo(() => {
        const arr = [...filtered];
        if (sort === "rating") arr.sort((a, b) => b.rating - a.rating);
        else if (sort === "price_asc") arr.sort((a, b) => a.price - b.price);
        else if (sort === "price_desc") arr.sort((a, b) => b.price - a.price);
        else if (sort === "distance") arr.sort((a, b) => a.distance - b.distance);
        else arr.sort((a, b) => b.rating - a.rating || a.price - b.price);
        return arr;
    }, [filtered, sort]);

    // pagination
    const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
    const current = Math.min(page, pages);
    const items = sorted.slice((current - 1) * PER_PAGE, current * PER_PAGE);

    // reset page เมื่อ filter/sort เปลี่ยน
    useEffect(() => setPage(1), [q, area, services, minp, maxp, minr, sort]);

    return (
        <div className="allstores">
            {/* HERO */}
            <section className="hero-lite container">
                <div className="crumb">
                    <a href="/">หน้าแรก</a> › <span className="muted">ร้านทั้งหมด</span>
                </div>
                <h1>ร้านทำเล็บทั้งหมด</h1>
                <p className="muted">
                    พบ {filtered.length} ร้าน • หน้า {current}/{pages}
                </p>
            </section>

            <section className="container grid-page">
                {/* SIDEBAR */}
                <aside className="sidebar">
                    <div className="card side-sec">
                        <h4>ค้นหาอย่างละเอียด</h4>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="ค้นหาชื่อร้าน/คีย์เวิร์ด"
                        />
                    </div>

                    <div className="card side-sec">
                        <h4>พื้นที่</h4>
                        <select value={area} onChange={(e) => setArea(e.target.value)}>
                            <option value="">ทุกพื้นที่</option>
                            <option value="สยาม">สยาม</option>
                            <option value="อารีย์">อารีย์</option>
                            <option value="ขอนแก่น">ขอนแก่น</option>
                            <option value="ลาดพร้าว">ลาดพร้าว</option>
                        </select>
                    </div>

                    <div className="card side-sec">
                        <h4>บริการ</h4>
                        {["เจลมือ", "เพ้นท์", "ต่อเล็บ", "สปา"].map((svc) => (
                            <label key={svc} className="side-row">
                                <input
                                    type="checkbox"
                                    checked={services.includes(svc)}
                                    onChange={() => toggleService(svc)}
                                />{" "}
                                {svc}
                            </label>
                        ))}
                    </div>

                    <div className="card side-sec">
                        <h4>งบประมาณ</h4>
                        <div className="side-row">
                            <input
                                type="number"
                                value={minp}
                                onChange={(e) => setMinp(e.target.value)}
                                placeholder="ต่ำสุด"
                            />
                            <input
                                type="number"
                                value={maxp}
                                onChange={(e) => setMaxp(e.target.value)}
                                placeholder="สูงสุด"
                            />
                        </div>
                    </div>

                    <div className="card side-sec">
                        <h4>เรตติ้งขั้นต่ำ</h4>
                        <select value={minr} onChange={(e) => setMinr(e.target.value)}>
                            <option value="">ไม่กำหนด</option>
                            <option value="4.5">4.5+</option>
                            <option value="4.0">4.0+</option>
                            <option value="3.5">3.5+</option>
                        </select>
                    </div>

                    <button className="btn" onClick={() => {
                        setQ(""); setArea(""); setServices([]); setMinp(""); setMaxp(""); setMinr("");
                    }}>
                        ล้างตัวกรอง
                    </button>
                </aside>

                {/* MAIN */}
                <main>
                    <div className="toolbar card">
                        <div className="toolbar-right">
                            <label>เรียงโดย</label>
                            <select value={sort} onChange={(e) => setSort(e.target.value)}>
                                <option value="best">แนะนำ</option>
                                <option value="rating">เรตติ้งสูงสุด</option>
                                <option value="price_asc">ราคาต่ำสุด</option>
                                <option value="price_desc">ราคาสูงสุด</option>
                                <option value="distance">ใกล้ที่สุด</option>
                            </select>
                            <div className="view-toggle">
                                <button className={`btn ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}>Grid</button>
                                <button className={`btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>List</button>
                            </div>
                        </div>
                    </div>

                    {/* Store list */}
                    <div className={view === "grid" ? "grid grid-3" : "list"}>
                        {items.map((s) => (
                            <StoreCard key={s.id} store={s} view={view} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="pager">
                        <button className="btn" disabled={current === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
                        {Array.from({ length: pages }).map((_, i) => (
                            <button key={i + 1}
                                className={`btn ${current === i + 1 ? "active" : ""}`}
                                onClick={() => setPage(i + 1)}
                            >{i + 1}</button>
                        ))}
                        <button className="btn" disabled={current === pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>›</button>
                    </div>
                </main>
            </section>
        </div>
    );
}

/* ===== การ์ดร้าน: ทำทั้งการ์ดให้คลิกไปหน้า /store2 ได้เลย ===== */
function StoreCard({ store, view }) {
    const to = "/store2";           // หรือ `/store/${store.id}` ถ้าอยากทำ dynamic
    const state = { storeId: store.id };
  
    if (view === "list") {
      return (
        <Link to={to} state={state} className="card store-h store-link">
          <div className="cover"><img src={store.img} alt={store.name} /></div>
          <div>
            <h3>{store.name}</h3>
            <div className="meta">
              <span>★ {store.rating.toFixed(2)}</span>
              <span>• {store.distance} กม.</span>
              <span className="price">฿{store.price}</span>
            </div>
            <p className="muted">{store.services.join(" • ")}</p>
          </div>
        </Link>
      );
    }
  
    return (
      <Link to={to} state={state} className="card store-v store-link">
        <div className="cover"><img src={store.img} alt={store.name} /></div>
        <div className="store-body">
          <h3>{store.name}</h3>
          <div className="meta">
            <span>★ {store.rating.toFixed(2)}</span>
            <span>• {store.distance} กม.</span>
            <span className="price">฿{store.price}</span>
          </div>
          <p className="muted">{store.services.join(" • ")}</p>
        </div>
      </Link>
    );
  }