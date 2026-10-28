import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { API_BASE_URL, GetLogin, ForgotPassword, ResetPassword } from "./callapi/call_api_Register.jsx";
import { RegisterUser } from "./callapi/call_api_Register";
import { GoogleLogin } from "@react-oauth/google";
import "./Register.css";
import PageHero from "./components/PageHero";



export default function Register() {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setTimeout(() => AOS.refresh(), 100);
  };

  // ---------------- LOGIN ----------------
  const [loginForm, setLoginForm] = useState({
    id: "",
    pw: "",
    remember: false,
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!loginForm.id || !loginForm.pw) {
      return Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: "กรุณากรอกข้อมูลให้ครบถ้วน",
      });
    }

    try {
      const res = await GetLogin(loginForm.id, loginForm.pw);

      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("token", res.token);

      await Swal.fire({
        title: "ยินดีต้อนรับกลับมา",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      // ช่างที่มีบัญชีเข้าสู่ระบบ -> พาไปหน้า "ตารางงานของฉัน" โดยตรง
      // ผู้ดูแลระบบ -> พาไปหน้าแอดมินโดยตรง
      if (res.user.role_id === 3 && res.user.employee_id) {
        navigate("/MySchedule");
      } else if (res.user.role_id === 4) {
        navigate("/SysAdmin");
      } else {
        navigate("/home2");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: err,
      });
    }
  };

  // ---------------- ลืมรหัสผ่าน (Forgot Password) ----------------
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState("request"); // "request" | "reset"
  const [forgotEmail, setForgotEmail] = useState("");
  const [devResetCode, setDevResetCode] = useState("");
  const [resetForm, setResetForm] = useState({ code: "", newPw: "", confirmPw: "" });
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const openForgotPassword = () => {
    setForgotEmail(loginForm.id || "");
    setForgotStep("request");
    setDevResetCode("");
    setResetForm({ code: "", newPw: "", confirmPw: "" });
    setForgotMode(true);
  };

  const closeForgotPassword = () => {
    setForgotMode(false);
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      return Swal.fire({ icon: "error", title: "กรุณากรอกอีเมลหรือเบอร์โทรศัพท์" });
    }

    setForgotSubmitting(true);
    try {
      const res = await ForgotPassword(forgotEmail);
      setDevResetCode(res.reset_code);
      setResetForm((prev) => ({ ...prev, code: res.reset_code }));
      setForgotStep("reset");
    } catch (err) {
      Swal.fire({ icon: "error", title: "ไม่สำเร็จ", text: err });
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (!resetForm.code || !resetForm.newPw) {
      return Swal.fire({ icon: "error", title: "กรุณากรอกรหัสรีเซ็ตและรหัสผ่านใหม่" });
    }
    if (resetForm.newPw.length < 6) {
      return Swal.fire({ icon: "error", title: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" });
    }
    if (resetForm.newPw !== resetForm.confirmPw) {
      return Swal.fire({ icon: "error", title: "รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน" });
    }

    setForgotSubmitting(true);
    try {
      await ResetPassword(resetForm.code, resetForm.newPw);
      await Swal.fire({
        icon: "success",
        title: "ตั้งรหัสผ่านใหม่สำเร็จ",
        text: "กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่",
        timer: 2000,
        showConfirmButton: false,
      });
      setLoginForm({ id: forgotEmail, pw: "", remember: false });
      setForgotMode(false);
    } catch (err) {
      Swal.fire({ icon: "error", title: "ไม่สำเร็จ", text: err });
    } finally {
      setForgotSubmitting(false);
    }
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${API_BASE_URL}/login_google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.message || "เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
  
      // ✅ เก็บ user จาก backend
      localStorage.setItem("user", JSON.stringify(data.user));
  
      Swal.fire({
        title: "เข้าสู่ระบบสำเร็จ",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
  
      navigate("/home2");
  
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบด้วย Google ไม่สำเร็จ",
        text: error.message || "ไม่สามารถเข้าสู่ระบบด้วย Google ได้",
      });
    }
  };
  
  const handleGoogleError = () => {
    Swal.fire({
      icon: "error",
      title: "Google Login Failed",
    });
  };

  // ---------------- REGISTER ----------------
  const [regForm, setRegForm] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
    accept: false,
  });

  const [regMessage, setRegMessage] = useState("");

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (regForm.password !== regForm.confirm) {
      return setRegMessage("รหัสผ่านไม่ตรงกัน");
    }

    const userData = {
      username: `${regForm.firstname} ${regForm.lastname}`,
      nickname: regForm.firstname,
      phone: regForm.phone,
      email: regForm.email,
      password: regForm.password,
      role_id: 1,
    };

    try {
      const response = await RegisterUser(userData);

      if (response.success) {
        Swal.fire({
          title: "สำเร็จ",
          text: "ยินดีต้อนรับสู่ครอบครัวของเรา!",
          icon: "success",
        });
        switchTab("login");
      }
    } catch (error) {
      setRegMessage(error.response?.data?.message || "สมัครสมาชิกไม่สำเร็จ");
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="ag-root register-page">
      <main className="reg-main">
        <div className="reg-grid">

          {/* LEFT */}
          <div className="reg-image-side" data-aos="fade-right">
            <div className="editorial-img-box">
              <img
                src="https://i.pinimg.com/1200x/b8/0d/ea/b80dea9c706baf8c5783cccd24cd4fe6.jpg"
                alt="Fashion"
              />
              <div className="img-overlay">
                <p className="playfair-title">Crystal Shine</p>
                <span>ค้นพบเล็บที่ใช่สำหรับคุณ</span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="reg-form-side" data-aos="fade-left">
            <PageHero compact eyebrow="สมาชิก" title="บัญชีของฉัน" />

            {/* Tabs */}
            <div className="reg-tabs-luxury">
              <button
                className={activeTab === "login" ? "active" : ""}
                onClick={() => switchTab("login")}
              >
                เข้าสู่ระบบ
              </button>
              <button
                className={activeTab === "register" ? "active" : ""}
                onClick={() => switchTab("register")}
              >
                สมัครสมาชิก
              </button>
            </div>

            <div className="form-content-box">
              {activeTab === "login" && forgotMode ? (
                forgotStep === "request" ? (
                  <form onSubmit={handleForgotRequest} data-aos="fade-in">
                    <p className="reg-forgot-desc">
                      กรอกอีเมลหรือเบอร์โทรศัพท์ที่ใช้สมัครสมาชิก เพื่อขอรหัสรีเซ็ตรหัสผ่าน
                    </p>

                    <div className="reg-input-group">
                      <label>อีเมลหรือเบอร์โทรศัพท์</label>
                      <input
                        type="text"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                      />
                    </div>

                    <button className="btn-black-thin full-btn" type="submit" disabled={forgotSubmitting}>
                      {forgotSubmitting ? "กำลังส่งคำขอ..." : "ขอรหัสรีเซ็ตรหัสผ่าน"}
                    </button>

                    <button type="button" className="reg-link-btn reg-back-link" onClick={closeForgotPassword}>
                      ← กลับไปเข้าสู่ระบบ
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetSubmit} data-aos="fade-in">
                    <p className="reg-forgot-desc reg-dev-mode-notice">
                     เว็บนี้ยังไม่มีระบบส่งอีเมลจริง รหัสรีเซ็ตของคุณคือ{" "}
                      <strong>{devResetCode}</strong> (หมดอายุใน 15 นาที)
                    </p>

                    <div className="reg-input-group">
                      <label>รหัสรีเซ็ต</label>
                      <input
                        type="text"
                        value={resetForm.code}
                        onChange={(e) => setResetForm({ ...resetForm, code: e.target.value })}
                      />
                    </div>

                    <div className="reg-input-group">
                      <label>รหัสผ่านใหม่</label>
                      <input
                        type="password"
                        value={resetForm.newPw}
                        onChange={(e) => setResetForm({ ...resetForm, newPw: e.target.value })}
                      />
                    </div>

                    <div className="reg-input-group">
                      <label>ยืนยันรหัสผ่านใหม่</label>
                      <input
                        type="password"
                        value={resetForm.confirmPw}
                        onChange={(e) => setResetForm({ ...resetForm, confirmPw: e.target.value })}
                      />
                    </div>

                    <button className="btn-black-thin full-btn" type="submit" disabled={forgotSubmitting}>
                      {forgotSubmitting ? "กำลังตั้งรหัสผ่านใหม่..." : "ตั้งรหัสผ่านใหม่"}
                    </button>

                    <button type="button" className="reg-link-btn reg-back-link" onClick={closeForgotPassword}>
                      ← กลับไปเข้าสู่ระบบ
                    </button>
                  </form>
                )
              ) : activeTab === "login" ? (
                <form onSubmit={handleLoginSubmit} data-aos="fade-in">

                  <div className="reg-input-group">
                    <label>อีเมลหรือเบอร์โทรศัพท์</label>
                    <input
                      type="text"
                      value={loginForm.id}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, id: e.target.value })
                      }
                    />
                  </div>

                  <div className="reg-input-group">
                    <label>รหัสผ่าน</label>
                    <input
                      type="password"
                      value={loginForm.pw}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, pw: e.target.value })
                      }
                    />
                  </div>

                  <button type="button" className="reg-link-btn reg-forgot-link" onClick={openForgotPassword}>
                    ลืมรหัสผ่าน?
                  </button>

                  <button className="btn-black-thin full-btn" type="submit">
                    เข้าสู่ระบบ
                  </button>

                  {/* 🔥 GOOGLE LOGIN */}
                  <div style={{ marginTop: "15px", textAlign: "center" }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                    />
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} data-aos="fade-in">

                  <div className="editorial-form-grid">
                    <div className="reg-input-group">
                      <label>ชื่อ</label>
                      <input
                        type="text"
                        onChange={(e) =>
                          setRegForm({ ...regForm, firstname: e.target.value })
                        }
                      />
                    </div>

                    <div className="reg-input-group">
                      <label>นามสกุล</label>
                      <input
                        type="text"
                        onChange={(e) =>
                          setRegForm({ ...regForm, lastname: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="reg-input-group">
                    <label>อีเมล</label>
                    <input
                      type="email"
                      onChange={(e) =>
                        setRegForm({ ...regForm, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="reg-input-group">
                    <label>เบอร์โทรศัพท์</label>
                    <input
                      type="text"
                      onChange={(e) =>
                        setRegForm({ ...regForm, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="editorial-form-grid">
                    <div className="reg-input-group">
                      <label>รหัสผ่าน</label>
                      <input
                        type="password"
                        onChange={(e) =>
                          setRegForm({ ...regForm, password: e.target.value })
                        }
                      />
                    </div>

                    <div className="reg-input-group">
                      <label>ยืนยันรหัสผ่าน</label>
                      <input
                        type="password"
                        onChange={(e) =>
                          setRegForm({ ...regForm, confirm: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <button className="btn-black-thin full-btn" type="submit">
                    สมัครสมาชิกตอนนี้
                  </button>

                  {regMessage && <p className="reg-error">{regMessage}</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
