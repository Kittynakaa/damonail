import "./Footer.css";
import { Link } from "react-router-dom"; // เพิ่ม Link
import { FaInstagram, FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-grid">

          {/* ส่วนซ้าย: Stay Up To Date (เหมือนเดิม) */}
          <div className="footer-col footer-newsletter">
            <h3>อัปเดตข่าวสารล่าสุด</h3>
            <p>รวมไอเดียดูแลเล็บ เทรนด์สีเล็บ และโปรโมชั่นใหม่ๆ เพื่อให้คุณสวยมั่นใจทุกวัน</p>
            <div className="email-input-group">
              <input type="email" placeholder="อีเมล" aria-label="อีเมลสำหรับรับข่าวสาร" />
              <button className="btn-subscribe">ติดตาม</button>
            </div>
          </div>

          {/* --- ส่วนกลาง: เปลี่ยนจากตัว F เป็น Logo รูปภาพ --- */}
          <div className="footer-col footer-branding">
            <div className="logo-wrapper">
              <Link to="/" className="logo">
                {/* ลบ height={40} ออก เพื่อให้ CSS เป็นตัวคุมความสวยงาม */}
                <picture>
                  <source srcSet="/Logo/logoweb.webp" type="image/webp" />
                  <img src="/Logo/logoweb-sm.png" alt="Crystal Shine" className="logo-img" width={221} height={240} loading="lazy" decoding="async" />
                </picture>
              </Link>
            </div>
            <p className="tagline">
              สวยในสไตล์ของคุณ <br />
              เพราะคุณควรได้รับสิ่งที่ดีที่สุด
            </p>
            <div className="social-links">
              {/* ใส่ URL ใน href และใช้ Icon เป็นตัวแสดงผลข้างใน */}
              <a
                href="https://www.instagram.com/p4ngniiq?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>

              <a href="https://www.facebook.com/pxnghyun" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>

              <a href="https://twitter.com/youraccount" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>

              <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          {/* ส่วนขวา: Navigate (เหมือนเดิม) */}
          <div className="footer-col footer-nav">
            <div className="nav-header">
              <h3>เมนู</h3>
              <div className="nav-line"></div>
            </div>
            <div className="nav-links-grid">
              <div className="nav-item"><a href="#">หน้าหลัก</a></div>
              <Link to="/helpCenter">ติดต่อ</Link>
              <div className="nav-item"><a href="#">บริการ</a></div>
              <Link to="/aboutGlamNail">เกี่ยวกับเรา</Link>
              <div className="nav-item"><a href="#">คำถามที่พบบ่อย</a></div>
              <div className="nav-item"><a href="#">นโยบายความเป็นส่วนตัว</a></div>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© สงวนลิขสิทธิ์ {new Date().getFullYear()} | ALL RIGHTS RESERVED | NAILS BY CRYSTAL SHINE</p>
        </div>
      </div>

      <button className="scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        บนสุด <span>↑</span>
      </button>
    </footer>
  );
}
