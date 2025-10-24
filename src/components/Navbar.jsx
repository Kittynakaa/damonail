// Navbar.jsx
import { Link } from "react-router-dom";
import "./Navbar.css";

// 1) กรณีไฟล์อยู่ใน src/assets
// import logo from "./assets/logo.png";  // แก้ path ให้ตรงของคุณ

// 2) หรือถ้าใส่รูปไว้ใน public/ ใช้แบบนี้ (ไม่ต้อง import)
const logo = "/Logo/logoweb.png"; // แก้ชื่อไฟล์ให้ตรง เช่น /images/logo.svg

export default function Navbar() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        {/* โลโก้เป็นรูป */}
        <Link to="/" className="logo" aria-label="NailShop Home">
          <img
            src={logo}
            alt="NailShop"
            className="logo-img"
            width={470}
            height={40}
            loading="eager"
            decoding="async"
          />
          {/* ถ้าอยากโชว์ชื่อด้วย ให้เอา comment ออก */}
          {/* <span className="brand-text">NAILSHOP</span> */}
        </Link>

        <nav className="nav-links">
        <Link to="/aboutGlamNail">เกี่ยวกับเรา</Link>
          <Link to="/AllStores">ร้านทั้งหมด</Link>
          <Link to="/analyze">แนะนำสีเล็บ</Link>          
          <Link to="/articleAcrylic">บทความดูแลเล็บ</Link>
          <Link to="/helpCenter">ติดต่อเรา</Link>
        </nav>

        <li><Link to="/register">เข้าสู่ระบบ</Link></li> 
      </div>
    </header>
  );
}
