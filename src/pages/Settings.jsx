import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Settings({ sidebarOpen, isDesktop }) {
  // State untuk form data pengaturan
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
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Posisi kiri reaktif mengikuti status sidebar
  const currentLeft = isDesktop ? (sidebarOpen ? '260px' : '70px') : '0px';

  // Ambil data dari Firestore saat halaman dimuat (menggunakan dokumen profilWilayah)
  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const docRef = doc(db, 'settings', 'profilWilayah');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        }
      } catch (error) {
        console.error("Gagal memuat pengaturan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettingsData();
  }, []);

  // Handle perubahan input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Simpan data ke Firestore
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const docRef = doc(db, 'settings', 'profilWilayah');
      await setDoc(docRef, {
        ...formData,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setMessage({ text: 'Pengaturan wilayah berhasil diperbarui!', type: 'success' });
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      setMessage({ text: 'Gagal menyimpan perubahan. Coba lagi.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      height: '100vh',
      position: 'fixed',
      top: isDesktop ? '110px' : '0px',
      left: currentLeft,
      right: 0,
      bottom: 0,
      transition: 'left 0.3s ease, top 0.3s ease',
      overflowY: 'auto',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box',
      padding: '24px'
    }}>
      <style>{`
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* KARTU KONTEN UTAMA DENGAN HEADER DI DALAMNYA */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        border: '1px solid #f1f5f9',
        maxWidth: '800px',
        margin: '0 auto',
        marginBottom: '80px',
        boxSizing: 'border-box'
      }}>
        {/* HEADER KECIL DI DALAM KARTU */}
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>
            🏢 Informasi Profil & Wilayah RT
          </h1>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
            Detail data administratif wilayah rukun tetangga saat ini.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
            Memuat data pengaturan...
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {message.text && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                color: message.type === 'success' ? '#16a34a' : '#dc2626',
                border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
              }}>
                {message.text}
              </div>
            )}

            {/* Baris 1: Nomor RT & Nomor RW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nomor RT</label>
                <input
                  type="text"
                  name="rtNumber"
                  value={formData.rtNumber}
                  onChange={handleChange}
                  placeholder="Contoh: RT 01"
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Nomor RW</label>
                <input
                  type="text"
                  name="rwNumber"
                  value={formData.rwNumber}
                  onChange={handleChange}
                  placeholder="Contoh: RW 03"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            {/* Baris 2: Nama Ketua RT */}
            <div>
              <label style={labelStyle}>Nama Ketua RT</label>
              <input
                type="text"
                name="ketuaRt"
                value={formData.ketuaRt}
                onChange={handleChange}
                placeholder="Nama lengkap Ketua RT"
                style={inputStyle}
                required
              />
            </div>

            {/* Baris 3: Kelurahan & Kecamatan */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Kelurahan / Desa</label>
                <input
                  type="text"
                  name="kelurahan"
                  value={formData.kelurahan}
                  onChange={handleChange}
                  placeholder="Nama Kelurahan"
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Kecamatan</label>
                <input
                  type="text"
                  name="kecamatan"
                  value={formData.kecamatan}
                  onChange={handleChange}
                  placeholder="Nama Kecamatan"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            {/* Baris 4: Kota / Kabupaten */}
            <div>
              <label style={labelStyle}>Kota / Kabupaten</label>
              <input
                type="text"
                name="kota"
                value={formData.kota}
                onChange={handleChange}
                placeholder="Nama Kota / Kabupaten"
                style={inputStyle}
                required
              />
            </div>

            {/* Baris 5: Alamat Sekretariat */}
            <div>
              <label style={labelStyle}>Alamat Sekretariat / Lokasi</label>
              <textarea
                name="alamatSekretariat"
                value={formData.alamatSekretariat}
                onChange={handleChange}
                placeholder="Alamat lengkap balai warga atau sekretariat RT"
                rows="3"
                style={{ ...inputStyle, resize: 'vertical' }}
                required
              />
            </div>

            {/* Tombol Simpan */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  backgroundColor: '#0f766e',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  transition: 'background 0.2s',
                  boxShadow: '0 2px 6px rgba(15, 118, 110, 0.2)'
                }}
              >
                {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

// Styling Pendukung Form
const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#334155',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  color: '#1e293b',
  backgroundColor: '#f8fafc',
  boxSizing: 'border-box',
  outline: 'none'
};