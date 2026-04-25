import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

export const api = {
  izinTalep: (data) => axios.post(`${BASE}/izin-talep`, data),
  getIzinler: () => axios.get(`${BASE}/izinler`),
  updateDurum: (id, durum) => axios.put(`${BASE}/izin-durum/${id}`, { durum }),
};

export function formatTarih(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function gunHesapla(baslangic, bitis) {
  const a = new Date(baslangic);
  const b = new Date(bitis);
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 0;
}
