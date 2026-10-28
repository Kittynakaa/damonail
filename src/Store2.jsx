import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStore_address } from "./callapi/call_api_store2.jsx";
import { getStoreById } from "./callapi/call_api_store2.jsx"; // 2. เปลี่ยนฟังก์ชันที่ใช้ดึง
import { getPromotionsByStore } from "./callapi/call_api_store2.jsx";
import { getReviewsByStore, createReview } from "./callapi/call_api_store2.jsx";
import { FiMapPin, FiStar } from "react-icons/fi";
import { getStoredUser } from "./callapi/auth";
import Swal from "sweetalert2";
import StoreLocationMap from "./components/StoreLocationMap";
import "./Store2.css";

export default function StorePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selected, setSelected] = useState(new Set());
  const [store2, setStore2] = useState(null);
  const [servicesFromApi, setServicesFromApi] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [promotions, setPromotions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [visibleReviewCount, setVisibleReviewCount] = useState(3);
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const currentUser = getStoredUser();

  // รูปภาพสำรองกรณีรูปจาก API ไม่ขึ้น
  const SAMPLE_IMAGES = [
    "https://i.pinimg.com/1200x/1f/91/7c/1f917cf916b15f21a3979ea0f46d1e17.jpg",
    "https://i.pinimg.com/736x/43/68/69/436869a369e7067e16181aa608520a71.jpg",
    "https://i.pinimg.com/1200x/f9/76/a5/f976a5c725b25acc3277273569334223.jpg"
  ];

  const loadReviews = async () => {
    const reviewResponse = await getReviewsByStore(id);
    const mappedReviews = (reviewResponse || []).map((review) => {
      const createdAt = review.created_at ? new Date(review.created_at) : null;
      const hasValidDate = createdAt && !Number.isNaN(createdAt.getTime());

      return {
        id: review.review_id,
        name: review.customer_name || review.nickname || review.username || `ลูกค้า #${review.user_id}`,
        rating: Number(review.rating || 0),
        date: hasValidDate ? createdAt.toLocaleDateString("th-TH") : "-",
        text: review.comment || "ไม่มีข้อความรีวิว",
      };
    });
    setReviews(mappedReviews);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser?.user_id) {
      Swal.fire("กรุณาเข้าสู่ระบบ", "เข้าสู่ระบบก่อนเพื่อเขียนรีวิว", "info");
      return;
    }
    if (myRating < 1) {
      Swal.fire("กรุณาให้คะแนน", "เลือกจำนวนดาวก่อนส่งรีวิว", "warning");
      return;
    }
    if (!myComment.trim()) {
      Swal.fire("กรุณาเขียนข้อความ", "ใส่ความคิดเห็นก่อนส่งรีวิว", "warning");
      return;
    }

    setSubmittingReview(true);
    try {
      await createReview({
        storeId: id,
        userId: currentUser.user_id,
        rating: myRating,
        comment: myComment.trim(),
      });
      setMyRating(0);
      setMyComment("");
      await loadReviews();
      Swal.fire({ icon: "success", title: "ขอบคุณสำหรับรีวิว", toast: true, position: "top-end", timer: 1800, showConfirmButton: false });
    } catch (err) {
      Swal.fire("ส่งรีวิวไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด กรุณาลองใหม่", "warning");
    } finally {
      setSubmittingReview(false);
    }
  };

  // ใน Store2.jsx
  useEffect(() => {
    async function fetchStoreData() {
      try {
        const servicesResponse = await getStoreById(id);
        const addressResponse = await getStore_address(id);
        const promoResponse = await getPromotionsByStore(id);

        const addressInfo = addressResponse || {};
        const serviceList = Array.isArray(servicesResponse) ? servicesResponse : [];

        // ===== STORE + SERVICES =====
        if (serviceList.length > 0 || addressInfo.store_id) {
          const baseStoreInfo = serviceList.length > 0 ? serviceList[0] : {};
          setStore2({ ...baseStoreInfo, ...addressInfo });

          const serviceMap = new Map();
          serviceList.forEach((r) => {
            if (r.service_id && !serviceMap.has(r.service_id)) {
              serviceMap.set(r.service_id, {
                id: r.service_id,
                name: r.service_name,
                price: Number(r.price),
                minutes: r.duration_minutes
              });
            }
          });

          setServicesFromApi(Array.from(serviceMap.values()));
        }
        const formatDate = (date) => {
          if (!date) return "-";
          return new Date(date).toLocaleDateString("th-TH");
        };
        // ===== PROMOTION (🔥 ตรงนี้แหละที่ต้องอยู่ใน useEffect) =====
        const mappedPromos = (promoResponse || []).map(p => ({
          id: p.promo_id,
          title: p.name,
          detail: p.detail || "ไม่มีรายละเอียด",
          discount: `ลด ${p.discount}%`,
          code: p.promo_code,
          discountValue: Number(p.discount || 0),
          typePromoId: Number(p.type_promo_id || 1),
          period: p.start_date && p.end_date
            ? `${formatDate(p.start_date)} - ${formatDate(p.end_date)}`
            : "ไม่ระบุช่วงเวลา"
        }));

        setPromotions(mappedPromos);

        await loadReviews();

      } catch (err) {
        console.error("Error loading store data:", err);
      }
    }

    if (id) fetchStoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleGoToBooking = () => {
    const selectedServices = servicesFromApi.filter(s => selected.has(s.id));

    const bookingData = {
      storeId: id, // ID จาก useParams() ของหน้า Store2
      storeName: store2?.store_name || "ร้านทำเล็บ",
      services: selectedServices, // เฉพาะรายการที่ผู้ใช้เลือกจริง
      promoCode: normalizedPromoCode,
      promoDiscount,
      finalPrice,
      promotions,
    };

    // บันทึกทับของเดิมทุกครั้งก่อนย้ายหน้า
    sessionStorage.setItem("bookingPayload", JSON.stringify(bookingData));
    navigate("/booking");
  };

  const selectedList = servicesFromApi.filter(s => selected.has(s.id));
  const totalPrice = selectedList.reduce((acc, s) => acc + s.price, 0);
  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
    : Number(store2?.avg_rating || 0).toFixed(1);
  const normalizedPromoCode = promoCode.trim().toUpperCase();
  const activePromotion = normalizedPromoCode
    ? promotions.find(
        (promo) => String(promo.code || "").trim().toUpperCase() === normalizedPromoCode
      )
    : null;
  const promoDiscount = activePromotion
    ? Math.round(totalPrice * (activePromotion.discountValue / 100))
    : 0;
  const finalPrice = Math.max(totalPrice - promoDiscount, 0);

  return (
    <div className="st-clean-root">
      <div className="st-wrapper">
        <header className="st-hero">
          <h1 className="st-main-name">
            {store2?.store_name || "ร้านทำเล็บ"}
            {store2?.is_verified === 1 && <span className="st-v-badge">ยืนยันแล้ว</span>}
          </h1>
          <div className="st-hero-meta">
            <span className="st-hero-rating">★ {averageRating}</span>
            <span className="st-hero-dot">•</span>
            <span>{reviews.length} รีวิว</span>
            {store2?.district && (
              <>
                <span className="st-hero-dot">•</span>
                <span><FiMapPin className="st-hero-icon" /> {store2.district}, {store2.province}</span>
              </>
            )}
          </div>
          <p style={{ fontStyle: 'italic', color: '#888', marginTop: '15px' }}>“ {store2?.recommend_text} ”</p>
        </header>

        {/* Image Gallery */}
        <div className="st-image-grid">
          <img src={SAMPLE_IMAGES[0]} className="st-img-main" alt="ภายในร้าน" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <img src={SAMPLE_IMAGES[1]} className="st-img-sub" alt="รายละเอียดร้าน 1" />
            <img src={SAMPLE_IMAGES[2]} className="st-img-sub" alt="รายละเอียดร้าน 2" />
          </div>
        </div>

        <div className="st-content-grid">
          <div className="st-left-col">
            <h2 className="st-section-title">เมนูบริการ</h2>
            <div className="st-service-table">
              <div className="st-table-header">
                <span>บริการ</span>
                <span>ระยะเวลา</span>
                <span style={{ textAlign: 'right' }}>ราคา</span>
              </div>
              {servicesFromApi.map(s => (
                <div key={s.id}
                  className={`st-table-row ${selected.has(s.id) ? 'selected' : ''}`}
                  onClick={() => {
                    const n = new Set(selected);
                    n.has(s.id) ? n.delete(s.id) : n.add(s.id);
                    setSelected(n);
                  }}>
                  <span style={{ fontFamily: 'Tenor Sans', fontSize: '18px' }}>{s.name}</span>
                  <span style={{ color: '#999' }}>{s.minutes} นาที</span>
                  <span style={{ textAlign: 'right', fontWeight: '500' }}>฿{s.price.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <h2 className="st-section-title">ที่ตั้งและแผนที่</h2>
            <p>{store2?.street} {store2?.district}, {store2?.province}</p>
            <div className="st-map-box">
              <StoreLocationMap
                lat={store2?.latitude != null ? Number(store2.latitude) : null}
                lng={store2?.longitude != null ? Number(store2.longitude) : null}
                height="100%"
              />
            </div>

            <section className="st-section-block">
              <div className="st-section-heading-row">
                <h2 className="st-section-title">โปรโมชั่นพิเศษ</h2>
                <span className="st-section-kicker">ข้อเสนอพิเศษเฉพาะร้านนี้</span>
              </div>
              <div className="st-promo-grid">
                {promotions.map((promo) => (
                  <article className="st-promo-card" key={promo.id}>
                    <span className="st-promo-discount">{promo.discount}</span>
                    <div className="st-promo-code">
                      โค้ด: {promo.code || "-"}
                    </div>
                    <h3>{promo.title}</h3>
                    <p>{promo.detail}</p>
                    <div className="st-promo-period">{promo.period}</div>
                  </article>
                ))}
              </div>
            </section>

            <section className="st-section-block">
              <div className="st-section-heading-row">
                <h2 className="st-section-title">รีวิวจากลูกค้า</h2>
                <div className="st-review-overview">
                  <span className="st-review-score">★ {averageRating}</span>
                  <span className="st-review-caption">เสียงตอบรับจากลูกค้าของร้าน</span>
                </div>
              </div>

              <article className="st-review-card st-review-form-card">
                <h3>เขียนรีวิวร้านนี้</h3>
                {currentUser?.user_id ? (
                  <form onSubmit={handleSubmitReview}>
                    <div
                      className="st-star-picker"
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <FiStar
                          key={n}
                          className={`st-star-pick ${n <= (hoverRating || myRating) ? "filled" : ""}`}
                          onMouseEnter={() => setHoverRating(n)}
                          onClick={() => setMyRating(n)}
                        />
                      ))}
                    </div>
                    <textarea
                      className="st-review-textarea"
                      placeholder="เล่าประสบการณ์ของคุณกับร้านนี้..."
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                    />
                    <button type="submit" className="st-review-submit-btn" disabled={submittingReview}>
                      {submittingReview ? "กำลังส่ง..." : "ส่งรีวิว"}
                    </button>
                  </form>
                ) : (
                  <p className="st-review-text">
                    <button type="button" className="st-review-login-link" onClick={() => navigate("/register")}>
                      เข้าสู่ระบบ
                    </button>{" "}
                    เพื่อเขียนรีวิวร้านนี้
                  </p>
                )}
              </article>

              <div className="st-review-list">
                {reviews.length > 0 ? (
                  reviews.slice(0, visibleReviewCount).map((review) => (
                    <article className="st-review-card" key={review.id}>
                      <div className="st-review-top">
                        <div>
                          <h3>{review.name}</h3>
                          <p>{review.date}</p>
                        </div>
                        <span className="st-review-stars">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(Math.max(5 - review.rating, 0))}
                        </span>
                      </div>
                      <p className="st-review-text">{review.text}</p>
                    </article>
                  ))
                ) : (
                  <article className="st-review-card st-review-empty">
                    <p className="st-review-text">ยังไม่มีรีวิวของร้านนี้ในตอนนี้</p>
                  </article>
                )}
              </div>
              {reviews.length > visibleReviewCount && (
                <button
                  type="button"
                  className="st-review-more-btn"
                  onClick={() => setVisibleReviewCount((n) => n + 3)}
                >
                  ดูรีวิวเพิ่มเติม ({reviews.length - visibleReviewCount})
                </button>
              )}
              {visibleReviewCount > 3 && visibleReviewCount >= reviews.length && reviews.length > 3 && (
                <button
                  type="button"
                  className="st-review-more-btn st-review-less-btn"
                  onClick={() => setVisibleReviewCount(3)}
                >
                  ย่อรีวิว
                </button>
              )}
            </section>
          </div>

          <div className="st-right-col">
            <div className="st-booking-card">
              <h3 style={{ fontFamily: 'Tenor Sans', fontSize: '24px', marginBottom: '20px' }}>สรุปรายการที่เลือก</h3>
              <div style={{ minHeight: '60px' }}>
                {selectedList.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                    <span>{s.name}</span>
                    <span>฿{s.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="st-promo-field">
                <label htmlFor="promo-code">โค้ดส่วนลด</label>
                <input
                  id="promo-code"
                  type="text"
                  placeholder="กรอกโค้ดส่วนลดของร้าน"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <p className="st-promo-hint">
                  ใช้โค้ดจากการ์ดโปรโมชั่นของร้านด้านซ้าย
                </p>
              </div>
              <div style={{ borderTop: '1px solid #EEE', paddingTop: '20px', marginTop: '20px' }}>
                {promoDiscount > 0 && (
                  <div className="st-summary-row st-summary-discount">
                    <span>ส่วนลดโปรโมชั่น</span>
                    <span>-฿{promoDiscount.toLocaleString()}</span>
                  </div>
                )}
                <label style={{ fontSize: '10px', letterSpacing: '2px', color: '#B09987' }}>รวมทั้งหมด</label>
                <div style={{ fontSize: '36px', fontFamily: 'Tenor Sans' }}>฿{finalPrice.toLocaleString()}</div>
              </div>
              <button className="st-btn-book" disabled={selected.size === 0} onClick={handleGoToBooking}>
                จองเลย
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
