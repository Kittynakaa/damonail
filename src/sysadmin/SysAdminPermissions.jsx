import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getUsersAdmin,
  banUser,
  unbanUser,
  getRoles,
  getPermissions,
  getRolePermissions,
  assignPermission,
  revokePermission,
} from "../callapi/call_api_admin.jsx";
import Pagination from "./Pagination.jsx";
import "./SysAdmin.css";

const PAGE_SIZE = 10;

export default function SysAdminPermissions() {
  const [tab, setTab] = useState("accounts");

  return (
    <section className="sysadmin-page">
      <div className="sysadmin-page-header">
        <div>
          <h1>สิทธิ์และบัญชีผู้ใช้</h1>
          <p>ระงับ/ปลดระงับบัญชีผู้ใช้ และจัดการสิทธิ์ของแต่ละบทบาท</p>
        </div>
      </div>

      <div className="sysadmin-tabs">
        <button className={`sysadmin-tab-btn ${tab === "accounts" ? "active" : ""}`} onClick={() => setTab("accounts")}>บัญชีผู้ใช้</button>
        <button className={`sysadmin-tab-btn ${tab === "permissions" ? "active" : ""}`} onClick={() => setTab("permissions")}>สิทธิ์ตามบทบาท</button>
      </div>

      {tab === "accounts" ? <AccountsTab /> : <PermissionsTab />}
    </section>
  );
}

function AccountsTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => { load(); }, []);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const visibleUsers = users.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleBan = async (user) => {
    const { value: reason } = await Swal.fire({
      title: `ระงับบัญชี "${user.username}"`,
      input: "text",
      inputLabel: "เหตุผล",
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

  return (
    <div className="sysadmin-table-wrap">
      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <table className="sysadmin-table">
          <thead>
            <tr>
              <th>ผู้ใช้</th>
              <th>บทบาท</th>
              <th>สถานะ</th>
              <th>เหตุผล (ถ้าถูกระงับ)</th>
              <th>การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((u) => (
              <tr key={u.user_id}>
                <td>{u.username}</td>
                <td>{u.role_name}</td>
                <td>{u.is_banned ? <span className="sysadmin-badge banned">ถูกระงับ</span> : <span className="sysadmin-badge active">ปกติ</span>}</td>
                <td>{u.ban_reason || "-"}</td>
                <td>
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
  );
}

function PermissionsTab() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [r, p, a] = await Promise.all([getRoles(), getPermissions(), getRolePermissions()]);
      setRoles(r);
      setPermissions(p);
      setAssignments(a);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const isAssigned = (roleId, permissionId) =>
    assignments.find((a) => a.role_id === roleId && a.permission_id === permissionId);

  const toggle = async (roleId, permissionId) => {
    const existing = isAssigned(roleId, permissionId);
    try {
      if (existing) {
        await revokePermission(existing.role_permission_id);
      } else {
        await assignPermission(roleId, permissionId);
      }
      await load();
    } catch (err) {
      Swal.fire("ไม่สำเร็จ", err.response?.data?.error || "เกิดข้อผิดพลาด", "warning");
    }
  };

  if (loading) return <p>กำลังโหลด...</p>;

  return (
    <div className="sysadmin-table-wrap">
      <table className="sysadmin-table">
        <thead>
          <tr>
            <th>สิทธิ์ \ บทบาท</th>
            {roles.map((r) => <th key={r.role_id}>{r.role_name}</th>)}
          </tr>
        </thead>
        <tbody>
          {permissions.map((p) => (
            <tr key={p.permission_id}>
              <td>{p.name}</td>
              {roles.map((r) => (
                <td key={r.role_id}>
                  <input
                    type="checkbox"
                    checked={!!isAssigned(r.role_id, p.permission_id)}
                    onChange={() => toggle(r.role_id, p.permission_id)}
                    style={{ width: "auto", accentColor: "#d9789c" }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
