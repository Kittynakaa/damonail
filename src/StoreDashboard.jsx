import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from "recharts";
import { FiDownload } from "react-icons/fi";
import "./StoreDashboard.css";
import { useParams } from "react-router-dom";
import { getStoreBookings, getAlerts, getAffectedBookingsForStore } from "./callapi/call_api_booking.jsx";
import { getTopServices, getMonthlyIncomeByYear, getTopServicess } from "./callapi/call_api_service.jsx";
import { getReviewsByStore } from "./callapi/call_api_store2.jsx";
import { getEmployeeStatusToday } from "./callapi/call_api_employee.jsx";


export default function StoreDashboard() {

  const { storeId } = useParams();
  console.log("Store ID:", storeId);
  const [bookings, setBookings] = useState([]);
  const [bookingPage, setBookingPage] = useState(1);
  const bookingsPerPage = 7;
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    if (!storeId) return;

    const fetchBookings = async () => {
      try {
        const data = await getStoreBookings(storeId);
        console.log("Store bookings:", data);
        setBookings(data);
        setBookingPage(1);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };

    fetchBookings();
  }, [storeId]);

  useEffect(() => {
    if (!storeId) return;

    const fetchReviews = async () => {
      try {
        const data = await getReviewsByStore(storeId);
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviews([]);
      }
    };

    fetchReviews();
  }, [storeId]);

  const [topServices, setTopServices] = useState([]);
  useEffect(() => {
    if (!storeId) return;

    const fetchTopServices = async () => {
      try {
        const data = await getTopServices(storeId);
        setTopServices(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTopServices();
  }, [storeId]);

  const [employeeStatus, setEmployeeStatus] = useState([]);
  useEffect(() => {
    if (!storeId) return;

    const fetchEmployeeStatus = async () => {
      try {
        const data = await getEmployeeStatusToday(storeId);
        setEmployeeStatus(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching employee status:", err);
        setEmployeeStatus([]);
      }
    };

    fetchEmployeeStatus();
  }, [storeId]);

  const [affectedToday, setAffectedToday] = useState({ affected_count: 0, affected_bookings: [] });
  useEffect(() => {
    if (!storeId) return;

    const fetchAffected = async () => {
      try {
        const data = await getAffectedBookingsForStore(storeId);
        setAffectedToday(data);
      } catch (err) {
        console.error("Error fetching affected bookings:", err);
      }
    };

    fetchAffected();
  }, [storeId]);

  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    if (!storeId) return;
  
    const fetchAlerts = async () => {
      try {
        const data = await getAlerts(storeId);
  
        const formatted = data.map(item => ({
          text: `มีการจองใหม่จาก ${item.customer_name}`,
          time: formatTimeAgo(item.created_at)
        }));
  
        setAlerts(formatted);
  
      } catch (err) {
        console.error(err);
      }
    };
    function formatTimeAgo(dateString) {
      const now = new Date();
      const past = new Date(dateString);
      const diff = Math.floor((now - past) / 1000);
    
      if (diff < 60) return "เมื่อสักครู่";
      if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
      return `${Math.floor(diff / 86400)} วันที่แล้ว`;
    }
  
    fetchAlerts();
  }, [storeId]);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [incomeTrend, setIncomeTrend] = useState([]);
  // Data สำหรับ Report (สมมติเพื่อใช้กับ Recharts)
  useEffect(() => {
    if (!storeId) return;

    const fetchIncome = async () => {
      try {
        const data = await getMonthlyIncomeByYear(storeId, selectedYear);

        const thaiMonths = [
          "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
          "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
        ];

        // เติม 12 เดือนให้ครบ
        const fullYear = Array.from({ length: 12 }, (_, i) => {
          const found = data.find(d => d.month_number === i + 1);
          return {
            month: thaiMonths[i],
            income: found ? Number(found.income) : 0
          };
        });

        setIncomeTrend(fullYear);

      } catch (err) {
        console.error(err);
      }
    };

    fetchIncome();
  }, [storeId, selectedYear]);

  const [topServicess, setTopServicess] = useState([]);
  useEffect(() => {
    if (!storeId) return;
  
    const fetchTopServicess = async () => {
      try {
        const data = await getTopServicess(storeId);
  
        // แปลง format ให้ตรงกับ BarChart
        const formatted = data.map(item => ({
          name: item.service_name,
          value: Number(item.total_sales)
        }));
  
        setTopServicess(formatted);
  
      } catch (err) {
        console.error("Top services error:", err);
      }
    };
  
    fetchTopServicess();
  }, [storeId]);

  const totalBookingPages = Math.max(1, Math.ceil(bookings.length / bookingsPerPage));
  const visibleBookings = bookings.slice(
    (bookingPage - 1) * bookingsPerPage,
    bookingPage * bookingsPerPage
  );

  const parseDMY = (value) => {
    if (!value) return null;
    const [day, month, year] = String(value).split("/").map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  };

  const today = new Date();
  const isSameDay = (date) =>
    date &&
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday = (date) => {
    if (!date) return false;
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  };

  const isCurrentMonth = (date) =>
    date &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isPreviousMonth = (date) => {
    if (!date) return false;
    const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return (
      date.getMonth() === previousMonthDate.getMonth() &&
      date.getFullYear() === previousMonthDate.getFullYear()
    );
  };

  const bookingsToday = bookings.filter((booking) => isSameDay(parseDMY(booking.booking_date)));
  const bookingsYesterday = bookings.filter((booking) => isYesterday(parseDMY(booking.booking_date)));
  const todayRevenue = bookingsToday.reduce((sum, booking) => sum + Number(booking.total_price || 0), 0);
  const yesterdayRevenue = bookingsYesterday.reduce((sum, booking) => sum + Number(booking.total_price || 0), 0);

  const currentMonthBookings = bookings.filter((booking) => isCurrentMonth(parseDMY(booking.booking_date)));
  const previousMonthBookings = bookings.filter((booking) => isPreviousMonth(parseDMY(booking.booking_date)));

  const currentMonthCustomers = new Set(
    currentMonthBookings.map((booking) => booking.user_id || booking.customer_name).filter(Boolean)
  ).size;
  const previousMonthCustomers = new Set(
    previousMonthBookings.map((booking) => booking.user_id || booking.customer_name).filter(Boolean)
  ).size;

  const reviewAverage = reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  const employeeCounts = {
    total: employeeStatus.length,
    available: employeeStatus.filter((e) => e.current_status_id === 1).length,
    working: employeeStatus.filter((e) => e.current_status_id === 2).length,
    onBreak: employeeStatus.filter((e) => e.current_status_id === 3).length,
    leave: employeeStatus.filter((e) => e.on_leave_today).length,
    absent: employeeStatus.filter((e) => e.on_absent_today).length,
  };

  const formatDelta = (current, previous) => {
    if (previous <= 0) {
      return current > 0 ? "+100%" : "0%";
    }
    return `${current >= previous ? "+" : ""}${Math.round(((current - previous) / previous) * 100)}%`;
  };
   
  return (
    <section className="report-page">
      <div className="report">
        {/* ===== ส่วนที่ 1: Header รายงานร้าน ===== */}
        <div className="header">
          <div>
            <h1>รายงานร้าน & แดชบอร์ด</h1>
            <p className="subtitle">สรุปภาพรวมและข้อมูลสถิติวันนี้</p>
          </div>
          <div className="actions">
            <select>
              <option>รายเดือน</option>
              <option>รายไตรมาส</option>
              <option>รายปี</option>
            </select>
            <button className="btn-export"><FiDownload /> Excel</button>
            <button className="btn-export"><FiDownload /> PDF</button>
          </div>
        </div>

        {/* ===== Alert: คิวที่ได้รับผลกระทบจากพนักงานไม่มาทำงาน ===== */}
        {affectedToday.affected_count > 0 && (
          <div
            className="card"
            style={{
              background: "#fff4e5",
              border: "1px solid #ffcf8f",
              color: "#a86500",
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            ⚠️ มี {affectedToday.affected_count} คิวได้รับผลกระทบจากพนักงานไม่มาทำงาน
            {" "}(ไปที่ "ตารางพนักงาน" เพื่อจัดการ)
          </div>
        )}

        {/* ===== สถานะพนักงานวันนี้ ===== */}
        <div className="stats-grid">
          <div className="card">
            <p className="label">พนักงานทั้งหมด</p>
            <h2>{employeeCounts.total}</h2>
          </div>
          <div className="card">
            <p className="label">พร้อมให้บริการ</p>
            <h2>{employeeCounts.available}</h2>
          </div>
          <div className="card">
            <p className="label">กำลังทำงาน</p>
            <h2>{employeeCounts.working}</h2>
          </div>
          <div className="card">
            <p className="label">พัก</p>
            <h2>{employeeCounts.onBreak}</h2>
          </div>
          <div className="card">
            <p className="label">ลา</p>
            <h2>{employeeCounts.leave}</h2>
          </div>
          <div className="card">
            <p className="label">ไม่มาทำงานวันนี้</p>
            <h2>{employeeCounts.absent}</h2>
          </div>
        </div>

        <div className="stats-grid">
          <div className="card">
            <p className="label">คิวทั้งหมดวันนี้</p>
            <h2>{bookingsToday.length}</h2>
          </div>
          <div className="card">
            <p className="label">คิวที่ได้รับผลกระทบ</p>
            <h2>{affectedToday.affected_count}</h2>
          </div>
          <div className="card">
            <p className="label">คิวที่รอเปลี่ยนช่าง</p>
            <h2>{affectedToday.affected_count}</h2>
          </div>
        </div>

        {/* ===== ส่วนที่ 2: Stats Cards (จาก Dashboard) ===== */}
        <div className="stats-grid">
          <div className="card">
            <p className="label">ยอดจองวันนี้</p>
            <h2>{bookingsToday.length}</h2>
            <span className="trend up">↑ {formatDelta(bookingsToday.length, bookingsYesterday.length)} จากเมื่อวาน</span>
          </div>
          <div className="card">
            <p className="label">รายได้วันนี้</p>
            <h2>฿{todayRevenue.toLocaleString()}</h2>
            <span className="trend up">↑ {formatDelta(todayRevenue, yesterdayRevenue)} จากเมื่อวาน</span>
          </div>
          <div className="card">
            <p className="label">รีวิวเฉลี่ย</p>
            <h2>{reviewAverage}</h2>
            <span>จาก {reviews.length} รีวิว</span>
          </div>
          <div className="card">
            <p className="label">ลูกค้าใหม่เดือนนี้</p>
            <h2>{currentMonthCustomers}</h2>
            <span className="trend up">↑ {formatDelta(currentMonthCustomers, previousMonthCustomers)} จากเดือนที่แล้ว</span>
          </div>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {[0, 1, 2].map(i => {
            const year = currentYear - i;
            return (
              <option key={year} value={year}>
                {year + 543}
              </option>
            );
          })}
        </select>
        {/* ===== ส่วนที่ 3: กราฟรายได้ (จาก Report) ===== */}
        <section className="chart-section card">
          <h3>รายได้รายเดือน</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={incomeTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#ff6b98" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ===== ส่วนที่ 4: Grid ตาราง (รวมของเดิม) ===== */}
        <div className="grid-2">
          {/* บริการยอดนิยม (Bar Chart) */}
          <div className="card full">
            <h3>บริการยอดนิยม (Top 5 Services)</h3>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topServicess}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ff6b98" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* การจองล่าสุด */}
          <div className="card recent-bookings-card">
            <div className="recent-bookings-head">
              <h3>การจองล่าสุด</h3>
              {bookings.length > bookingsPerPage && (
                <div className="mini-pagination">
                  <button
                    className="mini-page-btn"
                    disabled={bookingPage === 1}
                    onClick={() => setBookingPage((prev) => Math.max(prev - 1, 1))}
                  >
                    ก่อนหน้า
                  </button>
                  <span className="mini-page-info">
                    หน้า {bookingPage}/{totalBookingPages}
                  </span>
                  <button
                    className="mini-page-btn"
                    disabled={bookingPage === totalBookingPages}
                    onClick={() => setBookingPage((prev) => Math.min(prev + 1, totalBookingPages))}
                  >
                    ถัดไป
                  </button>
                </div>
              )}
            </div>
            <table className="booking-table">
              <thead>
                <tr>
                  <th>ชื่อ</th>
                  <th>เวลา</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {visibleBookings.map((b, i) => (
                  <tr key={i}>
                    <td>{b.customer_name}</td>
                    <td>{b.booking_time}</td>
                    <td>
                      <span
                        className={`status ${b.status_booking_name === "ยืนยันแล้ว"
                          ? "confirmed"
                          : b.status_booking_name === "รอยืนยัน"
                            ? "pending"
                            : "done"
                          }`}
                      >
                        {b.status_booking_name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visibleBookings.length && (
              <div className="empty-bookings">ยังไม่มีรายการจองล่าสุด</div>
            )}
          </div>
        </div>

        {/* ===== ส่วนที่ 5: ตารางบริการ + พนักงาน (จาก Report) ===== */}
        <div className="table-row">
          <div className="table-card card">
            <h3>บริการที่ขายดี</h3>

            <table>
              <thead>
                <tr>
                  <th>บริการ</th>
                  <th>ยอดขาย</th>
                  <th>รายได้</th>
                </tr>
              </thead>

              <tbody>
                {topServices.map((s, i) => (
                  <tr key={i}>
                    <td>{s.service_name}</td>
                    <td>{s.total_sales}</td>
                    <td>฿{Number(s.total_revenue).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-card card">
            <h3>พนักงานที่มียอดจองสูงสุด</h3>
            <table>
              <thead>
                <tr><th>พนักงาน</th><th>การจอง</th><th>คะแนน</th></tr>
              </thead>
              <tbody>
                <tr><td>วิภา ศิริมิช่วย</td><td>85</td><td>⭐ 4.9</td></tr>
                <tr><td>สุชา เส้นสวย</td><td>78</td><td>⭐ 4.8</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== ส่วนที่ 6: การแจ้งเตือน ===== */}
        <div className="card alerts">
          <h3>การแจ้งเตือนจากระบบ</h3>
          <ul>
            {alerts.map((a, i) => (
              <li key={i}>
                <p>{a.text}</p>
                <span>{a.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Padding ท้ายหน้าเพื่อให้ Scroll พ้นขอบ */}
        <div style={{ height: "50px" }}></div>
      </div>
    </section>
  );
}
