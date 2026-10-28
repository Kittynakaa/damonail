import { useCallback, useEffect, useState } from "react";
import { getNearbyStores } from "../callapi/call_api_nearby.jsx";

// ขอตำแหน่งจาก Browser GPS อัตโนมัติ แล้วดึงร้านใกล้เคียงจาก backend
// ถ้าผู้ใช้ไม่อนุญาต/เบราว์เซอร์ไม่รองรับ ให้ตั้ง permissionDenied = true
// เพื่อให้หน้าจอแสดงตัวเลือกค้นหาจากจังหวัดแทน (เรียก searchByProvince)
export default function useNearbyStores({ radiusKm = 5 } = {}) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [province, setProvince] = useState(null);

  const fetchByCoords = useCallback(async (lat, lng) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNearbyStores({ lat, lng, radiusKm });
      setStores(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [radiusKm]);

  const searchByProvince = useCallback(async (provinceName) => {
    setProvince(provinceName);
    setLoading(true);
    setError(null);
    try {
      const data = await getNearbyStores({ province: provinceName });
      setStores(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionDenied(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissionDenied(false);
        fetchByCoords(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setPermissionDenied(true);
        setLoading(false);
      },
      { timeout: 8000 }
    );
    // ต้องการรันแค่ครั้งเดียวตอน mount เพื่อขอตำแหน่งอัตโนมัติ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { stores, loading, error, permissionDenied, province, searchByProvince };
}
