// แก้ไขไฟล์ service (เช่น storeService.js)
import axios from 'axios';

const api = "http://localhost:5010"; // ตรวจสอบว่า URL ตรงกับ Backend ของคุณ
export async function getTopServices(storeId) {
  try {
    const response = await axios.get(
      `${api}/report/top-services/${storeId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getTopServicess(storeId) {
  const response = await axios.get(
    `${api}/report/top-services/${storeId}`
  );
  return response.data;
}

export async function getMonthlyIncome(storeId) {
  try {
    const response = await axios.get(
      `${api}/report/monthly-income/${storeId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}


export async function getMonthlyIncomeByYear(storeId, year) {
  const response = await axios.get(
    `${api}/report/monthly-income/${storeId}/${year}`
  );
  return response.data;
}
