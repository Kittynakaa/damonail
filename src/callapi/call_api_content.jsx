import axios from "axios";
import { authHeader } from "./auth";

const api = "http://localhost:5010";

export async function getContent(contentType) {
  const res = await axios.get(`${api}/admin/content`, {
    params: contentType ? { content_type: contentType } : {},
    headers: authHeader(),
  });
  return res.data;
}

export async function createContent(data) {
  const res = await axios.post(`${api}/admin/content`, data, { headers: authHeader() });
  return res.data;
}

export async function updateContent(contentId, data) {
  const res = await axios.put(`${api}/admin/content/${contentId}`, data, { headers: authHeader() });
  return res.data;
}

export async function deleteContent(contentId) {
  const res = await axios.delete(`${api}/admin/content/${contentId}`, { headers: authHeader() });
  return res.data;
}
