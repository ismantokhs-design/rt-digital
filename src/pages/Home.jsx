import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { signOut, updatePassword, updateProfile } from 'firebase/auth';

export default function Home({ sidebarOpen, isDesktop }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const dropdownRef = useRef(null);

  // State profil wilayah dari Firestore
  const [profil, setProfil] = useState({
    rtNumber: '',
    rwNumber: '',
    ketuaRt: '',
    kelurahan: '',
    kecamatan: '',
    kota: ''
  });

  // State untuk Running Text dari Firestore
  const [runningText, setRunningText] = useState({
    text: '',
    active: true
  });

  // State untuk Slider Banner dari Firestore
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // State untuk form Edit Profil (Nama, Nomor HP, Password)
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil profil wilayah
        const docRef = doc(db, 'settings', 'profilWilayah');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfil(docSnap.data());
        }

        // Ambil data Running Text dari settings/runningText
        const runningTextRef = doc(db, 'settings', 'runningText');
        const runningTextSnap = await getDoc(runningTextRef);
        if (runningTextSnap.exists()) {
          const rtData = runningTextSnap.data();
          setRunningText({
            text: rtData.text || rtData.content || '',
            active: rtData.active ?? true
          });
        }

        // Ambil data Banner dari Firestore koleksi 'banners' (filter yang aktif saja)
        const bannerSnapshot = await getDocs(collection(db, 'banners'));
        const bannerList = bannerSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(item => item.active !== false); // Ambil yang aktif
        setBanners(bannerList);

        // Ambil data user dari Firestore collection 'users' jika ada
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setEditName(userData.name || currentUser.displayName || '');
            setEditPhone(userData.phone || '');
          } else {
            setEditName(currentUser.displayName || 'Ismanto');
          }
        }
      } catch (error) {
        console.error("Gagal memuat data:", error);
      }
    };
    fetchData();

    // Event listener untuk menutup dropdown jika klik di luar area
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [currentUser]);

  // Efek Slideshow Banner Otomatis setiap 4 detik
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  // Handle Logout / Keluar
  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
      try {
        await signOut(auth);
        navigate('/login');
      } catch (error) {
        console.error("Gagal keluar:", error);
      }
    }
  };

  // Handle Simpan Edit Profil (Nama, No HP, Password)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentUser) {
        // 1. Update Display Name di Firebase Auth
        await updateProfile(currentUser, { displayName: editName });

        // 2. Update Password jika diisi
        if (editPassword.trim() !== '') {
          await updatePassword(currentUser, editPassword);
        }

        // 3. Update Firestore collection 'users' (name & phone)
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          name: editName,
          phone: editPhone,
          updatedAt: new Date()
        });

        alert('Profil berhasil diperbarui!');
        setShowEditModal(false);
        setEditPassword('');
      }
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);
      alert('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentLeft = isDesktop ? (sidebarOpen ? '260px' : '70px') : '0px';

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      position: isDesktop ? 'fixed' : 'relative',
      top: isDesktop ? '110px' : '0px',
      left: currentLeft,
      right: 0,
      bottom: 0,
      transition: 'left 0.3s ease, top 0.3s ease',
      overflowY: 'auto',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box',
      padding: '16px 24px'
    }}>
      <style>{`
        ::-webkit-scrollbar {
          display: none;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .marquee-container {
          overflow: hidden;
          white-space: nowrap;
          box-sizing: border-box;
        }
        .marquee-text {
          display: inline-block;
          animation: marquee 18s linear infinite;
        }
      `}</style>

      {/* KARTU PROFIL WILAYAH (Khusus HP) */}
      {!isDesktop && (
        <div style={{
          backgroundColor: '#0f766e',
          color: '#ffffff',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '16px',
          boxSizing: 'border-box',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          position: 'relative'
        }}>
          <div style={{ color: '#ffffff', flex: 1, minWidth: 0, marginRight: '10px' }}>
            <span style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '10px', fontWeight: '500', color: '#ffffff', display: 'inline-block' }}>
              Ketua RT ({profil.ketuaRt}) — ({profil.rtNumber} / {profil.rwNumber})
            </span>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '10px 0 4px 0', color: '#ffffff' }}>
              Halo, {editName || 'Ismanto'}! 👋
            </h1>
            <p style={{ fontSize: '11px', color: '#ccfbf1', margin: 0, wordBreak: 'break-word' }}>
              Kel. {profil.kelurahan}, Kec. {profil.kecamatan}, Kab. {profil.kota}
            </p>
          </div>

          {/* Tombol Notifikasi & Dropdown Profil */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, position: 'relative' }} ref={dropdownRef}>
            <button 
              onClick={() => alert('Notifikasi')} 
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Notifikasi"
            >
              🔔
            </button>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Menu Pengguna"
            >
              {editName ? editName.charAt(0).toUpperCase() : 'I'}
            </button>

            {/* BOX DROPDOWN MENU PENGGUNA */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '40px',
                right: 0,
                width: '220px',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                zIndex: 1005,
                overflow: 'hidden',
                border: '1px solid #cbd5e1'
              }}>
                <div style={{ padding: '12px 16px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 2px 0', color: '#0f766e' }}>
                    {editName || 'Ismanto'}
                  </p>
                  <p style={{ fontSize: '10px', color: '#475569', margin: 0, wordBreak: 'break-all' }}>
                    {currentUser?.email || 'ismanto@example.com'}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
                  <button
                    onClick={() => { setDropdownOpen(false); setShowEditModal(true); }}
                    style={{ textAlign: 'left', background: 'none', border: 'none', padding: '10px 16px', fontSize: '12px', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    ✏️ Edit Profil
                  </button>
                  <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }}></div>
                  <button
                    onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    style={{ textAlign: 'left', background: 'none', border: 'none', padding: '10px 16px', fontSize: '12px', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    🚪 Keluar (Logout)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SLIDER BANNER OTOMATIS (Tampil di atas running text jika ada banner) */}
      {banners.length > 0 && (
        <div style={{
          width: '100%',
          height: '140px',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '14px',
          position: 'relative',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          backgroundColor: '#e2e8f0'
        }}>
          <img
            src={banners[currentBannerIndex]?.imageUrl || 'https://via.placeholder.com/600x200'}
            alt={banners[currentBannerIndex]?.title || 'Banner'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'opacity 0.5s ease-in-out'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            padding: '10px 14px',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {banners[currentBannerIndex]?.title}
          </div>

          {/* Indikator titik slide */}
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            gap: '4px'
          }}>
            {banners.map((_, idx) => (
              <div key={idx} style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: idx === currentBannerIndex ? '#ffffff' : 'rgba(255,255,255,0.4)'
              }} />
            ))}
          </div>
        </div>
      )}

      {/* RUNNING TEXT BERJALAN (Tampil jika aktif di database) */}
      {runningText.active && runningText.text && (
        <div style={{
          backgroundColor: '#f0fdfa',
          border: '1px solid #ccfbf1',
          borderRadius: '12px',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxSizing: 'border-box',
          boxShadow: '0 2px 6px rgba(15, 118, 110, 0.04)'
        }}>
          <span style={{ fontSize: '14px', flexShrink: '0' }}>📢</span>
          <div className="marquee-container" style={{ flex: 1 }}>
            <div className="marquee-text" style={{ fontSize: '12px', color: '#0f766e', fontWeight: '500' }}>
              {runningText.text}
            </div>
          </div>
        </div>
      )}

      {/* TOMBOL MEMANJANG: ABSEN SEKARANG (Mengarahkan ke halaman Absen.jsx) */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => navigate('/absen')}
          style={{
            width: '100%',
            backgroundColor: '#0f766e',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
            transition: 'transform 0.2s, background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#0d6b63';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#0f766e';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>📋</span> Absen Sekarang
        </button>
      </div>

      {/* POPUP / MODAL KECIL EDIT PROFIL (Nama, No HP, Password) */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '380px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f766e', margin: '0 0 16px 0' }}>
              Edit Profil Pengguna
            </h3>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Nama Lengkap</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Nomor HP</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Contoh: 089602510491"
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Password Baru (Opsional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak diubah"
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#334155', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KONTEN UTAMA HALAMAN BERANDA */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxSizing: 'border-box',
        paddingBottom: '90px'
      }}>
        {/* Tempat kartu atau modul beranda selanjutnya */}
      </div>
    </div>
  );
}