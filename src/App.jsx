import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { RequireStoreAdmin, RequireEmployee, RequireSystemAdmin } from "./components/RequireRole";
import Home from "./Home.jsx";
import "./App.css";

// ⚡ โหลดแบบ Lazy (code-splitting ต่อหน้า) เพื่อให้หน้าแรกไม่ต้องดาวน์โหลดโค้ด
// ของทุกหน้าในเว็บทีเดียว -- ช่วยลดขนาด JS bundle แรกเข้าและเพิ่มคะแนน Performance
// โดยไม่กระทบ UI ใดๆ (โหลดเนื้อหาเดิมทุกอย่างเหมือนเดิม แค่แบ่งไฟล์ตอน build)
const AllStores = lazy(() => import("./AllStores"));
const Store2 = lazy(() => import("./Store2"));
const Booking = lazy(() => import("./Booking"));
const Register = lazy(() => import("./Register"));
const Home2 = lazy(() => import("./Home2"));
const Analyze = lazy(() => import("./Analyze"));
const HelpCenter = lazy(() => import("./HelpCenter"));
const ArticleAcrylic = lazy(() => import("./ArticleAcrylic"));
const AboutGlamNail = lazy(() => import("./AboutGlamNail"));
const Articles = lazy(() => import("./Articles"));
const AddStore = lazy(() => import("./AddStore"));
const UserProfile = lazy(() => import("./UserProfile"));

// 🧩 Layout และหน้าแอดมิน
const Navadmin = lazy(() => import("./adminstore/navadmin"));
const StoreDashboard = lazy(() => import("./StoreDashboard"));
const ManageServices = lazy(() => import("./ManageServices"));
const ManageSchedule = lazy(() => import("./ManageSchedule"));
const ManageEmployees = lazy(() => import("./ManageEmployees"));
const ManageBookings = lazy(() => import("./ManageBookings"));
const ManagePayroll = lazy(() => import("./ManagePayroll"));
const ManageReviews = lazy(() => import("./ManageReviews"));
const ManageGallery = lazy(() => import("./ManageGallery"));
const ManageInventory = lazy(() => import("./ManageInventory"));
const ManagePromotions = lazy(() => import("./ManagePromotions"));
const StoreReport = lazy(() => import("./StoreReport"));
const StoreSettings = lazy(() => import("./StoreSettings"));

// 🔒 หน้าฝั่งพนักงาน (ต้อง login เป็นช่างเท่านั้น)
const StaffLayout = lazy(() => import("./staff/StaffLayout"));
const StaffDashboard = lazy(() => import("./staff/StaffDashboard"));
const StaffBookings = lazy(() => import("./staff/StaffBookings"));
const StaffLeave = lazy(() => import("./staff/StaffLeave"));
const StaffSchedule = lazy(() => import("./staff/StaffSchedule"));
const StaffPayroll = lazy(() => import("./staff/StaffPayroll"));

// 🔒 หน้าฝั่งผู้ดูแลระบบ (role_id=4 เท่านั้น)
const SysAdminLayout = lazy(() => import("./sysadmin/SysAdminLayout"));
const SysAdminDashboard = lazy(() => import("./sysadmin/SysAdminDashboard"));
const SysAdminPromotions = lazy(() => import("./sysadmin/SysAdminPromotions"));
const SysAdminStores = lazy(() => import("./sysadmin/SysAdminStores"));
const SysAdminUsers = lazy(() => import("./sysadmin/SysAdminUsers"));
const SysAdminCustomerProfile = lazy(() => import("./sysadmin/SysAdminCustomerProfile"));
const SysAdminActivity = lazy(() => import("./sysadmin/SysAdminActivity"));
const SysAdminPermissions = lazy(() => import("./sysadmin/SysAdminPermissions"));
const SysAdminComplaints = lazy(() => import("./sysadmin/SysAdminComplaints"));
const SysAdminReviews = lazy(() => import("./sysadmin/SysAdminReviews"));
const SysAdminFinance = lazy(() => import("./sysadmin/SysAdminFinance"));
const SysAdminContent = lazy(() => import("./sysadmin/SysAdminContent"));


export default function App() {
  const location = useLocation();

  // ✅ หน้า “ลูกค้า” เท่านั้น ที่ต้องแสดง Navbar/Footer
  const hideNavAndFooter =
    location.pathname.startsWith("/StoreDashboard") ||
    location.pathname.startsWith("/ManageServices") ||
    location.pathname.startsWith("/ManageSchedule") ||
    location.pathname.startsWith("/ManageEmployees") ||
    location.pathname.startsWith("/ManageBookings") ||
    location.pathname.startsWith("/ManagePayroll") ||
    location.pathname.startsWith("/ManageReviews") ||
    location.pathname.startsWith("/ManageGallery") ||
    location.pathname.startsWith("/ManageInventory") ||
    location.pathname.startsWith("/ManagePromotions") ||
    location.pathname.startsWith("/StoreReport") ||
    location.pathname.startsWith("/StoreSettings") ||
    location.pathname.startsWith("/MySchedule") ||
    location.pathname.startsWith("/SysAdmin");

  return (
    <>
      {!hideNavAndFooter && <Navbar />}

      <div className="page">
        <Suspense fallback={null}>
          <Routes>
            {/* ======= หน้าเว็บลูกค้าทั่วไป ======= */}
            <Route path="/" element={<Home />} />
            <Route path="/home2" element={<Home2 />} />
            <Route path="/AllStores" element={<AllStores />} />
            <Route path="/store2/:id" element={<Store2 />} />
            <Route path="/helpCenter" element={<HelpCenter />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/articleAcrylic" element={<ArticleAcrylic />} />
            <Route path="/Articles" element={<Articles />} />
            <Route path="/aboutGlamNail" element={<AboutGlamNail />} />
            <Route path="/addStore" element={<AddStore />} />
            <Route path="/register" element={<Register />} />
            <Route path="/UserProfile" element={<UserProfile />} />

            {/* ======= กลุ่มหน้าฝั่งร้าน (มี Sidebar ของตัวเอง, เฉพาะ Admin ที่เป็นเจ้าของร้านนี้) ======= */}
            <Route element={<RequireStoreAdmin />}>
              <Route path="/StoreDashboard/:storeId" element={<Navadmin />}>
                <Route index element={<StoreDashboard />} />
                <Route path="services" element={<ManageServices />} />
                <Route path="schedule" element={<ManageSchedule />} />
                <Route path="employees" element={<ManageEmployees />} />
                <Route path="bookings" element={<ManageBookings />} />
                <Route path="payroll" element={<ManagePayroll />} />
                <Route path="reviews" element={<ManageReviews />} />
                <Route path="gallery" element={<ManageGallery />} />
                <Route path="inventory" element={<ManageInventory />} />
                <Route path="promotions" element={<ManagePromotions />} />
                <Route path="report" element={<StoreReport />} />
                <Route path="settings" element={<StoreSettings />} />
              </Route>
            </Route>

            {/* ======= หน้าฝั่งพนักงาน (เห็น/แก้ไขได้เฉพาะของตัวเองเท่านั้น) ======= */}
            <Route element={<RequireEmployee />}>
              <Route path="/MySchedule" element={<StaffLayout />}>
                <Route index element={<StaffDashboard />} />
                <Route path="bookings" element={<StaffBookings />} />
                <Route path="leave" element={<StaffLeave />} />
                <Route path="schedule" element={<StaffSchedule />} />
                <Route path="payroll" element={<StaffPayroll />} />
              </Route>
            </Route>

            {/* ======= หน้าฝั่งผู้ดูแลระบบ (เห็น/จัดการได้ทุกร้าน) ======= */}
            <Route element={<RequireSystemAdmin />}>
              <Route path="/SysAdmin" element={<SysAdminLayout />}>
                <Route index element={<SysAdminDashboard />} />
                <Route path="promotions" element={<SysAdminPromotions />} />
                <Route path="stores" element={<SysAdminStores />} />
                <Route path="users" element={<SysAdminUsers />} />
                <Route path="customer-profile" element={<SysAdminCustomerProfile />} />
                <Route path="activity" element={<SysAdminActivity />} />
                <Route path="permissions" element={<SysAdminPermissions />} />
                <Route path="complaints" element={<SysAdminComplaints />} />
                <Route path="reviews" element={<SysAdminReviews />} />
                <Route path="finance" element={<SysAdminFinance />} />
                <Route path="content" element={<SysAdminContent />} />
              </Route>
            </Route>

            <Route path="*" element={<div style={{ padding: 24 }}>404 ไม่พบหน้าที่ค้นหา</div>} />
          </Routes>
        </Suspense>
      </div>

      {!hideNavAndFooter && <Footer />}
    </>
  );
}
