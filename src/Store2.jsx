import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./Store2.css"; // ⬅️ import CSS แยกไฟล์

const initialServices = [
    { id:"s1", name:"ตัดแต่งเล็บ", category:"spa",   price:200,  minutes:20 },
    { id:"s2", name:"ทำเล็บเจลพื้นเรียบ", category:"gel",   price:500,  minutes:60, badge:"ฮิต" },
    { id:"s3", name:"เพ้นท์เล็บมินิมอล", category:"paint", price:780,  minutes:90 },
    { id:"s4", name:"ต่อเล็บเจลธรรมชาติ", category:"gel",   price:1200, minutes:120, badge:"แนะนำ" },
    { id:"s5", name:"สปามือ + ทรีตเมนต์", category:"spa",   price:450,  minutes:40 },
    { id:"s6", name:"เพ้นท์เล็บศิลป์ (Art)", category:"paint", price:950, minutes:120 },
    { id:"s7", name:"ทำเล็บเจลกลิตเตอร์", category:"gel",   price:650,  minutes:75 },
  ];
  
  function labelCat(c){ return c==="gel"?"เจล":c==="paint"?"เพ้นท์":c==="spa"?"สปา":c; }
  const formatTHB = (n) => "฿" + Number(n||0).toLocaleString("th-TH");
  
  export default function StorePage(){
    const navigate = useNavigate();
    const [activeCat, setActiveCat] = useState("all");
    const [q, setQ] = useState("");
    const [selected, setSelected] = useState(new Set());
    const [agree, setAgree] = useState(false);
  
    const shopName = "GlamNail Studio";
    const storeId = "store2";
  
    const carouselRef = useRef(null);
  
    useEffect(()=>{
      if(!carouselRef.current) return;
      const inst = window.bootstrap?.Carousel.getOrCreateInstance(carouselRef.current);
      return () => inst?.dispose?.();
    },[]);
  
    const filtered = useMemo(()=>{
      const kw = q.trim().toLowerCase();
      return initialServices.filter(s=>{
        const passCat = activeCat==="all" || s.category===activeCat;
        const passKw  = !kw || s.name.toLowerCase().includes(kw);
        return passCat && passKw;
      });
    },[activeCat,q]);
  
    const chosenList = useMemo(()=> initialServices.filter(s=>selected.has(s.id)), [selected]);
    const totals = useMemo(()=>{
      return chosenList.reduce(
        (acc,s)=>({ price: acc.price + s.price, mins: acc.mins + s.minutes }),
        { price:0, mins:0 }
      );
    },[chosenList]);
  
    const canProceed = selected.size>=1 && agree;
  
    const toggleSelect = (id)=>{
      setSelected(prev=>{
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    };
  
    const submitBooking = (e)=>{
      e?.preventDefault?.();
      if(!canProceed) return;
      const payload = {
        storeId,
        storeName: shopName,
        services: chosenList,
        allServices: initialServices
      };
      sessionStorage.setItem("bookingPayload", JSON.stringify(payload));
      navigate("/booking");
    };
  
    const gotoSlide = (n)=>{
      const inst = window.bootstrap?.Carousel.getOrCreateInstance(carouselRef.current);
      inst?.to?.(Number(n));
    };
  
    return (
      <>
        {/* CONTENT */}
        <main className="py-4">
          <div className="container">
            {/* HERO */}
            <div className="hero-card p-3">
              <div className="row g-3">
                {/* Gallery */}
                <div className="col-12 col-lg-8 hero-left">
                  <div id="shopCarousel" className="carousel slide" data-bs-ride="true" ref={carouselRef}>
                    <div className="carousel-inner rounded-4">
                      <div className="carousel-item active"><img src="Nailshop/Nailshop1.png" className="d-block w-100" alt="ผลงาน 1" loading="lazy" /></div>
                      <div className="carousel-item"><img src="Nailshop/Nailshop2.png" className="d-block w-100" alt="ผลงาน 2" loading="lazy" /></div>
                      <div className="carousel-item"><img src="Nailshop/Nailshop3.png" className="d-block w-100" alt="ผลงาน 3" loading="lazy" /></div>
                      <div className="carousel-item"><img src="Nailshop/Nailshop4.png" className="d-block w-100" alt="ผลงาน 4" loading="lazy" /></div>
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#shopCarousel" data-bs-slide="prev">
                      <span className="carousel-control-prev-icon" aria-hidden="true"></span><span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#shopCarousel" data-bs-slide="next">
                      <span className="carousel-control-next-icon" aria-hidden="true"></span><span className="visually-hidden">Next</span>
                    </button>
                  </div>
  
                  {/* thumbs */}
                  <div className="thumbs">
                    {["Nailshop/Nailshop1.png","Nailshop/Nailshop2.png","Nailshop/Nailshop3.png","Nailshop/Nailshop4.png"].map((src,i)=>(
                      <div className="thumb" key={i} onClick={()=>gotoSlide(i)}>
                        <img src={src} alt={`thumb-${i}`} loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
  
                {/* Right glass info */}
                <div className="col-12 col-lg-4">
                  <div className="glass h-100 p-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <h3 className="m-0" id="shopName">{shopName}</h3>
                      <span className="pill"><i className="bi bi-shield-check me-1"></i>ยืนยันแล้ว</span>
                    </div>
                    <div className="mt-1"><span className="star"><i className="bi bi-star-fill"></i></span> <strong>4.8</strong> (120 รีวิว) • <span className="meta">งานเจล/เพ้นท์</span></div>
                    <div className="line"></div>
                    <div className="meta"><i className="bi bi-geo-alt"></i> ถนนมิตรภาพ, ขอนแก่น • <span className="text-success">มีที่จอดรถ</span></div>
                    <div className="meta"><i className="bi bi-clock"></i> เปิดวันนี้ 10:00–20:00</div>
                    <div className="d-flex gap-2 flex-wrap mt-2">
                      <span className="chip"><i className="bi bi-brush"></i> เพ้นท์สวยเป๊ะ</span>
                      <span className="chip"><i className="bi bi-gem"></i> วัสดุพรีเมียม</span>
                      <span className="chip"><i className="bi bi-droplet-half"></i> สีเจลแน่น</span>
                    </div>
                    <div className="alert alert-light border mt-3 mb-0">แนะนำ: <strong>เจลพื้นเรียบ + มินิมอล</strong> • ใช้ของแท้ • สีทน</div>
                  </div>
                </div>
              </div>
            </div>
  
            {/* BODY */}
            <div className="row g-4 mt-3">
              {/* LEFT */}
              <div className="col-12 col-lg-8">
                {/* SERVICES */}
                <div className="panel">
                  <div className="panel-head d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div className="fw-semibold"><i className="bi bi-list-check"></i> บริการทั้งหมด</div>
                    <div className="d-flex gap-2">
                      {["all","gel","paint","spa"].map(cat=>(
                        <button
                          key={cat}
                          type="button"
                          className={`filter-chip ${activeCat===cat?"active":""}`}
                          onClick={()=>setActiveCat(cat)}
                        >
                          {cat==="all"?"ทั้งหมด":cat==="gel"?"เจล":cat==="paint"?"เพ้นท์":"สปา"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="panel-body">
                    <div className="input-group mb-3">
                      <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                      <input
                        value={q}
                        onChange={(e)=>setQ(e.target.value)}
                        onKeyDown={(e)=>{ if(e.key==="Enter") e.preventDefault(); }}
                        type="search"
                        className="form-control"
                        placeholder="ค้นหาบริการ เช่น ต่อเล็บ, มินิมอล"
                        autoComplete="off"
                      />
                    </div>
  
                    <div id="serviceList" className="row g-3">
                      {filtered.length===0 && (
                        <div className="col-12"><div className="meta">ไม่พบบริการที่ตรงเงื่อนไข</div></div>
                      )}
                      {filtered.map(s=>(
                        <div className="col-12 col-md-6" key={s.id}>
                          <label className="svc-card d-flex align-items-start gap-2">
                            <input
                              type="checkbox"
                              name="serviceId"
                              value={s.id}
                              checked={selected.has(s.id)}
                              onChange={()=>toggleSelect(s.id)}
                            />
                            <div className="w-100">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="fw-semibold">{s.name}</div>
                                <div className="text-end">
                                  {s.badge && <span className="pill">{s.badge}</span>}
                                  <div className="price">{formatTHB(s.price)}</div>
                                </div>
                              </div>
                              <div className="meta mt-1"><i className="bi bi-clock"></i> {s.minutes} นาที • {labelCat(s.category)}</div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
  
                {/* ABOUT */}
                <div className="panel mt-3">
                  <div className="panel-head fw-semibold"><i className="bi bi-info-circle"></i> เกี่ยวกับร้าน</div>
                  <div className="panel-body">
                    <p className="mb-1"><strong>ที่อยู่:</strong> 123 ถนนมิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000</p>
                    <p className="mb-1"><strong>เวลาทำการ:</strong> ทุกวัน 10:00–20:00</p>
                    <p className="meta mb-0">รับเงินสด/โอน/บัตร • นัดหมายล่วงหน้าแนะนำ</p>
                  </div>
                </div>
  
                {/* MAP */}
                <div className="panel mt-3">
                  <div className="panel-head fw-semibold"><i className="bi bi-map"></i> แผนที่ & การเดินทาง</div>
                  <div className="panel-body">
                    <div className="map-wrap">
                      <iframe
                        title="map"
                        src="https://maps.google.com/maps?q=Khon%20Kaen&t=&z=14&ie=UTF8&iwloc=&output=embed"
                        width="100%" height="300" style={{border:0}} loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  </div>
                </div>
  
                {/* REVIEWS */}
                <div className="panel mt-3">
                  <div className="panel-head fw-semibold"><i className="bi bi-chat-heart"></i> รีวิวลูกค้า</div>
                  <div className="panel-body">
                    <div className="d-flex gap-3 align-items-start">
                      <img src="images/u1.jpg" className="rounded-circle" width="40" height="40" alt="Bow" loading="lazy" />
                      <div>
                        <div className="fw-semibold">Bow <span className="star"><i className="bi bi-star-fill"></i></span> 5.0</div>
                        <div className="meta">“งานเนี้ยบ ลายเป๊ะ สีทนมากค่ะ”</div>
                      </div>
                    </div>
                    <div className="d-flex gap-3 align-items-start mt-3">
                      <img src="images/u2.jpg" className="rounded-circle" width="40" height="40" alt="May" loading="lazy" />
                      <div>
                        <div className="fw-semibold">May <span className="star"><i className="bi bi-star-fill"></i></span> 4.8</div>
                        <div className="meta">“จองง่าย ราคาโอเค ช่างมือเบา”</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* RIGHT: booking summary */}
              <div className="col-12 col-lg-4">
                <form className="panel booking-card p-3" onSubmit={submitBooking}>
                  <div className="d-flex align-items-center justify-content-between">
                    <h5 className="m-0">เลือกบริการเพื่อจอง</h5>
                    <span className="pill"><i className="bi bi-bag-check me-1"></i><span id="selCount">{selected.size}</span> รายการ</span>
                  </div>
                  <div className="line"></div>
                  <div className="d-flex justify-content-between"><span className="meta">เวลารวมโดยประมาณ</span><span><strong id="totalMins">{totals.mins}</strong> นาที</span></div>
                  <div className="d-flex justify-content-between"><span className="meta">ยอดรวม</span><span className="fs-5"><strong id="totalPrice">{formatTHB(totals.price)}</strong></span></div>
  
                  <div className="form-check mt-3">
                    <input className="form-check-input" type="checkbox" id="agree" checked={agree} onChange={e=>setAgree(e.target.checked)} />
                    <label className="form-check-label" htmlFor="agree"><small>ฉันยอมรับ <a href="#" onClick={(e)=>e.preventDefault()}>ข้อกำหนดและเงื่อนไข</a></small></label>
                  </div>
  
                  <button id="goNext" type="submit" className="btn btn-brand w-100 mt-3" disabled={!canProceed}>ไปต่อ: เลือกช่าง & วันที่</button>
                  <div className="form-text mt-2">* หน้าถัดไปไม่มีให้เลือกร้านอีก ดึงบริการจากหน้านี้โดยตรง</div>
                </form>
  
                {/* Mobile bar */}
                <div className="mobile-bar">
                  <div>
                    <div className="meta">รวม</div>
                    <div className="fw-semibold" id="mTotalPrice">{formatTHB(totals.price)}</div>
                  </div>
                  <button
                    id="mGoNext"
                    className="btn btn-brand"
                    type="button"
                    onClick={()=>{ if(!canProceed){ document.querySelector(".form-check")?.scrollIntoView({behavior:"smooth",block:"center"}); return; } submitBooking(); }}
                  >
                    ไปต่อ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }