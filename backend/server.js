const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, "db.json");

// Middleware
app.use(cors());
app.use(express.json());

// DB helpers
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ izinler: [] }));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Validation helper
function validateIzinTalebi({ adSoyad, izinTuru, baslangicTarihi, bitisTarihi }) {
  const errors = [];
  if (!adSoyad || adSoyad.trim().length < 2)
    errors.push("Ad Soyad alanı zorunludur (en az 2 karakter).");
  if (!izinTuru)
    errors.push("İzin türü seçilmesi zorunludur.");
  if (!baslangicTarihi)
    errors.push("Başlangıç tarihi seçilmesi zorunludur.");
  if (!bitisTarihi)
    errors.push("Bitiş tarihi seçilmesi zorunludur.");
  if (baslangicTarihi && bitisTarihi && new Date(baslangicTarihi) > new Date(bitisTarihi))
    errors.push("Başlangıç tarihi, bitiş tarihinden sonra olamaz.");
  return errors;
}

// POST /izin-talep
app.post("/izin-talep", (req, res) => {
  const { adSoyad, izinTuru, baslangicTarihi, bitisTarihi, aciklama } = req.body;

  const errors = validateIzinTalebi({ adSoyad, izinTuru, baslangicTarihi, bitisTarihi });
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const db = readDB();
  const yeniTalep = {
    id: uuidv4(),
    adSoyad: adSoyad.trim(),
    izinTuru,
    baslangicTarihi,
    bitisTarihi,
    aciklama: aciklama ? aciklama.trim() : "",
    durum: "Beklemede",
    olusturmaTarihi: new Date().toISOString(),
  };

  db.izinler.push(yeniTalep);
  writeDB(db);

  return res.status(201).json({ success: true, data: yeniTalep });
});

// GET /izinler
app.get("/izinler", (req, res) => {
  const db = readDB();
  const sorted = [...db.izinler].sort(
    (a, b) => new Date(b.olusturmaTarihi) - new Date(a.olusturmaTarihi)
  );
  return res.json({ success: true, data: sorted });
});

// PUT /izin-durum/:id
app.put("/izin-durum/:id", (req, res) => {
  const { id } = req.params;
  const { durum } = req.body;

  const gecerliDurumlar = ["Onaylandı", "Reddedildi"];
  if (!durum || !gecerliDurumlar.includes(durum)) {
    return res.status(400).json({
      success: false,
      errors: [`Geçersiz durum. Geçerli değerler: ${gecerliDurumlar.join(", ")}`],
    });
  }

  const db = readDB();
  const index = db.izinler.findIndex((i) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, errors: ["Talep bulunamadı."] });
  }

  db.izinler[index].durum = durum;
  db.izinler[index].guncellenmeTarihi = new Date().toISOString();
  writeDB(db);

  return res.json({ success: true, data: db.izinler[index] });
});
// Ana dizine girildiğinde boş hata sayfası yerine anlamlı bir mesaj döner
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Pratech İzin Yönetim Sistemi API",
    status: "Active",
    version: "1.0.0",
    endpoints: ["/izinler"]
  });
});
app.listen(PORT, () => {
  console.log(`✅ Pratech İzin API — http://localhost:${PORT}`);
});
