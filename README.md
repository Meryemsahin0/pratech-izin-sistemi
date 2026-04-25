Pratech — İzin Yönetim Sistemi (V1.0)

ÇALIŞTIRMA
Backend Hazırlığı

Backend tarafında veriler db.json üzerinde tutuluyor.
cd backend
npm install
npm run dev  # nodemon ile auto-reload aktif olur
Not: API varsayılan olarak http://localhost:3001 üzerinden hizmet verir.

Arayüzü ayağa kaldırmak için ayrı bir terminal sekmesi kullanın:
cd frontend
npm install
npm start
Uygulama otomatik olarak http://localhost:3000 adresinde açılacaktır.


Şirket içi izin süreçlerini dijitalleştirmek için geliştirdiğim, personelin talep oluşturabildiği, yöneticinin ise bu talepleri tek bir panelden yönetebildiği (Onay/Red) pratik bir web modülü.
Proje Mimarisi

Dosya yapısını mümkün olduğunca temiz ve modüler tutmaya çalıştım:
pratech-izin/
├── backend/
│   ├── server.js       # Express API (Tüm logic burada)
│   ├── db.json         # Basit JSON veritabanı
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx     # Route yönetim merkezi
│   │   ├── api.js      # Axios instance ve istekler
│   │   └── pages/      # Personel ve Yönetici view'ları
│   └── package.json
└── README.md
Kullanılan Teknolojiler

Hızlı prototipleme ve performans için aşağıdaki stack'i tercih ettim:

    Frontend: React 18 & React Router v6

    Backend: Node.js & Express

    Veri Yönetimi: JSON (Geliştirme kolaylığı için)

    Stil: Custom Vanilla CSS (Harici kütüphane bağımlılığını azaltmak için)

    HTTP: Axios

