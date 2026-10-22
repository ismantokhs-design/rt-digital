import React, { useState } from 'react';

export default function GenerateQRAbsen({ sidebarOpen, isDesktop }) {
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventName, setEventName] = useState('Rapat Rutin RT');
  const [qrGenerated, setQrGenerated] = useState(false);
  const [toast, setToast] = useState({ show: false, text: '', type: 'success' });

  const currentLeft = isDesktop ? (sidebarOpen ? '260px' : '70px') : '0px';

  const showToastMessage = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast({ show: false, text: '', type: 'success' });
    }, 3000);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!eventDate || !eventName.trim()) {
      showToastMessage('Nama acara dan tanggal harus diisi!', 'error');
      return;
    }
    setQrGenerated(true);
    showToastMessage('QR Code berhasil dibuat!', 'success');
  };

  // Data teks unik yang akan di-encode ke dalam QR Code
  const qrDataString = `RT-ABSEN-${eventDate}-${eventName.replace(/\s+/g, '-')}`;
  // Menggunakan layanan publik API pembuat QR Code (seperti goqr.me atau qrserver)
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrDataString)}`;

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
            🏷️ Generate QR Code Absen
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
            Buat kode QR khusus berdasarkan tanggal pelaksanaan acara atau rapat warga.
          </p>
        </div>

        {/* KARTU FORM GENERATOR */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                Nama / Jenis Acara
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Contoh: Rapat Pleno RT / Kerja Bakti"
                style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                Tanggal Pelaksanaan
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none' }}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: '#0f766e',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)',
                marginTop: '6px'
              }}
            >
              ✨ Buat QR Code Absen
            </button>
          </form>

          {/* HASIL PRATINJAU QR CODE */}
          {qrGenerated && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              gap: '14px',
              marginTop: '10px',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                {eventName}
              </h3>
              <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#e2e8f0', padding: '3px 10px', borderRadius: '10px' }}>
                Tanggal: {eventDate}
              </span>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #cbd5e1' }}>
                <img
                  src={qrCodeImageUrl}
                  alt="QR Code Absen"
                  style={{ width: '180px', height: '180px', display: 'block' }}
                />
              </div>

              <a
                href={qrCodeImageUrl}
                download={`QR-Absen-${eventDate}.png`}
                target="_blank"
                rel="noreferrer"
                style={{
                  backgroundColor: '#1e3a8a',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(30, 58, 138, 0.2)'
                }}
              >
                📥 Unduh Gambar QR Code
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}