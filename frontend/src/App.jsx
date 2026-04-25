import React from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import "./index.css";
import PersonelEkrani from "./pages/PersonelEkrani";
import YoneticiEkrani from "./pages/YoneticiEkrani";

function Topnav() {
  return (
    <nav className="topnav">
      <NavLink to="/personel" className="topnav-brand" style={{ textDecoration: "none" }}>
        <div className="topnav-logo">P</div>
        <div>
          <div className="topnav-title">Pratech</div>
          <div className="topnav-subtitle">İzin Yönetim Sistemi</div>
        </div>
      </NavLink>
      <div className="topnav-tabs">
        <NavLink
          to="/personel"
          className={({ isActive }) => `topnav-tab${isActive ? " active" : ""}`}
        >
          👤 Personel
        </NavLink>
        <NavLink
          to="/yonetici"
          className={({ isActive }) => `topnav-tab${isActive ? " active" : ""}`}
        >
          🏢 Yönetici
        </NavLink>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Topnav />
        <Routes>
          <Route path="/" element={<Navigate to="/personel" replace />} />
          <Route path="/personel" element={<PersonelEkrani />} />
          <Route path="/yonetici" element={<YoneticiEkrani />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
