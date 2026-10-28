import axios from "axios";
const api = "http://localhost:5010";
export async function getTypeServices() {
  const res = await axios.get(`${api}/type-services`);
  return res.data;
}
