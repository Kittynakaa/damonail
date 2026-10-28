import React, { useEffect, useMemo, useRef, useState } from "react";
import { registerStore } from "./callapi/call_api_addstore.jsx";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AOS from "aos";
import "aos/dist/aos.css";
import "./AddStore.css";
import { getTypeServices } from "./callapi/call_api_typeservice.jsx";
import PageHero from "./components/PageHero";
import { getStoredUser } from "./callapi/auth";
import StoreLocationMap from "./components/StoreLocationMap";

export default function AddStore() {
  const navigate = useNavigate();
  const [typeServices, setTypeServices] = useState([]);

  useEffect(() => {
    const user = getStoredUser();
    if (user?.role_id === 3 && user?.employee_id) {
      Swal.fire({
        icon: "info",
        title: "ไม่สามารถเปิดร้านได้",
        text: "คุณเป็นพนักงานของร้านอยู่ กรุณาให้เจ้าของร้านลบบัญชีพนักงานของคุณออกก่อน จึงจะเปิดร้านเองได้",
        confirmButtonColor: "#d9789c",
      }).then(() => navigate("/UserProfile"));
    }
  }, [navigate]);

  useEffect(() => {
    async function loadTypes() {
      try {
        const data = await getTypeServices();
        setTypeServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Load type services error:", err);
        setTypeServices([]);
      }
    }
    loadTypes();
  }, []);



  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // ===== State ทั้งหมด (Checklist: ข้อมูลร้าน, ที่อยู่, รูปภาพ, บริการ) =====
  const [thaiData, setThaiData] = useState([]);
  const [store, setStore] = useState({
    name: "",
    phone: "",
    email: "",
    priceFrom: "",
    recommendText: "",
    openTime: "10:00",
    closeTime: "20:00",
    images: [],
    services: [], // เก็บรายการบริการ [{id, name, price, minutes, category}]
    address: {
      street: "",
      province: "",
      district: "",
      subdistrict: "",
      postal_code: "",
      latitude: "",
      longitude: "",
    },
  });

  // โหลดข้อมูลจังหวัด
  useEffect(() => {
    fetch("/thailand.json")
      .then((res) => res.json())
      .then((data) => {
        const actualData = Array.isArray(data) ? data : data.provinces;
        setThaiData(actualData || []);
      })
      .catch((err) => console.error("Load failed:", err));
  }, []);

  // ===== Logic ที่อยู่ =====
  const provinces = useMemo(() => {
    const unique = [...new Set(thaiData.map(item => item.provinceNameTh))];
    return unique.sort((a, b) => a.localeCompare(b, 'th'));
  }, [thaiData]);

  const districts = useMemo(() => {
    if (!store.address.province) return [];
    return [...new Set(thaiData.filter(i => i.provinceNameTh === store.address.province).map(i => i.districtNameTh))].sort();
  }, [thaiData, store.address.province]);

  const subdistricts = useMemo(() => {
    if (!store.address.district) return [];
    return thaiData.filter(i => i.provinceNameTh === store.address.province && i.districtNameTh === store.address.district);
  }, [thaiData, store.address.province, store.address.district]);

  // ===== Handlers =====
  const update = (patch) => setStore(s => ({ ...s, ...patch }));
  const updateAddr = (patch) => setStore(s => ({ ...s, address: { ...s.address, ...patch } }));

  const handleProvinceChange = (val) => updateAddr({ province: val, district: "", subdistrict: "", postal_code: "" });
  const handleDistrictChange = (val) => updateAddr({ district: val, subdistrict: "", postal_code: "" });
  const handleSubdistrictChange = (val) => {
    const found = subdistricts.find(t => t.subdistrictNameTh === val);
    updateAddr({ subdistrict: val, postal_code: found ? found.postalCode : "" });
  };

  // ===== ปักหมุดตำแหน่งร้านบนแผนที่ =====
  const DEFAULT_MAP_CENTER = { lat: 13.7563, lng: 100.5018 }; // กรุงเทพฯ
  const mapLat = store.address.latitude !== "" ? Number(store.address.latitude) : DEFAULT_MAP_CENTER.lat;
  const mapLng = store.address.longitude !== "" ? Number(store.address.longitude) : DEFAULT_MAP_CENTER.lng;
  const handlePinChange = ({ lat, lng }) => updateAddr({ latitude: lat.toFixed(6), longitude: lng.toFixed(6) });

  // Image Logic
  const imgFileRef = useRef(null);
  const handleFiles = (fileList) => {
    Array.from(fileList).forEach(f => {
      const reader = new FileReader();
      reader.onload = (e) => setStore(s => ({ ...s, images: [...s.images, e.target.result] }));
      reader.readAsDataURL(f);
    });
  };
  const removeImg = (i) => setStore(s => ({ ...s, images: s.images.filter((_, idx) => idx !== i) }));

  // Service Logic
  const addSvc = () => setStore(s => ({ ...s, services: [...s.services, { id: Date.now(), name: "", price: "", minutes: "", category: "gel" }] }));
  const delSvc = (id) => setStore(s => ({ ...s, services: s.services.filter(svc => svc.id !== id) }));
  const setSvc = (i, key, val) => {
    const newSvcs = [...store.services];
    newSvcs[i][key] = val;
    setStore(s => ({ ...s, services: newSvcs }));
  };

  const saveStore = async () => {
    const storeName = String(store.name ?? "").trim();
    if (!storeName) {
      alert("กรุณากรอกชื่อร้าน");
      return;
    }
    // ✅ 1) ดึง user จาก localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const user_id = storedUser?.user_id || storedUser?.id;

    const payload = {
      user_id,
      store: {
        name: String(store.name ?? "").trim(),
        price: Number(store.priceFrom) || 0,
        phone: store.phone || "",
        email: store.email || "",
        desc: store.recommendText || "",
        open_time: store.openTime || "10:00",
        close_time: store.closeTime || "20:00",
      },
      address: {
        street: store.address.street || "",
        province: store.address.province || "",
        district: store.address.district || "",
        subdistrict: store.address.subdistrict || "",
        zip: store.address.postal_code || "", // ✅ ใช้ postal_code
        recommend_text: store.recommendText || "",
        open_time: store.openTime || "10:00",          // ✅ backend ต้องการ open_time
        close_time: store.closeTime || "20:00",         // ✅ backend ต้องการ close_time
        latitude: store.address.latitude || "",
        longitude: store.address.longitude || "",
      },
      tags: [],
      services: store.services.map(s => ({
        service_name: s.name || "บริการทั่วไป",
        price: Number(s.price) || 0,
        duration_minutes: Number(s.minutes) || 0,
        description: "",
        type_service_id: s.category === "gel" ? 1 : (s.category === "spa" ? 2 : 3),
      }))
    };


    try {
      console.log("Payload being sent:", payload);
      const result = await registerStore(payload);

      // แก้ไขตรงนี้: ตรวจสอบว่ามีข้อมูลกลับมา (แสดงว่าบันทึกสำเร็จ) 
      // หรือตรวจสอบตามที่ API ของคุณส่งมาจริงๆ เช่น result.data หรือ result.id
      if (result) {
        alert("บันทึกร้านสำเร็จ!");
        navigate("/StoreDashboard");
      }
    } catch (err) {
      console.error("Save Error:", err);
      // เช็คว่ามีข้อความ Error จาก Backend ไหม ถ้าไม่มีให้ใช้ข้อความกลาง
      const errorMsg = err.response?.data?.message || "บันทึกสำเร็จ (แต่ระบบตรวจรับผลลัพธ์ขัดข้อง)";
      alert("แจ้งเตือน: " + errorMsg);

      // ถ้าข้อมูลลง DB แล้วจริงๆ แต่ยังเข้า Error ให้ลอง navigate ไปเลยเพื่อทดสอบ
      // navigate("/StoreDashboard"); 
    }



  };
  return (
    <div className="ag-root nf-add-page">
      <PageHero
        eyebrow="พาร์ตเนอร์ธุรกิจ"
        title="ลงทะเบียนร้านของคุณ"
        description="เข้าร่วมเครือข่ายร้านทำเล็บของ Crystal Shine เปิดร้านให้ลูกค้าค้นพบและจองคิวได้ในไม่กี่ขั้นตอน"
      />
      <main className="container-1450">

        <div className="ag-main-layout">

          {/* Sidebar: Preview ร้าน (Sticky) */}
          <aside className="ag-sidebar-preview">
            <div className="preview-sticky-wrapper" data-aos="fade-right">
              <div className="search-card-editorial">
                <div className="st-img-wrapper">
                  <img src={store.images[0] || "https://i.pinimg.com/736x/8a/8d/89/8a8d8916bd3a8a2723390d870269d7fc.jpg"} alt="ตัวอย่างร้าน" />
                  <span className="badge-luxury">ตัวอย่างร้าน</span>
                </div>
                <div className="st-content">
                  <h3 className="playfair-name">{store.name || "ชื่อร้านของคุณ"}</h3>
                  <p className="luxury-desc"> {store.address.province || "จังหวัด"} {store.address.district}</p>
                  <div className="luxury-meta">
                    <span className="st-price-tag">เริ่ม ฿{store.priceFrom || "0"}</span>
                    <span> {store.openTime} - {store.closeTime}</span>
                  </div>
                </div>
              </div>
              <div className="helper-note">
                <p>* ข้อมูลที่กรอกจะถูกแสดงผลบนหน้าเว็บไซต์จริงในรูปแบบนี้</p>
              </div>
            </div>
          </aside>

          {/* Main Form: ช่องกรอกข้อมูลทั้งหมด */}
          <section className="ag-form-container" data-aos="fade-left">
            <div className="search-card-editorial form-wrapper">

              {/* ส่วนที่ 1: ข้อมูลทั่วไป */}
              <div className="form-section">
                <h2 className="section-form-title">ข้อมูลทั่วไป</h2>
                <div className="editorial-form-grid">
                  <div className="input-group full-width">
                    <label>ชื่อร้าน</label>
                    <input type="text" placeholder="ระบุชื่อร้านของคุณ" value={store.name} onChange={(e) => update({ name: e.target.value })} />
                  </div>
                  <div className="input-group full-width">
                    <label>คำแนะนำ/รายละเอียดร้าน</label>
                    <textarea
                      className="editorial-underline textarea-editorial"
                      placeholder="เขียนจุดเด่นร้าน บรรยากาศ  หรือคำแนะนำ"
                      value={store.recommendText}
                      onChange={(e) => update({ recommendText: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="input-group">
                    <label>เบอร์โทรศัพท์</label>
                    <input type="text" placeholder="08x-xxx-xxxx" value={store.phone} onChange={(e) => update({ phone: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>อีเมล</label>
                    <input type="email" placeholder="example@mail.com" value={store.email} onChange={(e) => update({ email: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>ราคาเริ่มต้น (฿)</label>
                    <input type="number" placeholder="890" value={store.priceFrom} onChange={(e) => update({ priceFrom: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 2: ที่ตั้งและเวลา */}
              <div className="form-section">
                <h2 className="section-form-title">ที่ตั้งและเวลาเปิด-ปิด</h2>
                <div className="editorial-form-grid">
                  <div className="input-group full-width">
                    <label>ที่อยู่/ถนน/เลขที่บ้าน</label>
                    <input type="text" placeholder="ระบุที่ตั้งโดยละเอียด" value={store.address.street} onChange={(e) => updateAddr({ street: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>จังหวัด</label>
                    <select value={store.address.province} onChange={(e) => handleProvinceChange(e.target.value)}>
                      <option value="">เลือกจังหวัด</option>
                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>อำเภอ/เขต</label>
                    <select value={store.address.district} onChange={(e) => handleDistrictChange(e.target.value)} disabled={!store.address.province}>
                      <option value="">เลือกอำเภอ</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>ตำบล/แขวง</label>
                    <select value={store.address.subdistrict} onChange={(e) => handleSubdistrictChange(e.target.value)} disabled={!store.address.district}>
                      <option value="">เลือกตำบล</option>
                      {subdistricts.map(t => <option key={t.id} value={t.subdistrictNameTh}>{t.subdistrictNameTh}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>เวลาเปิด</label>
                    <input type="time" value={store.openTime} onChange={(e) => update({ openTime: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>เวลาปิด</label>
                    <input type="time" value={store.closeTime} onChange={(e) => update({ closeTime: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>ละติจูด (Latitude)</label>
                    <input type="number" step="any" placeholder="เช่น 16.48408" value={store.address.latitude} onChange={(e) => updateAddr({ latitude: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>ลองจิจูด (Longitude)</label>
                    <input type="number" step="any" placeholder="เช่น 102.82000" value={store.address.longitude} onChange={(e) => updateAddr({ longitude: e.target.value })} />
                  </div>
                  <div className="input-group full-width">
                    <label>ปักหมุดตำแหน่งร้าน (ลากหมุดหรือคลิกบนแผนที่เพื่อปรับตำแหน่ง)</label>
                    <StoreLocationMap lat={mapLat} lng={mapLng} draggable onChange={handlePinChange} height="280px" />
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 3: จัดการบริการ (Services) */}
              <div className="form-section">
                <div className="section-flex-header">
                  <h2 className="section-form-title">เมนูบริการ</h2>
                  <button className="editorial-link-btn" onClick={addSvc}>+ เพิ่มบริการใหม่</button>
                </div>
                <div className="services-manager">
                  {store.services.length === 0 && <p className="empty-note">ยังไม่มีรายการบริการ กรุณาเพิ่มอย่างน้อย 1 รายการ</p>}
                  {store.services.map((svc, i) => (
                    <div className="svc-entry-row" key={svc.id}>
                      <div className="input-group" style={{ flex: 3 }}>
                        <input type="text" placeholder="ชื่อบริการ (เช่น ทาสีเจลมือ)" value={svc.name} onChange={(e) => setSvc(i, "name", e.target.value)} />
                      </div>
                      <div className="input-group" style={{ flex: 1 }}>
                        <input type="number" placeholder="ราคา ฿" value={svc.price} onChange={(e) => setSvc(i, "price", e.target.value)} />
                      </div>
                      <div className="input-group" style={{ flex: 1 }}>
                        <input type="number" placeholder="นาที" value={svc.minutes} onChange={(e) => setSvc(i, "minutes", e.target.value)} />
                      </div>
                      <select
                        value={svc.type_id ?? (typeServices[0]?.type_id ?? "")}
                        onChange={(e) => setSvc(i, "type_id", Number(e.target.value))}
                        disabled={typeServices.length === 0}
                      >
                        {typeServices.length === 0 ? (
                          <option value="">กำลังโหลด...</option>
                        ) : (
                          typeServices.map((t) => (
                            <option key={t.type_id} value={t.type_id}>
                              {t.name}
                            </option>
                          ))
                        )}
                      </select>
                      <button className="del-svc-btn" onClick={() => delSvc(svc.id)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ส่วนที่ 4: รูปภาพสตูดิโอ */}
              <div className="form-section">
                <h2 className="section-form-title">รูปภาพร้าน</h2>
                <div className="ag-upload-area" onClick={() => imgFileRef.current.click()}>
                  <div className="upload-content">
                    <p>คลิกเพื่ออัปโหลดรูปบรรยากาศร้าน</p>
                    <span>รองรับไฟล์ .jpg, .png (สูงสุด 5 รูป)</span>
                  </div>
                  <input ref={imgFileRef} type="file" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
                </div>
                <div className="ag-thumbs-grid">
                  {store.images.map((img, i) => (
                    <div key={i} className="thumb-item">
                      <img src={img} alt="รูปร้าน" />
                      <button className="remove-thumb" onClick={() => removeImg(i)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ปุ่มบันทึก */}
              <div className="form-footer">
                <button className="btn-black-thin full-btn" onClick={saveStore}>
                  เผยแพร่ร้านลงแพลตฟอร์ม
                </button>
              </div>

            </div>
          </section>

        </div>
      </main>
    </div>
  );
}