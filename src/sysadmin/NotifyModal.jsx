import React, { useState } from "react";

export default function NotifyModal({ title, onClose, onSend }) {
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onSend(msgTitle, msgBody);
  };

  return (
    <div className="sysadmin-modal-overlay" onClick={onClose}>
      <div className="sysadmin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <form onSubmit={submit}>
          <label>หัวข้อ</label>
          <input required value={msgTitle} onChange={(e) => setMsgTitle(e.target.value)} />
          <label>ข้อความ</label>
          <textarea required value={msgBody} onChange={(e) => setMsgBody(e.target.value)} />
          <div className="sysadmin-modal-actions">
            <button type="button" className="sysadmin-btn" onClick={onClose}>ยกเลิก</button>
            <button type="submit" className="sysadmin-btn primary">ส่งแจ้งเตือน</button>
          </div>
        </form>
      </div>
    </div>
  );
}
