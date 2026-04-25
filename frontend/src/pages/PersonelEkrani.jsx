import React, { useState } from "react";
import { api, formatTarih, gunHesapla } from "../api";

const IZIN_TURLERI = ["Yıllık İzin", "Sağlık İzni", "Mazeret İzni"];

const today = new Date().toISOString().split("T")[0];

export default function PersonelEkrani() {
  const [form, setForm] = useState({
    adSoyad: "",
    izinTuru: "",
    baslangicTarihi: "",
    bitisTarihi: "",
    aciklama: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiErrors, setApiErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => ({ ...p, [name]: "" }));
    setApiErrors([]);
    setSuccess(false);
  }

  function validateFront() {
    const errs = {};
    if (!form.adSoyad.trim() || form.adSoyad.trim().length < 2)
      errs.adSoyad = "Ad Soyad zorunludur (en az 2 karakter).";
    if (!form.izinTuru) errs.izinTuru = "İzin türü seçilmesi zorunludur.";
    if (!form.baslangicTarihi) errs.baslangicTarihi = "Başlangıç tarihi seçilmesi zorunludur.";
    if (!form.bitisTarihi) errs.bitisTarihi = "Bitiş tarihi seçilmesi zorunludur.";
    if (form.baslangicTarihi && form.bitisTarihi && form.baslangicTarihi > form.bitisTarihi)
      errs.bitisTarihi = "Bitiş tarihi, başlangıç tarihinden önce olamaz.";
    return errs;
  }

  async function handleSubmit() {
    const errs = validateFront();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await api.izinTalep(form);
      setSuccess(true);
      setForm({ adSoyad: "", izinTuru: "", baslangicTarihi: "", bitisTarihi: "", aciklama: "" });
    } catch (err) {
      const msgs = err.response?.data?.errors || ["Bir hata oluştu. Lütfen tekrar deneyin."];
      setApiErrors(msgs);
    } finally {
      setLoading(false);
    }
  }

  const gun = form.baslangicTarihi && form.bitisTarihi
    ? gunHesapla(form.baslangicTarihi, form.bitisTarihi)
    : null;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">İzin Talebi Oluştur</h1>
        <p className="page-subtitle">Aşağıdaki formu eksiksiz doldurarak izin talebinizi iletebilirsiniz.</p>
      </div>

      <div className="card" style={{ maxWidth: 720 }}>
        {apiErrors.length > 0 && (
          <div className="error-box">
            <div className="error-box-title">⚠ Lütfen aşağıdaki hataları düzeltin:</div>
            <ul>{apiErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}

        {success && (
          <div className="success-box">
            <span style={{ fontSize: 20 }}>✅</span>
            <span>İzin talebiniz başarıyla oluşturuldu. Yöneticiniz en kısa sürede inceleyecektir.</span>
          </div>
        )}

        <div className="section-title">Kişisel Bilgiler</div>
        <div className="form-grid">
          <div className="form-group full">
            <label className="form-label">Ad Soyad <span>*</span></label>
            <input
              className={`form-input${fieldErrors.adSoyad ? " error" : ""}`}
              name="adSoyad"
              value={form.adSoyad}
              onChange={handleChange}
              placeholder="Örn: Ahmet Yılmaz"
              autoComplete="name"
            />
            {fieldErrors.adSoyad && <span className="form-error">⚠ {fieldErrors.adSoyad}</span>}
          </div>
        </div>

        <div className="divider" />
        <div className="section-title">İzin Bilgileri</div>
        <div className="form-grid">
          <div className="form-group full">
            <label className="form-label">İzin Türü <span>*</span></label>
            <select
              className={`form-select${fieldErrors.izinTuru ? " error" : ""}`}
              name="izinTuru"
              value={form.izinTuru}
              onChange={handleChange}
            >
              <option value="">Seçiniz...</option>
              {IZIN_TURLERI.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {fieldErrors.izinTuru && <span className="form-error">⚠ {fieldErrors.izinTuru}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Başlangıç Tarihi <span>*</span></label>
            <input
              type="date"
              className={`form-input${fieldErrors.baslangicTarihi ? " error" : ""}`}
              name="baslangicTarihi"
              value={form.baslangicTarihi}
              min={today}
              onChange={handleChange}
            />
            {fieldErrors.baslangicTarihi
              ? <span className="form-error">⚠ {fieldErrors.baslangicTarihi}</span>
              : form.baslangicTarihi && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatTarih(form.baslangicTarihi)}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Bitiş Tarihi <span>*</span></label>
            <input
              type="date"
              className={`form-input${fieldErrors.bitisTarihi ? " error" : ""}`}
              name="bitisTarihi"
              value={form.bitisTarihi}
              min={form.baslangicTarihi || today}
              onChange={handleChange}
            />
            {fieldErrors.bitisTarihi
              ? <span className="form-error">⚠ {fieldErrors.bitisTarihi}</span>
              : form.bitisTarihi && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatTarih(form.bitisTarihi)}</span>}
          </div>

          {gun !== null && gun > 0 && (
            <div className="form-group full">
              <div style={{
                background: "var(--teal-glow)", border: "1px solid rgba(0,180,216,0.25)",
                borderRadius: "var(--radius-sm)", padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 10
              }}>
                <span style={{ fontSize: 20 }}>📅</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--teal-dark)" }}>
                  Toplam <strong>{gun} iş günü</strong> izin talep edilecek.
                </span>
              </div>
            </div>
          )}

          <div className="form-group full">
            <label className="form-label">Açıklama (İsteğe Bağlı)</label>
            <textarea
              className="form-textarea"
              name="aciklama"
              value={form.aciklama}
              onChange={handleChange}
              placeholder="İzin gerekçenizi kısaca belirtebilirsiniz..."
              rows={3}
            />
          </div>
        </div>

        <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "⏳ Gönderiliyor..." : "📤 Talep Gönder"}
          </button>
        </div>
      </div>
    </div>
  );
}
