import axios from "axios";

const api = "http://localhost:5010";

// ค้นหาร้านใกล้เคียง -- ส่ง lat/lng (จาก GPS) หรือ province (fallback เมื่อไม่อนุญาตตำแหน่ง)
export async function getNearbyStores({ lat, lng, province, radiusKm } = {}) {
  try {
    const params = {};
    if (lat != null && lng != null) {
      params.lat = lat;
      params.lng = lng;
      params.radius_km = radiusKm || 5;
    } else if (province) {
      params.province = province;
    } else {
      return [];
    }

    const response = await axios.get(`${api}/store/nearby`, { params });
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching nearby stores:", error);
    return [];
  }
}
