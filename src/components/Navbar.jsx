import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import "./Navbar.css";

/* ===== helpers ===== */
function getInitials(name) {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

function colorFromString(str = "user") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return `hsl(${h},70%,45%)`;
}

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [avatarOk, setAvatarOk] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  /* ===== load user ===== */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) {
        setUser(null);
        return;
      }
      const u = JSON.parse(raw);
      const profile = u.profile || u.avatar || u.photoURL || "";
      setUser({ ...u, profile });
      setAvatarOk(true);
    } catch {
      setUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = useMemo(() => getInitials(user?.name), [user]);
  const seedColor = useMemo(
    () => colorFromString(user?.email || user?.name),
    [user]
  );

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setMenuOpen(false);
    setProfileOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-inner navbar-container">
        {/* logo */}
        <Link to="/" className="navbar-logo">
          <picture>
            <source srcSet="/Logo/logoweb.webp" type="image/webp" />
            <img
              src="/Logo/logoweb-sm.png"
              alt="Crystal Shine"
              className="navbar-logo-img"
              width={37}
              height={40}
              fetchPriority="high"
            />
          </picture>
        </Link>

        {/* desktop menu */}
        <nav className="navbar-center">
          <Link to="/AllStores">ร้านทั้งหมด</Link>
          <Link to="/analyze">แนะนำสีเล็บ</Link>
          <Link to="/Articles">บทความดูแลเล็บ</Link>
          <Link to="/helpCenter">ติดต่อเรา</Link>
          <Link to="/aboutGlamNail">เกี่ยวกับเรา</Link>
        </nav>

        {/* right */}
        <div className="navbar-right">
          {/* login (desktop only – คุมด้วย CSS) */}
          {!user && (
            <Link to="/register" className="login-btn">
              เข้าสู่ระบบ
            </Link>
          )}

          {/* notifications */}
          {user && <NotificationBell linkTo="/UserProfile" />}

          {/* profile (clickable) */}
          {user && (
            <div className="profile-menu-wrap" ref={profileMenuRef}>
              <button
                type="button"
                className={`profile-box profile-trigger ${profileOpen ? "active" : ""}`}
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                {user.profile && avatarOk ? (
                  <img
                    src={user.profile}
                    className="profile-pic"
                    alt="profile"
                    onError={() => setAvatarOk(false)}
                  />
                ) : (
                  <div
                    className="profile-pic fallback"
                    style={{ background: seedColor }}
                  >
                    {initials}
                  </div>
                )}
                <span className="navbar-profile-name">{user.name || "โปรไฟล์ของฉัน"}</span>
                <span className={`profile-caret ${profileOpen ? "open" : ""}`} aria-hidden="true" />
              </button>

              {profileOpen && (
                <div className="profile-dropdown profile-dropdown-open" role="menu">
                  <Link to="/UserProfile" className="profile-dropdown-item" onClick={() => setProfileOpen(false)}>
                    โปรไฟล์ของฉัน
                  </Link>
                  <button type="button" className="profile-dropdown-item danger" onClick={logout}>
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          )}

          {/* hamburger */}
          <button
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* ===== mobile menu ===== */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <nav className="mobile-nav">
          <Link to="/AllStores" onClick={() => setMenuOpen(false)}>
            ร้านทั้งหมด
          </Link>
          <Link to="/analyze" onClick={() => setMenuOpen(false)}>
            แนะนำสีเล็บ
          </Link>
          <Link to="/Articles" onClick={() => setMenuOpen(false)}>
            บทความดูแลเล็บ
          </Link>
          <Link to="/helpCenter" onClick={() => setMenuOpen(false)}>
            ติดต่อเรา
          </Link>
          <Link to="/aboutGlamNail" onClick={() => setMenuOpen(false)}>
            เกี่ยวกับเรา
          </Link>

          {user ? (
            <>
              <Link to="/UserProfile" onClick={() => setMenuOpen(false)}>
                โปรไฟล์ของฉัน
              </Link>
              <button className="mobile-logout" onClick={logout}>
                ออกจากระบบ
              </button>
            </>
          ) : (
            <Link to="/register" onClick={() => setMenuOpen(false)}>
              เข้าสู่ระบบ
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
