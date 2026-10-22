import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Profile({ sidebarOpen, isDesktop }) {
  // State untuk data profil wilayah
  const [formData, setFormData] = useState({
    alamatSekretariat: '',
    kecamatan: '',
    kelurahan: '',
    ketuaRt: '',
    kota: '',
    rtNumber: '',
    rwNumber: ''
  });

  const [loading, setLoading] = useState(true);

  // Posisi kiri reaktif mengikuti status sidebar
  const currentLeft = isDesktop ? (sidebarOpen ? '260px' : '70px') : '0px';

  // Ambil data dari Firestore saat halaman dimuat
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const docRef = doc(db, 'settings', 'profilWilayah');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        }
      } catch (error) {
        console.error("Gagal memuat profil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

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
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* KONTEN UTAMA */}
      <div style={{
        maxWidth: '750px',
        margin: '0 auto',
        boxSizing: 'border-box',
        marginBottom: '100px'
      }}>
        {/* HEADER / JUDUL HALAMAN */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>
            🏢 Informasi Profil & Wilayah RT
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
            Detail data administratif wilayah rukun tetangga saat ini.
          </p>
        </div>

        {/* KARTU UTAMA ELEGAN */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#64748b', fontSize: '13px' }}>
              Memuat data profil wilayah...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Baris 1: Nomor RT & Nomor RW (Grid 2 Kolom) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={cardItemStyle}>
                  <span style={labelStyle}>NOMOR RT</span>
                  <div style={valueStyle}>
                    <span style={{ fontSize: '16px' }}>📌</span> {formData.rtNumber || '-'}
                  </div>
                </div>
                <div style={cardItemStyle}>
                  <span style={labelStyle}>NOMOR RW</span>
                  <div style={valueStyle}>
                    <span style={{ fontSize: '16px' }}>📍</span> {formData.rwNumber || '-'}
                  </div>
                </div>
              </div>

              {/* Baris 2: Nama Ketua RT */}
              <div style={cardItemStyle}>
                <span style={labelStyle}>NAMA KETUA RT</span>
                <div style={valueStyle}>
                  <span style={{ fontSize: '16px' }}>👤</span> {formData.ketuaRt || '-'}
                </div>
              </div>

              {/* Baris 3: Kelurahan & Kecamatan (Grid 2 Kolom) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={cardItemStyle}>
                  <span style={labelStyle}>KELURAHAN / DESA</span>
                  <div style={valueStyle}>
                    <span style={{ fontSize: '16px' }}>🏘️</span> {formData.kelurahan || '-'}
                  </div>
                </div>
                <div style={cardItemStyle}>
                  <span style={labelStyle}>KECAMATAN</span>
                  <div style={valueStyle}>
                    <span style={{ fontSize: '16px' }}>🏙️</span> {formData.kecamatan || '-'}
                  </div>
                </div>
              </div>

              {/* Baris 4: Kota / Kabupaten */}
              <div style={cardItemStyle}>
                <span style={labelStyle}>KOTA / KABUPATEN</span>
                <div style={valueStyle}>
                  <span style={{ fontSize: '16px' }}>🏛️</span> {formData.kota || '-'}
                </div>
              </div>

              {/* Baris 5: Alamat Sekretariat */}
              <div style={cardItemStyle}>
                <span style={labelStyle}>ALAMAT SEKRETARIAT / LOKASI</span>
                <div style={{ ...valueStyle, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '16px', marginTop: '2px' }}>🏠</span> 
                  <span style={{ lineHeight: '1.5' }}>{formData.alamatSekretariat || '-'}</span>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Styling Modern, Smooth, & Elegan (Bukan Kotak Input Kaku)
const cardItemStyle = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '14px 18px',
  border: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  transition: 'all 0.2s ease'
};

const labelStyle = {
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.5px',
  color: '#64748b'
};

const valueStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#1e293b',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  wordBreak: 'break-word'
};