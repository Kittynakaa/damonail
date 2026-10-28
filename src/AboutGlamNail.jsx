import React, { useEffect } from "react";
import "./AboutGlamNail.css";


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
        { threshold: 0.1 }
      );
      targets.forEach((el) => io.observe(el));
      return () => io.disconnect();
    }

    const cleanups = [makeObserver(".reveal"), makeObserver(".stagger")];
    return () => cleanups.forEach((fn) => typeof fn === "function" && fn());
  }, []);

  return (
    <div className="gn-about">
      {/* --- HERO --- */}
      <section className="hero">
        <div className="container">
          <span className="label-mini reveal">มุมมองของ Crystal Shine</span>
          <h1 className="reveal">มาตรฐานใหม่ <br/> แห่งการจองทำเล็บ</h1>
          <p className="lead reveal">
            Crystal Shine คือแพลตฟอร์มที่ยกระดับประสบการณ์ความงาม
            ผสานเทคโนโลยี <b>AI วิเคราะห์สีผิว</b> เพื่อการเลือกเฉดสีที่สมบูรณ์แบบ
            และระบบการจองที่คัดสรรมาเพื่อไลฟ์สไตล์ที่ทันสมัย
          </p>

          <div className="chips reveal">
            <div className="chip"> จองคิวอัจฉริยะ</div>
            <div className="chip"> จับคู่สี AI</div>
            <div className="chip"> คัดสรรร้านคุณภาพ</div>
            <div className="chip"> สิทธิพิเศษเฉพาะสมาชิก</div>
            <div className="chip"> คอมมูนิตี้ความงาม</div>
          </div>
        </div>
      </section>

      {/* --- TIMELINE --- */}
      <section className="section" style={{padding: '100px 0'}}>
        <div className="container">
          <div className="section-title-box reveal">
            <span className="label-mini">เส้นทางของเรา</span>
            <h2 style={{fontFamily: 'Playfair Display', fontSize: '32px', textTransform:'uppercase' ,fontWeight:'300'}}>วิวัฒนาการแห่งความงาม</h2>
          </div>

          <div className="timeline">
            {/* 2025 */}
            <article className="tl reveal">
              <img src="./icon/ภาพถ่ายหน้าจอ 2569-01-18 เวลา 1.58.42 AM.png" alt="จุดเริ่มต้นปี 2025" />
              <div>
                <span className="label-mini">เฟส 01</span>
                <h3>2025 — จุดกำเนิด</h3>
                <small>ต้นแบบระบบ • การจองหลัก • เครือข่ายพาร์ตเนอร์</small>
                <p>
                  จุดเริ่มต้นจากการแก้ปัญหาความแออัดหน้าร้าน สู่การสร้างระบบ Dashboard
                  แบบเรียลไทม์ที่ช่วยให้ช่างและลูกค้าสื่อสารกันได้อย่างไร้รอยต่อ
                </p>
              </div>
            </article>

            {/* 2026 */}
            <article className="tl reveal">
              <img src="./icon/ภาพถ่ายหน้าจอ 2569-01-18 เวลา 1.58.52 AM.png" alt="วิเคราะห์ด้วย AI" />
              <div>
                <span className="label-mini">เฟส 02</span>
                <h3>2026 — ความเปล่งประกายอัจฉริยะ</h3>
                <small>วิเคราะห์โทนสีผิวด้วย AI • คลังรีวิว • สะสมแต้ม</small>
                <p>
                  เราเปิดตัว AI วิเคราะห์อันเดอร์โทนผิว เพื่อมอบคำแนะนำเฉดสีที่เป็นส่วนตัวที่สุด
                  พร้อมระบบรีวิวที่เน้นภาพผลงานจริงเพื่อความมั่นใจในทุกการจอง
                </p>
              </div>
            </article>

            {/* 2027 */}
            <article className="tl reveal">
              <img src="./icon/ภาพถ่ายหน้าจอ 2569-01-18 เวลา 1.59.16 AM.png" alt="คอมมูนิตี้" />
              <div>
                <span className="label-mini">เฟส 03</span>
                <h3>2027 — สร้างคอมมูนิตี้</h3>
                <small>เทรนด์ • เวิร์กช็อป • มาร์เก็ตเพลส</small>
                <p>
                  สร้างพื้นที่แห่งแรงบันดาลใจผ่านคอมมูนิตี้เทรนด์เล็บระดับสากล
                  และเวิร์กช็อปร่วมกับศิลปินช่างทำเล็บชั้นนำ
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* --- TEAM --- */}
      <section className="section" style={{padding: '100px 0', borderTop: '1px solid var(--border)'}}>
        <div className="container">
          <div className="section-title-box reveal">
            <span className="label-mini">เบื้องหลังวิสัยทัศน์</span>
            <h2 style={{fontFamily: 'Playfair Display', fontSize: '32px', textTransform:'uppercase',fontWeight:'300'}}>ทีมของเรา</h2>
          </div>

          <div className="team-grid">
            <div className="card reveal">
              <img src="./icon/kitty.JPG" alt="นักพัฒนา 1" />
              <h4>Chakrit Uamom</h4>
              <p>สถาปนิกระบบ • UX & Frontend</p>
            </div>
            <div className="card reveal">
              <img src="./icon/pang.png" alt="นักพัฒนา 2" />
              <h4>Apisara Nakhonsuk</h4>
              <p>กลยุทธ์ Backend • หัวหน้าโมดูล AI</p>
            </div>
            <div className="card reveal">
              <img src="./icon/io.png" alt="ที่ปรึกษา" />
              <h4>Asst. Prof. Dr. Isun</h4>
              <p>ที่ปรึกษาด้านการวิจัย • ที่ปรึกษาทางวิชาการ</p>
            </div>
          </div>
        </div>
      </section>

      <footer style={{textAlign: 'center', padding: '60px 0', fontSize: '10px', color: '#999', letterSpacing: '2px'}}>
        © 2026 CRYSTAL SHINE. สงวนลิขสิทธิ์
      </footer>
    </div>
  );
}