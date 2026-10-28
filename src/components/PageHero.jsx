import "./PageHero.css";

// หัวข้อมาตรฐานของทุกหน้า (ยกเว้น Home) — eyebrow + heading + คำโปรย + chip
// ใช้ class prefix "ph-" ทั้งหมดเพื่อไม่ให้ชนกับ class เดิมของแต่ละหน้า (CSS ทั้งเว็บโหลดแบบ global)
export default function PageHero({ eyebrow, title, description, chips, children, compact = false }) {
  return (
    <section className={`ph-hero${compact ? " ph-hero-compact" : ""}`}>
      <div className="ph-hero-inner">
        {eyebrow && <span className="ph-eyebrow">{eyebrow}</span>}
        {title && <h1 className="ph-title">{title}</h1>}
        {description && <p className="ph-lead">{description}</p>}
        {chips && chips.length > 0 && (
          <div className="ph-chips">
            {chips.map((c) => (
              <div className="ph-chip" key={c}>{c}</div>
            ))}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
