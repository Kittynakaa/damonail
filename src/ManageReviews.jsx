import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { FiMessageSquare } from "react-icons/fi";
import { FaThumbtack } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { useParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import "./ManageReviews.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ManageReviews() {
  const { storeId } = useParams();
  const [replying, setReplying] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      if (!storeId) {
        setReviews([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`http://localhost:5010/review/store/${storeId}`);
        setReviews(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("โหลดรีวิวผิดพลาด", err);
        setError("ไม่สามารถโหลดข้อมูลรีวิวได้");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [storeId]);

  const average = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return total / reviews.length;
  }, [reviews]);

  const chartData = useMemo(() => {
    const monthMap = new Map();

    reviews.forEach((review) => {
      if (!review.created_at) return;
      const date = new Date(review.created_at);
      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString("th-TH", { month: "short" });
      const current = monthMap.get(key) || { label, total: 0, count: 0, time: date.getTime() };
      current.total += Number(review.rating || 0);
      current.count += 1;
      monthMap.set(key, current);
    });

    const ordered = Array.from(monthMap.values()).sort((a, b) => a.time - b.time).slice(-6);

    return {
      labels: ordered.map((item) => item.label),
      datasets: [
        {
          label: "คะแนนเฉลี่ย",
          data: ordered.map((item) => Number((item.total / item.count).toFixed(2))),
          fill: false,
          borderColor: "#ff6b98",
          backgroundColor: "#ff6b9833",
          tension: 0.3,
        },
      ],
    };
  }, [reviews]);

  const formattedReviews = reviews.map((review, index) => {
    const parsedDate = review.created_at ? new Date(review.created_at) : null;

    return {
      id: review.review_id || index,
      name: review.customer_name || `User #${review.user_id}`,
      date: parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toLocaleDateString("th-TH")
        : "-",
      rating: Number(review.rating || 0),
      text: review.comment || "-",
      pinned: index === 0,
    };
  });

  const handleSendReply = () => {
    alert("ส่งคำตอบกลับเรียบร้อย!");
    setReplying(null);
    setReplyText("");
  };

  return (
      <section className="manage manage-reviews-page">
        {/* ===== ส่วนหัว ===== */}
        <div className="header">
          <div>
            <h1>รีวิวและฟีดแบ็ก</h1>
            <p>ดูและตอบกลับรีวิวจากลูกค้า</p>
          </div>
        </div>

        {/* ===== สรุปคะแนนรีวิว ===== */}
        <div className="review-summary">
          <div className="card avg-card">
            <h3>⭐ คะแนนรีวิวเฉลี่ย</h3>
            <p className="avg-score">
              <span className="score">{average ? average.toFixed(1) : "0.0"}</span> / 5.0
            </p>
            <p className="small">จาก {formattedReviews.length} รีวิว</p>
            <p className="up">{formattedReviews.length ? "อ้างอิงจากข้อมูลรีวิวของร้านนี้" : "ยังไม่มีรีวิวของร้านนี้"}</p>
          </div>
          <div className="card chart-card">
            <h3>แนวโน้มคะแนนรีวิว</h3>
            {chartData.labels.length ? (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { min: 0, max: 5 } },
                }}
              />
            ) : (
              <div className="empty-chart">ยังไม่มีข้อมูลเพียงพอสำหรับสร้างกราฟ</div>
            )}
          </div>
        </div>

        {/* ===== ตารางรีวิวทั้งหมด ===== */}
        <div className="service-card">
          <h3>รีวิวทั้งหมด</h3>
          {loading ? (
            <div className="empty-state">กำลังโหลดรีวิว...</div>
          ) : error ? (
            <div className="empty-state">{error}</div>
          ) : !formattedReviews.length ? (
            <div className="empty-state">ยังไม่มีรีวิวสำหรับร้านนี้</div>
          ) : (
            <table className="service-table">
              <thead>
                <tr>
                  <th>ชื่อลูกค้า</th>
                  <th>วันที่</th>
                  <th>คะแนน</th>
                  <th>ข้อความรีวิว</th>
                  <th>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {formattedReviews.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.name} {r.pinned && <span className="pin">📌</span>}
                    </td>
                    <td>{r.date}</td>
                    <td>{"⭐".repeat(r.rating)}{"☆".repeat(Math.max(5 - r.rating, 0))}</td>
                    <td>{r.text}</td>
                    <td className="action-buttons">
                      <button className="icon-btn" onClick={() => setReplying(r)}>
                        <FiMessageSquare />
                      </button>
                      <button className="icon-btn">
                        <FaThumbtack />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ===== Modal ตอบกลับรีวิว ===== */}
        {replying &&
          ReactDOM.createPortal(
            <div className="review-reply-overlay" onClick={() => setReplying(null)}>
              <div className="review-reply-modal" onClick={(e) => e.stopPropagation()}>
                <div className="review-reply-header">
                  <h3>ตอบกลับรีวิว</h3>
                  <button
                    className="review-reply-close"
                    type="button"
                    onClick={() => setReplying(null)}
                    aria-label="ปิด"
                  >
                    ×
                  </button>
                </div>

                <div className="review-reply-meta">
                  <div className="review-meta-row">
                    <span className="review-meta-label">ลูกค้า</span>
                    <span className="review-meta-value">{replying.name}</span>
                  </div>
                  <div className="review-meta-row">
                    <span className="review-meta-label">คะแนน</span>
                    <span className="review-meta-stars">{"⭐".repeat(replying.rating)}</span>
                  </div>
                  <div className="review-quote-box">
                    <span className="review-meta-label">รีวิวจากลูกค้า</span>
                    <p>{replying.text}</p>
                  </div>
                </div>

                <label className="review-reply-label">การตอบกลับของคุณ</label>
                <textarea
                  className="review-reply-textarea"
                  placeholder="พิมพ์คำตอบของคุณที่นี่..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                ></textarea>

                <div className="review-reply-actions">
                  <button className="review-reply-cancel" onClick={() => setReplying(null)}>
                    ยกเลิก
                  </button>
                  <button className="review-reply-submit" onClick={handleSendReply}>
                    ส่งคำตอบ
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
      </section>
  );
}
