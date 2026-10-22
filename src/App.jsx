import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Profile from './pages/Profile';
import Gallery from './pages/Gallery';             // 👈 Tampilan Galeri Publik (Warga)
import GalleryInput from './pages/GalleryInput';   // 👈 Form Input/Manajemen Galeri
import Banner from './pages/Banner';               // 👈 Form Input/Manajemen Banner
import Rapat from './pages/Rapat';                 // 👈 Halaman Notulen & Hasil Rapat Warga
import Warga from './pages/Warga';                 // 👈 Halaman Manajemen Warga & Kependudukan
import Absen from './pages/Absen';                 // 👈 Halaman Pemindai Absen QR Code
import GenerateQRAbsen from './pages/GenerateQRAbsen'; // 👈 Halaman Pembuat QR Code Absen
import Messages from './pages/Messages';           // 👈 Halaman Pesan, Aspirasi & Pengaduan Warga
import LihatPesan from './pages/LihatPesan';       // 👈 Halaman Admin Melihat & Menanggapi Pesan Warga
import Manajemen from './pages/Manajemen';
import UserSettings from './pages/UserSettings';
import BackupRestore from './pages/BackupRestore';
import Settings from './pages/Settings';
import Login from './pages/Login';
import RunningText from './pages/RunningText';

function LayoutWrapper() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = isLoginPage || !isDesktop ? '0px' : (isSidebarOpen ? '260px' : '70px');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {!isLoginPage && <Navbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
      <main style={{ 
        flex: 1, 
        width: '100%', 
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.3s ease',
        boxSizing: 'border-box',
        padding: 0 
      }}>
        <Routes>
          <Route path="/" element={<Home sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          <Route path="/profil" element={<Profile sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          
          {/* Rute untuk Warga / Publik melihat galeri */}
          <Route path="/galeri" element={<Gallery sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          
          {/* Rute untuk Halaman Absen / Scan QR Code */}
          <Route path="/absen" element={<Absen sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          
          {/* Rute untuk Halaman Pesan & Aspirasi Warga */}
          <Route path="/pesan" element={<Messages sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          
          <Route path="/manajemen" element={<Manajemen sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          
          {/* Rute untuk Admin mengelola galeri, banner, rapat, dan kependudukan warga */}
          <Route path="/manajemen/galeri" element={<GalleryInput sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          <Route path="/manajemen/banner" element={<Banner sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          <Route path="/manajemen/rapat" element={<Rapat sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          <Route path="/manajemen/warga" element={<Warga sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          
          {/* Rute untuk Admin membuat QR Code Absen */}
          <Route path="/manajemen/generate-qr" element={<GenerateQRAbsen sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          
          {/* Rute untuk Admin melihat dan menanggapi pesan masuk */}
          <Route path="/manajemen/lihat-pesan" element={<LihatPesan sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          
          <Route path="/setting-user" element={<UserSettings sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          <Route path="/backup-restore" element={<BackupRestore sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          <Route path="/pengaturan" element={<Settings sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          <Route path="/manajemen/running-text" element={<RunningText sidebarOpen={isSidebarOpen} isDesktop={isDesktop} />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <LayoutWrapper />
    </Router>
  );
}

export default App;