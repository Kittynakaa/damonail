import React from "react";
import { useParams, Link } from "react-router-dom";
import "./ArticleDetail.css";

const ARTICLES = {
  acrylic: {
    title: "5 ข้อควรเช็คก่อน “ต่อเล็บอะคริลิค” ครั้งแรก",
    date: "29 กันยายน 2025",
    author: "ทีมงาน Crystal Shine",
    cover: "/Articles/acrylic.jpg",
    content: [
      {
        h: "การต่อเล็บอะคริลิคคืออะไร",
        p: "เล็บอะคริลิคเป็นการต่อเล็บโดยใช้ผงอะคริลิคผสมกับน้ำยาโมโนเมอร์ ทำให้เกิดวัสดุที่แข็งแรง สามารถต่อความยาวและขึ้นรูปได้ตามต้องการ เหมาะสำหรับผู้ที่ต้องการเล็บยาว แข็งแรง และออกแบบลวดลายได้หลากหลาย",
      },
      {
        h: "1. เลือกร้านและช่างที่ได้มาตรฐาน",
        p: "ช่างที่มีประสบการณ์จะช่วยลดความเสี่ยงเล็บบางหรือเล็บเสีย ควรเลือกร้านที่ใช้อุปกรณ์สะอาด มีการฆ่าเชื้อ และให้คำแนะนำก่อนทำอย่างละเอียด",
      },
      {
        h: "2. วัสดุที่ใช้มีผลต่อสุขภาพเล็บ",
        p: "อะคริลิคคุณภาพต่ำอาจทำให้เล็บเหลืองหรือเกิดการระคายเคือง ควรสอบถามช่างถึงแบรนด์และประเภทของวัสดุที่ใช้ทุกครั้ง",
      },
      {
        h: "3. ความยาวเล็บต้องเหมาะกับไลฟ์สไตล์",
        p: "เล็บที่ยาวเกินไปอาจไม่เหมาะกับคนทำงานหรือใช้มือเยอะ AI ของ Crystal Shine สามารถช่วยประเมินรูปทรงเล็บที่เหมาะกับคุณได้",
      },
      {
        h: "4. การดูแลหลังต่อเล็บ",
        p: "หลีกเลี่ยงการใช้เล็บงัดสิ่งของ และควรทาน้ำมันบำรุงเล็บเป็นประจำ เพื่อยืดอายุการใช้งานและรักษาสุขภาพเล็บ",
      },
      {
        h: "5. ฟังคำแนะนำจากผู้เชี่ยวชาญ",
        p: "หากรู้สึกเจ็บ แสบ หรือเล็บผิดปกติ ควรถอดเล็บทันทีและปรึกษาช่างหรือแพทย์ผู้เชี่ยวชาญ",
      },
    ],
  },
};

export default function ArticleDetail() {
  const { id } = useParams();

  // กันพัง: แปลง id เป็น lowercase และ fallback
  const article = ARTICLES[id?.toLowerCase()] || ARTICLES["acrylic"];

  if (!article) {
    return (
      <div className="article-notfound">
        <h2>ไม่พบบทความ</h2>
        <Link to="/articles" className="btn btn-primary">
          กลับไปหน้าบทความ
        </Link>
      </div>
    );
  }

  return (
    <main className="article-detail">
      {/* HERO */}
      <section className="article-hero">
        <img src={article.cover} alt={article.title} />
        <div className="overlay" />
        <div className="article-hero-text">
          <span className="article-eyebrow">บทความ</span>
          <p className="meta">
            {article.author} • {article.date}
          </p>
          <h1>{article.title}</h1>
        </div>
      </section>

      {/* CONTENT */}
      <section className="article-body container">
        {article.content.map((c, i) => (
          <div key={i} className="article-section">
            <h2>{c.h}</h2>
            <p>{c.p}</p>
          </div>
        ))}

        {/* AI INSIGHT */}
        <div className="article-ai-tip">
          <h3>ข้อมูลเชิงลึกจาก AI ของ Crystal Shine</h3>
          <p>
            ระบบ AI ของ Crystal Shine สามารถวิเคราะห์รูปทรงนิ้วและโทนสีผิวของคุณ
            เพื่อแนะนำความยาว สี และทรงเล็บอะคริลิคที่เหมาะสม
            ช่วยให้เล็บดูสวยและปลอดภัยกับการใช้งานในชีวิตประจำวัน
          </p>
        </div>

        {/* BACK */}
        <div className="article-back">
          <Link to="/articles" className="btn btn-light">
            ← กลับไปหน้าบทความ
          </Link>
        </div>
      </section>
    </main>
  );
}
