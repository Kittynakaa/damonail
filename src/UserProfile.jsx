import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getStores } from "./callapi/call_api_user.jsx";
import { FiUser, FiPhone, FiMail, FiCalendar, FiClock, FiLogOut, FiEdit3, FiChevronRight } from "react-icons/fi";
import "./UserProfile.css";
import { getUserById, updateUserById, getUserBookings } from "./callapi/call_api_userprofile.jsx";
import { getStoreByUser } from "./callapi/call_api_userprofile.jsx";
import { getStatusMeta } from "./utils/bookingStatus.js";
import BookingDetailModal from "./components/BookingDetailModal.jsx";
import { getStoredUser } from "./callapi/auth";

const IMAGE_BASE_URL = "http://localhost:5010/static/images";

export default function UserProfile() {
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const isStaff = storedUser?.role_id === 3 && !!storedUser?.employee_id;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("bookings");
  const [favoriteStores, setFavoriteStores] = useState([]);
  const [profile, setProfile] = useState({
    avatar: localStorage.getItem("pf_avatar") || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400",
    username: "", name: "", phone: "", email: "",
  });
  const [hasStore, setHasStore] = useState(false);
  const [storeData, setStoreData] = useState(null);


  const [editModal, setEditModal] = useState({ open: false, field: "", label: "", value: "" });
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [bookingPage, setBookingPage] = useState(1);
  const bookingsPerPage = 5;

  const reloadBookings = async () => {
    if (!userId) return;
    try {
      const bookingData = await getUserBookings(userId);
      setBookings(bookingData);
    } catch (err) {
      console.error("Reload bookings error:", err);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const storedToken = localStorage.getItem("token");
        if (!storedUser?.user_id || !storedToken) {
          localStorage.clear();
          navigate("/register");
          return;
        }
        setUserId(storedUser.user_id);

        const [userData, bookingData, storeRes] = await Promise.all([
          getUserById(storedUser.user_id),
          getUserBookings(storedUser.user_id),
          getStoreByUser(storedUser.user_id)
        ]);

        setProfile(prev => ({
          ...prev,
          username: userData.username,
          name: userData.nickname || "ยังไม่ได้ตั้งค่า",
          phone: userData.phone || "ยังไม่ได้ตั้งค่า",
          email: userData.email,
        }));

        setBookings(bookingData);

        if (storeRes.has_store) {
          setHasStore(true);
          setStoreData(storeRes.store);
        }

        // ถ้ามาจากการกด Notification ให้เปิดรายละเอียดการจองนั้นทันที
        const pendingBookingId = sessionStorage.getItem("openBookingId");
        if (pendingBookingId) {
          sessionStorage.removeItem("openBookingId");
          setTab("bookings");
          setSelectedBookingId(Number(pendingBookingId));
        }

      } catch (err) {
        console.error("Fetch Error:", err);
        // token หมดอายุ/ไม่ถูกต้อง -- เคลียร์ session แล้วพากลับไปหน้า login
        // แทนที่จะปล่อยให้หน้าดูเหมือนใช้งานได้ปกติแต่การจองหายไปเงียบ ๆ
        if (err?.response?.status === 401) {
          localStorage.clear();
          Swal.fire({
            icon: "info",
            title: "เซสชันหมดอายุ",
            text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
            confirmButtonColor: "#d9789c",
          }).then(() => navigate("/register"));
          return;
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [navigate]);

  useEffect(() => {
    async function loadFavorites() {
      const favIds = JSON.parse(localStorage.getItem("my_favorites")) || [];
      if (favIds.length === 0) {
        setFavoriteStores([]);
        return;
      }

      try {
        const res = await getStores(); // ดึงร้านทั้งหมด
        const allStores = res.data || [];

        const favStores = allStores.filter(s =>
          favIds.includes(s.store_id)
        );

        setFavoriteStores(favStores);
      } catch (err) {
        console.error("Load favorites error:", err);
      }
    }

    loadFavorites();
  }, [tab]); // โหลดใหม่ตอนสลับแท็บ


  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบ?',
      text: "คุณแน่ใจหรือไม่ว่าต้องการออกจากโปรไฟล์ของคุณ",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2D4A43',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ออกจากระบบ',
      background: '#fff',
      customClass: { title: 'swal-title-atelier' }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate("/");
        window.location.reload();
      }
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfile(p => ({ ...p, avatar: ev.target.result }));
      localStorage.setItem("pf_avatar", ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const confirmEdit = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      await updateUserById(storedUser.user_id, {
        ...(editModal.field === "name" && { nickname: editModal.value }),
        ...(editModal.field === "phone" && { phone: editModal.value }),
        ...(editModal.field === "email" && { email: editModal.value }),
      });
      setProfile(p => ({ ...p, [editModal.field]: editModal.value }));
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "อัปเดตโปรไฟล์แล้ว",
        showConfirmButton: false,
        timer: 1500,
        toast: true
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "อัปเดตไม่สำเร็จ", text: "กรุณาตรวจสอบการเชื่อมต่อของคุณ" });
    } finally {
      setEditModal({ open: false, field: "", label: "", value: "" });
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="atelier-loader"></div>
        <p>กำลังโหลดโปรไฟล์...</p>
      </div>
    );
  }
  return (
    <div className="profile-page">
      <div className="atelier-container">
        {/* Header Section */}
        <header className="profile-header-card">
          <div className="profile-main-grid">
            <div className="avatar-side">
              <div className="avatar-wrapper">
                <img src={profile.avatar} alt="รูปโปรไฟล์สมาชิก" />
                <label className="avatar-edit-badge">
                  <FiEdit3 />
                  <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
              <button className="btn-logout-minimal" onClick={handleLogout}>
                <FiLogOut /> ออกจากระบบ
              </button>
            </div>

            <div className="info-side">
              <div className="member-tag">โปรไฟล์สมาชิก</div>
              <h1 className="profile-name">{profile.username || "ผู้เยี่ยมชม"}</h1>

              <div className="profile-fields-grid">
                <div className="field-group" onClick={() => setEditModal({ open: true, field: "name", label: "ชื่อเล่น", value: profile.name })}>
                  <label><FiUser /> ชื่อเล่น</label>
                  <div className="field-value">{profile.name}</div>
                </div>
                <div className="field-group" onClick={() => setEditModal({ open: true, field: "phone", label: "เบอร์ติดต่อ", value: profile.phone })}>
                  <label><FiPhone /> เบอร์ติดต่อ</label>
                  <div className="field-value">{profile.phone}</div>
                </div>
                <div className="field-group full-width" onClick={() => setEditModal({ open: true, field: "email", label: "อีเมล", value: profile.email })}>
                  <label><FiMail /> อีเมล</label>
                  <div className="field-value">{profile.email}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="atelier-tabs">
          <button className={`tab-item ${tab === "bookings" ? "active" : ""}`} onClick={() => setTab("bookings")}>การจอง</button>
          <button className={`tab-item ${tab === "favorites" ? "active" : ""}`} onClick={() => setTab("favorites")}>รายการโปรด</button>
          <button className={`tab-item ${tab === "owner" ? "active" : ""}`} onClick={() => setTab("owner")}>{isStaff ? "พนักงาน" : "ธุรกิจ"}</button>
        </nav>

        {/* Content Area */}
        <main className="tab-content">
          {tab === "bookings" && (
            <div className="booking-list">
              {bookings.length > 0 ? bookings.slice(
                (bookingPage - 1) * bookingsPerPage,
                bookingPage * bookingsPerPage
              ).map((b) => {
                const meta = getStatusMeta(b.status_booking_name, b.cancelled_by);
                return (
                  <div
                    className="reservation-card reservation-card-clickable"
                    key={b.booking_id}
                    onClick={() => setSelectedBookingId(b.booking_id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="res-details">
                      <span className="res-store">{b.store_name}</span>
                      <h4 className="res-service">{b.svc}</h4>
                      <div className="res-meta">
                        <span><FiCalendar /> {b.booking_date}</span>
                        <span><FiClock /> {b.booking_time} น.</span>
                      </div>
                      {b.total_price != null && (
                        <div className="res-price">฿{Number(b.total_price).toLocaleString()}</div>
                      )}
                    </div>
                    <div className="res-status">
                      <span className={`status-badge ${meta.className}`}>
                        {meta.label}
                      </span>
                      <span className="res-view-detail">
                        ดูรายละเอียด <FiChevronRight />
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="empty-state">
                  <p>ยังไม่มีการจองที่กำลังจะมาถึง</p>
                </div>
              )}

              {bookings.length > bookingsPerPage && (
                <div className="pagination-bar">
                  {Array.from(
                    { length: Math.ceil(bookings.length / bookingsPerPage) },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`page-num-btn ${page === bookingPage ? "active" : ""}`}
                      onClick={() => setBookingPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "owner" && (
            <div className="business-ct">
              {isStaff ? (
                <>
                  <h3>คุณเป็นพนักงานของร้านนี้</h3>
                  <p>ดูคิวงาน ขอลาหยุด และจัดการตารางงานของคุณได้จากหน้าพนักงาน</p>
                  <button
                    className="btn-atelier-primary"
                    onClick={() => navigate("/MySchedule")}
                  >
                    ไปที่หน้าพนักงาน
                  </button>
                </>
              ) : hasStore ? (
                <>
                  <h3>แดชบอร์ดธุรกิจของคุณ</h3>
                  <p>จัดการร้านและการจองของคุณได้จากแดชบอร์ด</p>
                  <button
                    className="btn-atelier-primary"
                    onClick={() => navigate(`/StoreDashboard/${storeData.store_id}`)}
                  >
                    ไปที่แดชบอร์ด
                  </button>
                </>
              ) : (
                <>
                  <h3>เข้าร่วมเป็นพาร์ตเนอร์</h3>
                  <p>เพิ่มร้านของคุณและเข้าถึงลูกค้าใหม่ๆ ในคอมมูนิตี้ของเรา</p>
                  <button
                    className="btn-atelier-primary"
                    onClick={() => navigate("/AddStore")}
                  >
                    ลงทะเบียนธุรกิจ
                  </button>
                </>
              )}
            </div>
          )}


          {tab === "favorites" && (
            <div className="favorites-grid">
              {favoriteStores.length > 0 ? (
                favoriteStores.map((s) => (
                  <div className="fav-card" key={s.store_id}>
                    <img
                      src={s.image ? `${IMAGE_BASE_URL}/${s.image}` : "/Nailshop/placeholder.jpg"}
                      alt={s.store_name}
                      onError={(e) => {
                        e.currentTarget.src = "/Nailshop/placeholder.jpg";
                      }}
                    />
                    <div className="fav-info">
                      <h4>{s.store_name}</h4>
                      <span>฿{Number(s.price).toLocaleString()}</span>
                      <button
                        className="fav-book-btn"
                        onClick={() => navigate(`/store2/${s.store_id}`)}
                      >
                        จองเลย
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>ยังไม่มีร้านโปรด เริ่มบันทึกร้านที่คุณชอบได้เลย</p>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Edit Modal */}
      {editModal.open && (
        <div className="atelier-modal-overlay" onClick={() => setEditModal({ open: false })}>
          <div className="atelier-modal" onClick={e => e.stopPropagation()}>
            <h3>อัปเดต {editModal.label}</h3>
            <p className="modal-subtitle">กรอกรายละเอียดใหม่ของคุณด้านล่าง</p>
            <input
              autoFocus
              className="atelier-input"
              value={editModal.value}
              onChange={e => setEditModal({ ...editModal, value: e.target.value })}
            />
            <div className="modal-actions">
              <button className="btn-atelier-primary" onClick={confirmEdit}>บันทึกการเปลี่ยนแปลง</button>
              <button className="btn-atelier-link" onClick={() => setEditModal({ open: false })}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBookingId && (
        <BookingDetailModal
          booking={{ booking_id: selectedBookingId }}
          onClose={() => setSelectedBookingId(null)}
          onChanged={reloadBookings}
        />
      )}
    </div>
  );
}
