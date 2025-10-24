import React, { useEffect } from "react";
import "./AboutGlamNail.css"; // ⬅️ แยก CSS แล้ว และไม่ใช้ :root ทับทั้งหน้า

export default function AboutGlamNail() {
  useEffect(() => {
    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function makeObserver(selector, toggleClass = "in") {
      const targets = document.querySelectorAll(selector);
      if (prefersReduce) {
        targets.forEach((el) => el.classList.add(toggleClass));
        return () => {};
      }
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add(toggleClass);
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      targets.forEach((el) => io.observe(el));
      return () => io.disconnect();
    }

    const cleanups = [makeObserver(".reveal"), makeObserver(".stagger", "in")];
    return () => cleanups.forEach((fn) => typeof fn === "function" && fn());
  }, []);

  return (
    <div className="gn-about">
      {/* Preface / บอกว่าเว็บทำอะไรได้ */}
      <section className="hero">
        <div className="blob p1" />
        <div className="blob p2" />
        <div className="blob p3" />
        <div className="container">
          <h1 className="reveal">เกี่ยวกับเรา</h1>
          <p className="lead reveal">
            GlamNail Studio คือแพลตฟอร์มร้านทำเล็บที่ให้คุณ
            <b> จองคิวล่วงหน้า</b> ได้ง่าย แนะนำ <b>สีเล็บที่เข้ากับโทนผิวด้วย AI</b>,
            ดู <b>ผลงานช่าง</b> เปรียบเทียบราคา โปรโมชัน และร่วมคอมมูนิตี้คนรักเล็บ
          </p>

          <div className="chips stagger">
            <div className="chip">🗓️ จอง/จัดการนัด</div>
            <div className="chip">🎨 AI แนะนำเฉดสี</div>
            <div className="chip">💅 เลือกช่างตามผลงาน</div>
            <div className="chip">🏷️ คูปอง & สะสมแต้ม</div>
            <div className="chip">🤝 คอมมูนิตี้เทรนด์เล็บ</div>
          </div>

          <div className="hero-cta reveal">
            <button className="btn" type="button">เริ่มต้นใช้งาน</button>
            <button className="btn btn-ghost" type="button">ดูวิธีการทำงาน</button>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="container">
          <h2 className="reveal">เส้นทางของเรา — จากปี 2025 สู่อนาคต</h2>
          <p className="reveal">
            เราเติบโตไปพร้อมกับผู้ใช้และร้านค้า เป้าหมายคือประสบการณ์ที่ลื่นไหล สวยงาม และยั่งยืน
          </p>

          <div className="timeline">
            {/* 2025 */}
            <article className="tl reveal" style={{ position: "relative" }}>
              <img src="about1.jpg" alt="ภาพร้านช่วงเริ่มต้นปี 2025" />
              <div>
                <h3>2025 — จุดเริ่มต้น</h3>
                <small>Prototype • ระบบจองคิวพื้นฐาน • เปิดทดสอบร้านพันธมิตร</small>
                <p>
                  เราเริ่มจากการแก้ปัญหาคิวหน้าร้าน สร้างระบบจองที่ใช้งานง่าย รองรับมือถือ
                  และมีแดชบอร์ดร้านค้าแบบเรียลไทม์ พร้อมระบบแจ้งเตือนนัดผ่านไลน์/อีเมล.
                </p>
              </div>
            </article>

            {/* 2026 */}
            <article className="tl reveal" style={{ position: "relative" }}>
              <div>
                <h3>2026 — ขยายบริการ</h3>
                <small>AI Skin Tone • รีวิว & แกลเลอรี • Loyalty</small>
                <p>
                  เพิ่ม AI วิเคราะห์โทนผิว/อันเดอร์โทนเพื่อแนะนำเฉดสีที่เหมาะ เพิ่มรีวิวพร้อมรูปก่อน-หลัง
                  และระบบสมาชิกสะสมแต้ม ทำให้ยอดจองซ้ำเติบโตอย่างต่อเนื่อง.
                </p>
              </div>
              <img src="about2.jpg" alt="ภาพฟีเจอร์ AI วิเคราะห์โทนสีผิว" />
            </article>

            {/* 2027 */}
            <article className="tl reveal" style={{ position: "relative" }}>
              <img src="about3.jpg" alt="กิจกรรมคอมมูนิตี้และเวิร์กช็อป" />
              <div>
                <h3>2027 — สู่ความเป็นชุมชน</h3>
                <small>Community • Workshop • Marketplace</small>
                <p>
                  เราสร้างพื้นที่แบ่งปันเทรนด์ ไอเดีย และทิปส์ดูแลเล็บ จัดเวิร์กช็อปร่วมกับช่าง
                  และทดลอง marketplace วัสดุช่าง/สติ๊กเกอร์เล็บสำหรับผู้สนับสนุน.
                </p>
              </div>
            </article>

            {/* Future */}
            <article className="tl reveal" style={{ position: "relative" }}>
              <div>
                <h3>อนาคต — Smart Beauty Platform</h3>
                <small>Sustainability • Data Insights • Multi-Branch</small>
                <p>
                  เป้าหมายระยะยาวคือแพลตฟอร์มความงามที่ยั่งยืน ใช้วัสดุเป็นมิตรกับสิ่งแวดล้อม,
                  แดชบอร์ดวิเคราะห์ข้อมูลลูกค้า/รอบคิวเชิงลึก และรองรับหลายสาขาแบบรวมศูนย์.
                </p>
              </div>
              <img src="about4.jpg" alt="วิสัยทัศน์สู่แพลตฟอร์มความงามอัจฉริยะ" />
            </article>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <h2 className="reveal">ทีมผู้พัฒนา & อาจารย์ที่ปรึกษา</h2>
          <p className="reveal">เราทำงานแบบคู่หู แยกหน้าที่ชัดเจน และมีอาจารย์ที่ปรึกษาคอยกำกับคุณภาพงานวิชาการ</p>
          <div className="team-grid stagger">
            <div className="card">
              <img src="team1.jpg" alt="ผู้พัฒนา 1" />
              <h4>นายชาคริต อ่วมอ่ำ</h4>
              <p>ผู้พัฒนา/ออกแบบระบบ • UX & Frontend • เอกสารงานวิจัย</p>
            </div>
            <div className="card">
              <img src="team2.jpg" alt="ผู้พัฒนา 2" />
              <h4>นางสาวอภิสรา นครสุข</h4>
              <p>ผู้พัฒนา • Backend/Infra • โมดูล AI แนะนำสี</p>
            </div>
            <div className="card">
              <img src="advisor.jpg" alt="อาจารย์ที่ปรึกษา" />
              <h4>ผศ. ดร.ไอศูรย์ กาญจนสุรัตน์</h4>
              <p>อาจารย์ที่ปรึกษา • แนะแนววิจัย • ตรวจสอบคุณภาพงานวิชาการ</p>
            </div>
          </div>
          <p className="note">* เปลี่ยนรูป/ข้อความตำแหน่งได้ตามจริงของทีมคุณ</p>
        </div>
      </section>
    </div>
  );
}
