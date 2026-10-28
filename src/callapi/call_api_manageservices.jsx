import axios from "axios";
const api = "http://localhost:5010";
// ===============================
// GET SERVICE BY STORE
// ===============================
export const fetchServicesByStore = async (storeId) => {
  const res = await axios.get(`${api}/service/store/${storeId}`);
  return res.data;
};

// ===============================
// CREATE
// ===============================
export const createService = async (data) => {
  const res = await axios.post(`${api}/service`, data);
  return res.data;
};

// ===============================
// UPDATE
// ===============================
export const updateServiceAPI = async (id, data) => {
  const res = await axios.put(`${api}/service/${id}`, data);
  return res.data;
};

// ===============================
// DELETE
// ===============================
export const deleteServiceAPI = async (id) => {
  const res = await axios.delete(`${api}/service/${id}`);
  return res.data;
};
