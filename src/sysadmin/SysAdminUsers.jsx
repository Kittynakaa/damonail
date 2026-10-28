import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getUsersAdmin, banUser, unbanUser, notifyUser } from "../callapi/call_api_admin.jsx";
import NotifyModal from "./NotifyModal.jsx";
import Pagination from "./Pagination.jsx";
import "./SysAdmin.css";

const PAGE_SIZE = 10;

export default function SysAdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [notifyTarget, setNotifyTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      setUsers(await getUsersAdmin());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleBan = async (user) => {
    const { value: reason } = await Swal.fire({
      title: `ระงับบัญชี "${user.username}"`,
      input: "text",
      inputLabel: "เหตุผล",
      inputPlaceholder: "ระบุเหตุผลที่ระงับบัญชี",
      showCancelButton: true,
      confirmButtonText: "ระงับบัญชี",
      cancelButtonText: "ยกเลิก",
      inputValidator: (v) => (!v ? "กรุณาระบุเหตุผล" : undefined),
    });
    if (!reason) return;
    try {
      await banUser(user.user_id, reason);
      await load();
    } catch (err) {
      Swal.fire("ไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const handleUnban = async (user) => {
    try {
      await unbanUser(user.user_id);
      await load();
    } catch (err) {
      Swal.fire("ไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const sendNotify = async (title, message) => {
    try {
      await notifyUser(notifyTarget.user_id, title, message);
      setNotifyTarget(null);
      Swal.fire({ icon: "success", title: "ส่งแจ้งเตือนแล้ว", toast: true, position: "top-end", timer: 1600, showConfirmButton: false });
    } catch (err) {
      Swal.fire("ส่งไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  const filtered = users.filter((u) =>
    (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    String(u.user_id).includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleUsers = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <section className="sysadmin-page">
      <div className="sysadmin-page-header">
        <div>
          <h1>ข้อมูลผู้ใช้</h1>
          <p>ตรวจสอบการใช้งานของผู้ใช้ทั้งหมด และส่งแจ้งเตือน</p>
        </div>
      </div>

      <div className="sysadmin-table-wrap">
        <div className="sysadmin-search-box">
          <input
            placeholder="ค้นหาชื่อผู้ใช้หรืออีเมล..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {loading ? (
          <p>กำลังโหลด...</p>
        ) : filtered.length === 0 ? (
          <div className="sysadmin-empty">ไม่พบผู้ใช้</div>
        ) : (
          <table className="sysadmin-table">
            <thead>
              <tr>
                <th>ผู้ใช้</th>
                <th>บทบาท</th>
                <th>จำนวนการจอง</th>
                <th>เข้าร่วมเมื่อ</th>
                <th>สถานะ</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((u) => (
                <tr key={u.user_id}>
                  <td>{u.username} <br /><span className="sysadmin-card-label">{u.email || u.phone}</span></td>
                  <td>{u.role_name}</td>
                  <td>{u.booking_count}</td>
                  <td>{u.created_at ? new Date(u.created_at).toLocaleDateString("th-TH") : "-"}</td>
                  <td>
                    {u.is_banned ? (
                      <span className="sysadmin-badge banned" title={u.ban_reason}>ถูกระงับ</span>
                    ) : (
                      <span className="sysadmin-badge active">ปกติ</span>
                    )}
                  </td>
                  <td className="sysadmin-row-actions">
                    <button className="sysadmin-btn" onClick={() => navigate(`/SysAdmin/customer-profile?userId=${u.user_id}`)}>ดูโปรไฟล์</button>
                    <button className="sysadmin-btn" onClick={() => setNotifyTarget(u)}>แจ้งเตือน</button>
                    {u.is_banned ? (
                      <button className="sysadmin-btn primary" onClick={() => handleUnban(u)}>ปลดระงับ</button>
                    ) : (
                      <button className="sysadmin-btn danger" onClick={() => handleBan(u)}>ระงับบัญชี</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {notifyTarget && (
        <NotifyModal
          title={`แจ้งเตือนผู้ใช้: ${notifyTarget.username}`}
          onClose={() => setNotifyTarget(null)}
          onSend={sendNotify}
        />
      )}
    </section>
  );
}
