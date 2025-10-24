import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "./AddStore.css"; // ⬅️ CSS แยกและทำ scope ไว้แล้ว

export default function AddStore() {
  // ===== State =====
  const [store, setStore] = useState(() => ({
    id: "store_" + Math.random().toString(36).slice(2, 8),
    name: "",
    area: "",
    address: "",
    mapUrl: "",
    rating: "",
    priceFrom: "",
    hours: "",
    amenities: [],
    images: [],
    tags: [],
    services: [], // {id,name,category,price,minutes,desc}
  }));

  // ===== Refs =====
  const imgFileRef = useRef(null);
  const dropZoneRef = useRef(null);

  // ===== Derived =====
  const progressPct = useMemo(() => {
    let score = 0;
    if (store.name?.trim()) score++;
    if (store.area?.trim()) score++;
    if (store.priceFrom !== "" && Number(store.priceFrom) >= 0) score++;
    if (store.address?.trim()) score++;
    if (store.images.length > 0) score++;
    if (store.services.length > 0) score++;
    return Math.round((score / 6) * 100);
  }, [store]);

  // ===== Helpers =====
  const showToast = useCallback((msg) => {
    const el = document.getElementById("nf-toast");
    if (!el) return;
    el.textContent = msg || "บันทึกร้านเรียบร้อย 🎉";
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2200);
  }, []);

  const update = (patch) => setStore((s) => ({ ...s, ...patch }));

  // ===== Images =====
  const renderImages = useMemo(
    () =>
      store.images.slice(0, 4).map((src, i) => (
        <img key={i} src={src} alt="" />
      )),
    [store.images]
  );

  const addImageUrl = (url) => {
    const okExt = /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url);
    const isHttps = /^https:\/\//i.test(url);
    if (!okExt) return showToast("กรุณาใช้ลิงก์รูปโดยตรง (.jpg/.png/.webp)");
    if (location.protocol === "https:" && !isHttps)
      return showToast("ลิงก์ http อาจถูกบล็อกบน https — กรุณาใช้ https");
    try {
      new URL(url);
    } catch {
      return showToast("ลิงก์รูปไม่ถูกต้อง");
    }
    setStore((s) => ({ ...s, images: [...s.images, url] }));
  };

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const MAX_MB = 8;
    const accept = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const overs = [];
    const wrong = [];
    files.forEach((f) => {
      if (!accept.includes(f.type)) {
        wrong.push(f.name);
        return;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        overs.push(f.name);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) =>
        setStore((s) => ({ ...s, images: [...s.images, ev.target.result] }));
      reader.readAsDataURL(f);
    });
    if (wrong.length) showToast("ชนิดไฟล์ไม่รองรับ: " + wrong.join(", "));
    if (overs.length) showToast("ไฟล์ใหญ่เกิน " + MAX_MB + "MB: " + overs.join(", "));
  };

  const removeImg = (i) =>
    setStore((s) => {
      const images = s.images.slice();
      images.splice(i, 1);
      return { ...s, images };
    });

  // Drag&Drop
  useEffect(() => {
    const dz = dropZoneRef.current;
    if (!dz) return;
    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onEnter = (e) => {
      prevent(e);
      dz.classList.add("highlight");
    };
    const onLeave = (e) => {
      prevent(e);
      dz.classList.remove("highlight");
    };
    const onDrop = (e) => {
      prevent(e);
      dz.classList.remove("highlight");
      handleFiles(e.dataTransfer.files);
    };

    ["dragenter", "dragover"].forEach((ev) => dz.addEventListener(ev, onEnter));
    ["dragleave", "drop"].forEach((ev) => dz.addEventListener(ev, onLeave));
    dz.addEventListener("drop", onDrop);

    return () => {
      ["dragenter", "dragover"].forEach((ev) => dz.removeEventListener(ev, onEnter));
      ["dragleave", "drop"].forEach((ev) => dz.removeEventListener(ev, onLeave));
      dz.removeEventListener("drop", onDrop);
    };
  }, []);

  // ===== Tags =====
  const removeTag = (i) =>
    setStore((s) => {
      const tags = s.tags.slice();
      tags.splice(i, 1);
      return { ...s, tags };
    });

  // ===== Services =====
  const addSvc = () =>
    setStore((s) => ({
      ...s,
      services: [
        ...s.services,
        { id: "svc_" + (Date.now() + Math.random().toString(16).slice(2)), name: "", category: "gel", price: "", minutes: "", desc: "" },
      ],
    }));

  const delSvc = (i) =>
    setStore((s) => {
      const services = s.services.slice();
      services.splice(i, 1);
      return { ...s, services };
    });

  const setSvc = (i, key, val) =>
    setStore((s) => {
      const services = s.services.slice();
      services[i] = { ...services[i], [key]: val };
      return { ...s, services };
    });

  const deriveServiceTags = (services) => {
    const tags = new Set();
    services.forEach((s) => {
      const c = (s.category || "").toLowerCase();
      if (c.includes("gel")) tags.add("เจลมือ");
      if (c.includes("paint")) tags.add("เพ้นท์");
      if (c.includes("spa")) tags.add("สปา");
      if ((s.name || "").includes("ต่อ")) tags.add("ต่อเล็บ");
    });
    return tags.size ? Array.from(tags) : ["บริการทำเล็บ"];
  };

  // ===== Save / Preview =====
  const validate = () => {
    const errs = [];
    if (!store.name.trim()) errs.push("กรุณากรอกชื่อร้าน");
    if (!store.area.trim()) errs.push("กรุณาเลือกพื้นที่");
    if (store.priceFrom === "" || Number(store.priceFrom) < 0) errs.push("กรุณากรอกราคาเริ่มต้น");
    if (!store.address.trim()) errs.push("กรุณาระบุที่อยู่");
    if (!store.images.length) errs.push("กรุณาเพิ่มรูปอย่างน้อย 1 รูป");
    if (!store.services.length) errs.push("กรุณาเพิ่มบริการอย่างน้อย 1 รายการ");
    const svcInvalid = store.services.find((s) => !s.name || !s.category || !s.price || !s.minutes);
    if (svcInvalid) errs.push("โปรดกรอกข้อมูลบริการให้ครบ (ชื่อ/หมวด/ราคา/นาที)");
    return errs;
  };

  const saveStore = () => {
    const errs = validate();
    if (errs.length) {
      alert("ไม่สามารถบันทึกได้:\n- " + errs.join("\n- "));
      return;
    }
    const key = "customShops";
    const list = JSON.parse(localStorage.getItem(key) || "[]");

    const summary = {
      id: store.id,
      name: store.name,
      area: store.area,
      services: deriveServiceTags(store.services),
      price: Number(store.priceFrom) || 0,
      rating: store.rating ? Number(store.rating) : 4.7,
      distance: 1.0,
      hot: true,
      img: store.images[0],
    };
    const detail = { ...store };
    list.push({ summary, detail });
    localStorage.setItem(key, JSON.stringify(list));

    sessionStorage.setItem("storePreview", JSON.stringify(detail));
    showToast("บันทึกร้านเรียบร้อย 🎉");
  };

  const goPreview = () => {
    sessionStorage.setItem("storePreview", JSON.stringify(store));
    window.location.href = "store2.html";
  };

  return (
    <div className="nf-add">
      <main className="container">
        <div className="grid">
          {/* LEFT: PREVIEW */}
          <aside className="left">
            <div className="card">
              <div className="card-head">
                <strong>พรีวิวร้าน</strong>
                <div className="badge">
                  {store.rating ? `เรตติ้ง ${(+store.rating).toFixed(2)}` : "เรตติ้ง —"}
                </div>
              </div>
              <div className="card-body" style={{ paddingBottom: 6 }}>
                <div className="hero">
                  <img
                    src={
                      store.images[0] ||
                      "https://images.unsplash.com/photo-1605979257913-d990e91f4a3b?q=80&w=1400"
                    }
                    alt="preview"
                  />
                  <div className="glow">
                    <span className="price">
                      {store.priceFrom !== "" ? `เริ่ม ฿${Number(store.priceFrom).toLocaleString("th-TH")}` : "เริ่ม ฿—"}
                    </span>
                    <span className="pill">ยืนยันแล้ว</span>
                  </div>
                </div>

                <div className="title">
                  <h2>{store.name || "ชื่อร้านของคุณ"}</h2>
                  <span className="chip">{store.area || "พื้นที่"}</span>
                </div>

                <div id="pTags" className="tagwrap" style={{ margin: "6px 16px" }}>
                  {store.tags.slice(0, 5).map((t, i) => (
                    <span key={i} className="chip">{t}</span>
                  ))}
                </div>

                <div className="thumbs">{renderImages}</div>

                <div className="meta-row">
                  <span className="ok">• เปิด-ปิด: {store.hours || "—"}</span>
                  <span className="muted">• สิ่งอำนวยความสะดวก: {store.amenities.length ? store.amenities.join(", ") : "—"}</span>
                </div>

                <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", margin: "10px 16px 4px" }}>
                  <a className="btn" href="store2.html">ดูหน้าร้าน</a>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT: FORM */}
          <section className="card">
            <div className="card-head">
              <div>
                <strong>กรอกข้อมูลร้าน</strong>
                <div className="note">เติมให้ครบเพื่อความน่าเชื่อถือและค้นหาเจอง่าย</div>
              </div>
              <div style={{ minWidth: 240 }}>
                <div className="progress"><div className="bar" style={{ width: `${progressPct}%` }} /></div>
                <div className="note" style={{ textAlign: "right", marginTop: ".25rem" }}>
                  ความครบถ้วน {progressPct}%
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* A: Basic */}
              <div className="row">
                <div>
                  <label className="req">ชื่อร้าน</label>
                  <input
                    type="text"
                    placeholder="เช่น GlamNail Studio"
                    value={store.name}
                    onChange={(e) => update({ name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="req">พื้นที่</label>
                  <select
                    value={store.area}
                    onChange={(e) => update({ area: e.target.value })}
                  >
                    <option value="">เลือกพื้นที่</option>
                    <option>สยาม</option>
                    <option>อารีย์</option>
                    <option>ขอนแก่น</option>
                    <option>ลาดพร้าว</option>
                  </select>
                </div>
                <div>
                  <label className="req">ราคาเริ่มต้น (฿)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="เช่น 650"
                    value={store.priceFrom}
                    onChange={(e) => update({ priceFrom: e.target.value })}
                  />
                </div>
                <div>
                  <label>เรตติ้ง (0–5)</label>
                  <input
                    type="number"
                    min="0" max="5" step="0.01"
                    placeholder="เช่น 4.85"
                    value={store.rating}
                    onChange={(e) => update({ rating: e.target.value })}
                  />
                </div>
              </div>

              {/* B: Location/Hours */}
              <div className="row" style={{ marginTop: 12 }}>
                <div>
                  <label className="req">ที่อยู่</label>
                  <input
                    type="text"
                    placeholder="เช่น 123 ถนนมิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น"
                    value={store.address}
                    onChange={(e) => update({ address: e.target.value })}
                  />
                </div>
                <div>
                  <label>ลิงก์แผนที่ Google</label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/..."
                    value={store.mapUrl}
                    onChange={(e) => update({ mapUrl: e.target.value })}
                  />
                  <div className="note">ถ้าไม่ใส่ ระบบจะใช้พิกัดพื้นที่แทน</div>
                </div>
              </div>

              <div className="row" style={{ marginTop: 12 }}>
                <div>
                  <label>เวลาทำการ</label>
                  <input
                    type="text"
                    placeholder="ทุกวัน 10:00–20:00"
                    value={store.hours}
                    onChange={(e) => update({ hours: e.target.value })}
                  />
                </div>
                <div>
                  <label>สิ่งอำนวยความสะดวก</label>
                  <input
                    type="text"
                    placeholder="ที่จอดรถ, รับบัตร, วัสดุพรีเมียม"
                    onChange={(e) =>
                      update({
                        amenities: e.target.value
                          .split(",")
                          .map((x) => x.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              </div>

              {/* C: Media/Tags */}
              <div className="row" style={{ marginTop: 12 }}>
                <div>
                  <label>รูปภาพร้าน</label>
                  <div className="field-group" style={{ margin: ".5rem 0" }}>
                    <input id="imgUrl" type="url" placeholder="วาง 'ลิงก์รูปโดยตรง' แล้วกด +"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const v = e.currentTarget.value.trim();
                          if (v) addImageUrl(v);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => {
                        const inp = document.getElementById("imgUrl");
                        const v = (inp?.value || "").trim();
                        if (v) addImageUrl(v);
                        if (inp) inp.value = "";
                      }}
                    >
                      + เพิ่มรูป (ลิงก์)
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: ".6rem", alignItems: "center", margin: ".4rem 0" }}>
                    <input ref={imgFileRef} type="file" accept="image/*" multiple onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
                    <button
                      className="btn btn-sm btn-long"
                      type="button"
                      onClick={() => imgFileRef.current?.click()}
                    >
                      อัปโหลดจากเครื่อง
                    </button>
                  </div>

                  <div id="dropZone" ref={dropZoneRef} className="dropZone">
                    ลาก-วางรูปที่นี่ หรือกดเลือกไฟล์ด้านบน (รองรับหลายรูป)
                  </div>

                  <div className="thumbs" style={{ margin: "10px 0 .2rem" }}>
                    {store.images.map((src, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img
                          src={src}
                          alt=""
                          style={{
                            height: 74,
                            width: "100%",
                            objectFit: "cover",
                            border: "1px solid var(--stroke)",
                            borderRadius: 10,
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ position: "absolute", top: 6, right: 6, padding: ".2rem .5rem" }}
                          onClick={() => removeImg(i)}
                        >
                          ลบ
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="note">
                    แนะนำภาพแนวนอน ≥ 1200px • รองรับ .jpg/.png/.webp • ลิงก์ต้องเป็น URL รูปโดยตรง
                  </div>
                </div>

                <div>
                  <label>แท็ก/จุดเด่น</label>
                  <input
                    type="text"
                    placeholder="พิมพ์แท็กแล้วกด Enter เพื่อเพิ่ม"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const v = e.currentTarget.value.trim();
                        if (!v) return;
                        setStore((s) => ({ ...s, tags: [...s.tags, v] }));
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <div className="tagwrap">
                    {store.tags.map((t, i) => (
                      <span key={i} className="chip">
                        {t}
                        <span
                          style={{ cursor: "pointer", fontWeight: 700, opacity: 0.7, marginLeft: 6 }}
                          onClick={() => removeTag(i)}
                          title="ลบแท็ก"
                        >
                          ×
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* D: Services */}
              <div style={{ marginTop: 16 }}>
                <div className="field-inline" style={{ justifyContent: "space-between" }}>
                  <label className="req" style={{ margin: 0 }}>
                    บริการในร้าน
                  </label>
                  <button className="btn btn-ghost" type="button" onClick={addSvc}>
                    + เพิ่มบริการ
                  </button>
                </div>
                <div className="note">
                  ตั้งชื่อบริการ หมวด (gel/paint/spa) ราคา และเวลาทำ (นาที) • เพิ่ม “รายละเอียด” ใต้แต่ละบริการได้
                </div>

                <div className="list" style={{ marginTop: ".7rem" }}>
                  {store.services.length === 0 ? (
                    <div className="muted">ยังไม่มีบริการ กด “+ เพิ่มบริการ” เพื่อเริ่มต้น</div>
                  ) : (
                    store.services.map((s, i) => (
                      <div key={s.id} className="svc">
                        <div className="svc-top">
                          <input
                            name="name"
                            type="text"
                            placeholder="ชื่อบริการ"
                            value={s.name}
                            onChange={(e) => setSvc(i, "name", e.target.value)}
                          />
                          <input
                            name="category"
                            type="text"
                            placeholder="หมวด (gel/paint/spa)"
                            value={s.category}
                            onChange={(e) => setSvc(i, "category", e.target.value)}
                          />
                          <input
                            name="price"
                            type="number"
                            placeholder="ราคา"
                            value={s.price}
                            onChange={(e) => setSvc(i, "price", e.target.value)}
                          />
                          <input
                            name="minutes"
                            type="number"
                            placeholder="นาที"
                            value={s.minutes}
                            onChange={(e) => setSvc(i, "minutes", e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addSvc();
                              }
                            }}
                          />
                          <button type="button" className="del" title="ลบ" onClick={() => delSvc(i)}>
                            🗑️
                          </button>
                        </div>
                        <div className="svc-desc">
                          <textarea
                            name="desc"
                            placeholder="รายละเอียด/เงื่อนไขเสริม เช่น เลือกสีเจล 1 โทน ฟรีตะไบ ตกแต่งมินิมอล ..."
                            value={s.desc}
                            onChange={(e) => setSvc(i, "desc", e.target.value)}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginTop: 18 }}>
                <button onClick={saveStore} className="btn btn-primary">บันทึกร้าน</button>
                <button onClick={goPreview} className="btn">ดูหน้าร้านตัวอย่าง</button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <div id="nf-toast" className="toast">บันทึกแล้ว</div>
    </div>
  );
}
