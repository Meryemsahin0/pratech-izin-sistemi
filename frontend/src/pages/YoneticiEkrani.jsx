import React, { useState, useEffect, useCallback } from "react";
import { api, formatTarih, gunHesapla } from "../api";

function Badge({ durum }) {
  const map = {
    Beklemede: { cls: "badge-pending", icon: "⏳" },
    Onaylandı: { cls: "badge-approved", icon: "✅" },
    Reddedildi: { cls: "badge-rejected", icon: "❌" },
  };
  const { cls, icon } = map[durum] || map["Beklemede"];
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {icon} {durum}
    </span>
  );
}

export default function YoneticiEkrani() {
  const [izinler, setIzinler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState("Tümü");

  const fetchIzinler = useCallback(async () => {
    try {
      const res = await api.getIzinler();
      setIzinler(res.data.data);
    } catch {
      console.error("Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIzinler();
    const interval = setInterval(fetchIzinler, 30000);
    return () => clearInterval(interval);
  }, [fetchIzinler]);

  async function handleDurum(id, durum) {
    setActionLoading((p) => ({ ...p, [id]: durum }));
    try {
      const res = await api.updateDurum(id, durum);
      setIzinler((prev) => prev.map((i) => (i.id === id ? res.data.data : i)));
    } catch (err) {
      alert(err.response?.data?.errors?.join("\n") || "Bir hata oluştu.");
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  }

  const counts = {
    Tümü: izinler.length,
    Beklemede: izinler.filter((i) => i.durum === "Beklemede").length,
    Onaylandı: izinler.filter((i) => i.durum === "Onaylandı").length,
    Reddedildi: izinler.filter((i) => i.durum === "Reddedildi").length,
  };

  const filtered = filter === "Tümü" ? izinler : izinler.filter((i) => i.durum === filter);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Yönetici Paneli</h1>
        <p className="page-subtitle">Gelen izin taleplerini inceleyin, onaylayın veya reddedin.</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num teal">{counts.Tümü}</span>
          <span className="stat-label">Toplam Talep</span>
        </div>
        <div className="stat-card">
          <span className="stat-num amber">{counts.Beklemede}</span>
          <span className="stat-label">Bekleyen</span>
        </div>
        <div className="stat-card">
          <span className="stat-num green">{counts.Onaylandı}</span>
          <span className="stat-label">Onaylanan</span>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Filter bar */}
        <div style={{
          display: "flex", gap: 8, padding: "18px 20px",
          borderBottom: "1px solid var(--border)", flexWrap: "wrap", alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["Tümü", "Beklemede", "Onaylandı", "Reddedildi"].map((f) => (
              <button
                key={f}
                className={`btn btn-outline${filter === f ? " active-filter" : ""}`}
                style={filter === f ? { borderColor: "var(--teal)", color: "var(--teal)", background: "var(--teal-glow)" } : {}}
                onClick={() => setFilter(f)}
              >
                {f} <span style={{
                  background: filter === f ? "var(--teal)" : "var(--off-white)",
                  color: filter === f ? "white" : "var(--text-secondary)",
                  borderRadius: 99, padding: "1px 7px", fontSize: 11, fontWeight: 700
                }}>{counts[f]}</span>
              </button>
            ))}
          </div>
          <button
            className="btn btn-outline"
            onClick={fetchIzinler}
            title="Yenile"
            style={{ padding: "7px 12px" }}
          >
            🔄 Yenile
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 48, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">Kayıt bulunamadı</div>
            <div className="empty-state-sub">
              {filter === "Tümü" ? "Henüz hiç izin talebi oluşturulmamış." : `"${filter}" durumunda talep bulunmuyor.`}
            </div>
          </div>
        ) : (
          <div className="table-wrap" style={{ borderRadius: 0, border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Personel</th>
                  <th>İzin Türü</th>
                  <th>Başlangıç</th>
                  <th>Bitiş</th>
                  <th>Süre</th>
                  <th>Açıklama</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((izin, idx) => {
                  const isLoading = actionLoading[izin.id];
                  const gun = gunHesapla(izin.baslangicTarihi, izin.bitisTarihi);
                  return (
                    <tr key={izin.id} style={{ animationDelay: `${idx * 0.04}s` }}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--navy)" }}>{izin.adSoyad}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {new Date(izin.olusturmaTarihi).toLocaleDateString("tr-TR")}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          background: "var(--teal-glow)", color: "var(--teal-dark)",
                          padding: "3px 9px", borderRadius: 99, fontSize: 12.5, fontWeight: 600
                        }}>{izin.izinTuru}</span>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatTarih(izin.baslangicTarihi)}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{formatTarih(izin.bitisTarihi)}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: "var(--navy)" }}>{gun}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}> gün</span>
                      </td>
                      <td style={{ maxWidth: 180 }}>
                        <span style={{
                          fontSize: 13, color: "var(--text-secondary)",
                          display: "-webkit-box", WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical", overflow: "hidden"
                        }}>
                          {izin.aciklama || <em style={{ color: "var(--text-muted)" }}>Açıklama yok</em>}
                        </span>
                      </td>
                      <td><Badge durum={izin.durum} /></td>
                      <td>
                        {izin.durum === "Beklemede" ? (
                          <div className="action-cell">
                            <button
                              className="btn btn-success"
                              disabled={!!isLoading}
                              onClick={() => handleDurum(izin.id, "Onaylandı")}
                            >
                              {isLoading === "Onaylandı" ? "⏳" : "✓"} Onayla
                            </button>
                            <button
                              className="btn btn-danger"
                              disabled={!!isLoading}
                              onClick={() => handleDurum(izin.id, "Reddedildi")}
                            >
                              {isLoading === "Reddedildi" ? "⏳" : "✕"} Reddet
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
                            {izin.durum === "Onaylandı" ? "✅ Tamamlandı" : "❌ Reddedildi"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
