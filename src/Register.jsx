import React, { useState } from "react";
import Swal from "sweetalert2";   // ✅ import SweetAlert2
import { useNavigate } from "react-router-dom";  
import "./Register.css"; // ใช้ไฟล์ CSS แยก

export default function Register() {
    const [activeTab, setActiveTab] = useState("login");
  
    // ----- LOGIN -----
    const [loginForm, setLoginForm] = useState({ id: "", pw: "", remember: false });
    const [loginHint, setLoginHint] = useState({ id: "", pw: "" });
  
    // ----- REGISTER -----
    const [regForm, setRegForm] = useState({
      firstname: "", lastname: "", phone: "", email: "",
      password: "", confirm: "", accept: false,
    });
    const [regHint, setRegHint] = useState({ phone: "" });
    const [regMessage, setRegMessage] = useState("");
  
    const navigate = useNavigate();                 // ✅ เพิ่ม
    const phoneRe = /^(0[689]\d{8})$/;
  
    const handleLoginSubmit = async (e) => {
      e.preventDefault();
      const idOk = !!loginForm.id.trim();
      const pwOk = loginForm.pw.length >= 8;
  
      setLoginHint({
        id: idOk ? "" : "โปรดกรอกอีเมลหรือเบอร์โทร",
        pw: pwOk ? "" : "รหัสผ่านอย่างน้อย 8 ตัวอักษร",
      });
  
      if (idOk && pwOk) {
        // ✅ ป๊อปอัพแล้วพาไปหน้า Home2
        await Swal.fire({
          title: "ลงชื่อเข้าใช้สำเร็จ",
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
          draggable: true,
        });
        navigate("/home2");                          // ✅ เปลี่ยนเส้นทางมาที่หน้า Home2
      }
    };
  
    const handleRegisterSubmit = (e) => {
      e.preventDefault();
      setRegMessage("");
  
      if (!regForm.firstname || !regForm.lastname || !regForm.email || !regForm.password || !regForm.confirm) {
        return setRegMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      }
      if (!phoneRe.test(regForm.phone)) {
        return setRegMessage("กรุณากรอกเบอร์โทร 10 หลัก");
      }
      if (regForm.password.length < 6) {
        return setRegMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      }
      if (regForm.password !== regForm.confirm) {
        return setRegMessage("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      }
      if (!regForm.accept) {
        return setRegMessage("กรุณายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว");
      }
  
      console.log("สมัครสมาชิก payload:", regForm);
      setRegMessage("✅ สมัครสมาชิกสำเร็จ (เดโม)");
  
      Swal.fire({
        title: "สมัครสมาชิกสำเร็จ!",
        text: "ขอบคุณที่เข้าร่วมกับ NailFinder 🎉",
        icon: "success",
        confirmButtonText: "ตกลง",
        draggable: true,
      });
    };
  

  return (
    <div className="register-scope">
      <main className="main">
        <h1>บัญชี</h1>

        {/* Tabs */}
        <div className="tabs" role="tablist" aria-label="สลับแบบฟอร์ม">
          <div
            className={`tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            ลงชื่อเข้าใช้
          </div>
          <div
            className={`tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            ลงทะเบียน
          </div>
        </div>

        {/* LOGIN */}
        {activeTab === "login" && (
          <section id="panel-login">
            <p className="lead">
              ขอต้อนรับกลับสู่ NailFinder<br />
              ลงชื่อเข้าใช้ด้วยอีเมลหรือเบอร์โทรศัพท์และรหัสผ่านของคุณ
            </p>
            <form onSubmit={handleLoginSubmit} noValidate>
              <div className="field">
                <div className="label">อีเมลหรือหมายเลขโทรศัพท์</div>
                <div className="input-underline">
                  <input
                    type="text"
                    placeholder="you@example.com หรือ 08x-xxx-xxxx"
                    value={loginForm.id}
                    onChange={(e) => setLoginForm({ ...loginForm, id: e.target.value })}
                  />
                </div>
                <div className="hint">{loginHint.id}</div>
              </div>
              <div className="field">
                <div className="label">รหัสผ่าน</div>
                <div className="input-underline">
                  <input
                    type="password"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    value={loginForm.pw}
                    onChange={(e) => setLoginForm({ ...loginForm, pw: e.target.value })}
                  />
                </div>
                <div className="hint">{loginHint.pw}</div>
              </div>
              <label className="check">
                <input
                  type="checkbox"
                  checked={loginForm.remember}
                  onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                />
                โปรดจดจำฉัน (ตัวเลือก)
              </label>

              <button className="btn btn-primary" type="submit" >ลงชื่อเข้าใช้</button>
            </form>
          </section>
        )}

        {/* REGISTER */}
        {activeTab === "register" && (
          <section id="panel-register">
            <p className="lead">
              สร้างบัญชี NailFinder เพื่อจัดการการจองของคุณ และรับสิทธิพิเศษเพิ่มเติม<br />
              โปรดกรอกข้อมูลด้านล่างให้ครบถ้วน
            </p>
            <form onSubmit={handleRegisterSubmit} noValidate>
              <div className="field">
                <div className="label">ชื่อ</div>
                <div className="input-underline">
                  <input
                    type="text"
                    placeholder="กรอกชื่อจริง"
                    value={regForm.firstname}
                    onChange={(e) => setRegForm({ ...regForm, firstname: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <div className="label">นามสกุล</div>
                <div className="input-underline">
                  <input
                    type="text"
                    placeholder="กรอกนามสกุล"
                    value={regForm.lastname}
                    onChange={(e) => setRegForm({ ...regForm, lastname: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <div className="label">เบอร์โทรศัพท์</div>
                <div className="input-underline">
                  <input
                    type="tel"
                    placeholder="08x-xxx-xxxx"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  />
                </div>
                <div className="hint">{regHint.phone}</div>
              </div>
              <div className="field">
                <div className="label">อีเมล</div>
                <div className="input-underline">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <div className="label">รหัสผ่าน</div>
                <div className="input-underline">
                  <input
                    type="password"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="field">
                <div className="label">ยืนยันรหัสผ่าน</div>
                <div className="input-underline">
                  <input
                    type="password"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    value={regForm.confirm}
                    onChange={(e) => setRegForm({ ...regForm, confirm: e.target.value })}
                  />
                </div>
              </div>
              <label className="check">
                <input
                  type="checkbox"
                  checked={regForm.accept}
                  onChange={(e) => setRegForm({ ...regForm, accept: e.target.checked })}
                />
                ยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว
              </label>

              <button className="btn btn-primary" type="submit">สมัครสมาชิก</button>

              {regMessage && (
                <p className="hint" style={{ color: regMessage.startsWith("✅") ? "green" : "red" }}>
                  {regMessage}
                </p>
              )}
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
