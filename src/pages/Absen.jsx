import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Absen({ sidebarOpen, isDesktop }) {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, text: '', type: 'success' });
  
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const currentLeft = isDesktop ? (sidebarOpen ? '260px' : '70px') : '0px';

  const showToastMessage = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast({ show: false, text: '', type: 'success' });
    }, 3000);
  };

  // Fungsi untuk membuka kamera laptop
  const startCamera = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Menggunakan kamera belakang jika di HP, atau webcam utama di laptop
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Gagal mengakses kamera:", err);
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera (permission) telah diaktifkan di browser Anda.');
      setScanning(false);
    }
  };

  // Fungsi untuk menutup kamera
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setScanning(false);
  };

  // Matikan kamera saat pindah halaman
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Simpan hasil absensi ke Firestore
  const handleRecordAttendance = async (dataCode) => {
    stopCamera();
    setScanResult(dataCode);
    setLoading(true);

    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'absensi'), {
        userId: user ? user.uid : 'guest',
        userName: user ? (user.displayName || 'Ismanto') : 'Tamu',
        qrData: dataCode,
        timestamp: serverTimestamp()
      });

      showToastMessage('Absensi berhasil direkam!', 'success');
    } catch (error) {
      console.error("Gagal menyimpan absensi:", error);
      showToastMessage('Gagal mencatat absensi.', 'error');
    } finally {
      setLoading(false);
    }
  };

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
      padding: '20px'
    }}>
      <style>{`
        ::-webkit-scrollbar { display: none; }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: isDesktop ? '130px' : '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: toast.type === 'success' ? '#16a34a' : '#dc2626',
          border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          padding: '10px 20px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 9999,
          animation: 'fadeInOut 3s ease forwards'
        }}>
          {toast.text}
        </div>
      )}

      <div style={{ maxWidth: '750px', margin: '0 auto', boxSizing: 'border-box', marginBottom: '100px' }}>
        {/* HEADER HALAMAN */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>
            📷 Pemindai QR Code (Absensi)
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
            Arahkan kamera ke QR Code kegiatan atau sekretariat untuk melakukan absensi kehadiran.
          </p>
        </div>

        {/* KARTU UTAMA SCANNER */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '20px'
        }}>
          {/* Area Kamera / Viewfinder */}
          <div style={{
            width: '100%',
            maxWidth: '320px',
            height: '240px',
            backgroundColor: '#0f172a',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.3)'
          }}>
            {scanning ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', padding: '0 20px' }}>
                <div style={{ fontSize: '36px' }}>📷</div>
                <span>Kamera belum aktif. Klik tombol di bawah untuk mulai membuka kamera.</span>
              </div>
            )}
          </div>

          {/* Tombol Kontrol Scanner */}
          <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '320px' }}>
            {!scanning ? (
              <button
                onClick={startCamera}
                style={{
                  flex: 1,
                  backgroundColor: '#0f766e',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)'
                }}
              >
                🚀 Buka Kamera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                style={{
                  flex: 1,
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                }}
              >
                ❌ Tutup Kamera
              </button>
            )}
          </div>

          {/* Tombol Simulasi / Konfirmasi Kehadiran */}
          {scanning && (
            <button
              onClick={() => handleRecordAttendance('HADIR-RT-DIGITAL-' + Date.now())}
              disabled={loading}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Menyimpan...' : '✅ Konfirmasi Absen (Simulasi Scan)'}
            </button>
          )}

          {/* Hasil Scan Terakhir */}
          {scanResult && (
            <div style={{
              width: '100%',
              backgroundColor: '#f8fafc',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              textAlign: 'left'
            }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                STATUS ABSENSI TERAKHIR:
              </span>
              <span style={{ fontSize: '12px', color: '#16a34a', wordBreak: 'break-all', fontWeight: 'bold' }}>
                Berhasil Tercatat ({scanResult})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}