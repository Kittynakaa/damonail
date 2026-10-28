import React, { useState } from "react";
import "./StoreSettings.css";

import axios from "axios";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import Swal from "sweetalert2";
import StoreLocationMap from "./components/StoreLocationMap";

export default function StoreSettings() {
  const [activeTab, setActiveTab] = useState("info");
  const { storeId } = useParams();

  const [storeData, setStoreData] = useState({
    store_name: "",
    phone: "",
    email: "",
    image: "",
    price: "",
    status_store_id: "",
    province: "",
    district: "",
    subdistrict: "",
    postal_code: "",
    street: "",
    open_time: "",
    close_time: "",
    recommend_text: "",
    latitude: "",
    longitude: ""
  });
  const [savingLocation, setSavingLocation] = useState(false);
  useEffect(() => {
    if (!storeId) return;
  
    const fetchStore = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5010/store/${storeId}`
        );
  
        console.log("API:", res.data);
  
        // ⭐ ดึงตัวแรกของ array
        const data = Array.isArray(res.data)
          ? res.data[0]
          : res.data;
  
        setStoreData({
          store_name: data.store_name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          recommend_text: data.recommend_text || "",
          image: data.image || "",
          price: data.price || "",
          status_store_id: data.status_store_id || "",
          open_time: data.open_time ? data.open_time.slice(0,5) : "",
          close_time: data.close_time ? data.close_time.slice(0,5) : "",
          latitude: data.latitude != null ? String(data.latitude) : "",
          longitude: data.longitude != null ? String(data.longitude) : "",
        });
  
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchStore();
  }, [storeId]);

  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:5010/store/${storeId}`,
        storeData
      );
      alert("บันทึกสำเร็จ");
    } catch (err) {
      console.error(err);
    }
  };

  const DEFAULT_MAP_CENTER = { lat: 13.7563, lng: 100.5018 }; // กรุงเทพฯ
  const mapLat = storeData.latitude !== "" ? Number(storeData.latitude) : DEFAULT_MAP_CENTER.lat;
  const mapLng = storeData.longitude !== "" ? Number(storeData.longitude) : DEFAULT_MAP_CENTER.lng;
  const handlePinChange = ({ lat, lng }) =>
    setStoreData((s) => ({ ...s, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));

  const handleSaveLocation = async () => {
    const latitude = Number(storeData.latitude);
    const longitude = Number(storeData.longitude);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      Swal.fire("ข้อมูลไม่ถูกต้อง", "กรุณาระบุละติจูดและลองจิจูดเป็นตัวเลข", "warning");
      return;
    }
    setSavingLocation(true);
    try {
      await axios.put(`http://localhost:5010/store/${storeId}/location`, { latitude, longitude });
      Swal.fire({ icon: "success", title: "บันทึกตำแหน่งร้านสำเร็จ", toast: true, position: "top-end", timer: 1800, showConfirmButton: false });
    } catch (err) {
      console.error(err);
      Swal.fire("บันทึกไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด กรุณาลองใหม่", "warning");
    } finally {
      setSavingLocation(false);
    }
  };

  return (
    <main className="settings-page">
      <h1 className="title">การตั้งค่าร้าน</h1>
      <p className="subtitle">จัดการการตั้งค่าต่างๆ ของร้านของคุณ</p>

      {/* แถบเมนู */}
      <div className="tabs">
        <button
          className={activeTab === "info" ? "active" : ""}
          onClick={() => setActiveTab("info")}
        >
          ข้อมูลร้าน
        </button>
        <button
          className={activeTab === "team" ? "active" : ""}
          onClick={() => setActiveTab("team")}
        >
          ทีมงาน
        </button>
        <button
          className={activeTab === "payment" ? "active" : ""}
          onClick={() => setActiveTab("payment")}
        >
          การชำระเงิน
        </button>
        <button
          className={activeTab === "notify" ? "active" : ""}
          onClick={() => setActiveTab("notify")}
        >
          การแจ้งเตือน
        </button>
      </div>

      {/* ====== Content ====== */}
      <section className="tab-area">
        {/* ─── ข้อมูลร้าน ─── */}
        {activeTab === "info" && (
          <div className="card">
            <h3>ข้อมูลร้าน</h3>
            <div className="form-grid">
              <div className="col-1">
                <label>ชื่อร้าน</label>
                <input
                  type="text"
                  value={storeData.store_name}
                  onChange={(e) =>
                    setStoreData({ ...storeData, store_name: e.target.value })
                  }
                />

                <label>ที่อยู่</label>
                <textarea
                  value={storeData.address}
                  onChange={(e) =>
                    setStoreData({ ...storeData, address: e.target.value })
                  }
                />

                <label>คำอธิบายร้าน</label>
                <textarea
                  value={storeData.recommend_text || ""}
                  onChange={(e) =>
                    setStoreData({ ...storeData, recommend_text: e.target.value })
                  }
                />
              </div>

              <div className="col-2">
                <label>หมายเลขโทรศัพท์</label>
                <input
                  type="text"
                  value={storeData.phone}
                  onChange={(e) =>
                    setStoreData({ ...storeData, phone: e.target.value })
                  }
                />

                <label>อีเมล</label>
                <input
                  type="text"
                  value={storeData.email}
                  onChange={(e) =>
                    setStoreData({ ...storeData, email: e.target.value })
                  }
                />

                <div className="row">
                  <div>
                    <label>เวลาเปิด</label>
                    <input
                      type="time"
                      value={storeData.open_time || ""}
                      onChange={(e) =>
                        setStoreData({ ...storeData, open_time: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label>เวลาปิด</label>
                    <input
                      type="time"
                      value={storeData.close_time || ""}
                      onChange={(e) =>
                        setStoreData({ ...storeData, close_time: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="actions">
              <button className="btn-save" onClick={handleSave}>
                บันทึกการเปลี่ยนแปลง
              </button>
              <button className="btn-reset">รีเซ็ตค่าเริ่มต้น</button>
            </div>

            <h3 style={{ marginTop: 32 }}>ปักหมุดตำแหน่งร้านบนแผนที่</h3>
            <div className="form-grid">
              <div className="col-1">
                <label>ละติจูด (Latitude)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="เช่น 16.48408"
                  value={storeData.latitude}
                  onChange={(e) => setStoreData({ ...storeData, latitude: e.target.value })}
                />
                <label>ลองจิจูด (Longitude)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="เช่น 102.82000"
                  value={storeData.longitude}
                  onChange={(e) => setStoreData({ ...storeData, longitude: e.target.value })}
                />
              </div>
              <div className="col-2">
                <StoreLocationMap lat={mapLat} lng={mapLng} draggable onChange={handlePinChange} height="220px" />
              </div>
            </div>
            <div className="actions">
              <button className="btn-save" onClick={handleSaveLocation} disabled={savingLocation}>
                {savingLocation ? "กำลังบันทึก..." : "บันทึกตำแหน่งร้าน"}
              </button>
            </div>
          </div>
        )}

        {/* ─── ทีมงาน ─── */}
        {activeTab === "team" && (
          <div className="card">
            <h3>ทีมงาน</h3>
            <div className="team-list">
              {[
                { name: "วิภา ศิลป์สวย", email: "wipa@email.com", role: "พนักงาน" },
                { name: "สุชา เส้นสวย", email: "suda@email.com", role: "พนักงาน" },
                { name: "นิภา ดีไซน์", email: "nipa@email.com", role: "ผู้จัดการ" },
              ].map((member, i) => (
                <div className="team-item" key={i}>
                  <div>
                    <strong>{member.name}</strong>
                    <p>{member.email}</p>
                  </div>
                  <span className={`badge ${member.role === "ผู้จัดการ" ? "manager" : ""}`}>
                    {member.role}
                  </span>
                </div>
              ))}
              <button className="btn-add">+ เชิญพนักงานเข้าระบบ</button>
            </div>
          </div>
        )}

        {/* ─── การชำระเงิน ─── */}
        {activeTab === "payment" && (
          <div className="card">
            <h3>การชำระเงิน</h3>
            <div className="form-grid">
              <div className="col-1">
                <label>ธนาคาร</label>
                <select>
                  <option>ธนาคารไทยพาณิชย์</option>
                  <option>กสิกรไทย</option>
                  <option>กรุงไทย</option>
                </select>

                <label>ชื่อบัญชี</label>
                <input type="text" defaultValue="Crystal Shine" />

                <label>เลขบัญชี</label>
                <input type="text" defaultValue="123-4-56789-0" />

                <label>QR PromptPay</label>
                <input type="text" defaultValue="0812345678" />
              </div>

              <div className="col-2">
                <div className="switch-list">
                  <div className="switch-item">
                    <span>รับชำระเงินสด</span>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="switch-item">
                    <span>รับบัตรเครดิต/เดบิต</span>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="actions">
              <button className="btn-save">บันทึกการเปลี่ยนแปลง</button>
            </div>
          </div>
        )}

        {/* ─── การแจ้งเตือน ─── */}
        {activeTab === "notify" && (
          <div className="card">
            <h3>การแจ้งเตือน</h3>
            <div className="notify-list">
              {[
                "การแจ้งเตือนทางอีเมล",
                "การแจ้งเตือนทาง Line OA",
                "แจ้งเตือนการจองใหม่",
                "แจ้งเตือนยกเลิกการจอง",
                "แจ้งเตือนรีวิวใหม่",
                "แจ้งเตือนสินค้าเหลือน้อย",
              ].map((label, i) => (
                <div key={i} className="notify-item">
                  <span>{label}</span>
                  <label className="switch">
                    <input type="checkbox" defaultChecked={i !== 1} />
                    <span className="slider"></span>
                  </label>
                </div>
              ))}
            </div>
            <div className="actions">
              <button className="btn-save">บันทึกการเปลี่ยนแปลง</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
