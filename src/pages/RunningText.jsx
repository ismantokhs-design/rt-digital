import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function RunningText({ sidebarOpen, isDesktop }) {
  const [textInput, setTextInput] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State untuk Toast Pop-up
  const [toast, setToast] = useState({ show: false, text: '', type: 'success' });

  const currentLeft = isDesktop ? (sidebarOpen ? '260px' : '70px') : '0px';

  // Ambil data Running Text dari settings/runningText
  useEffect(() => {
    const fetchRunningText = async () => {
      try {
        const docRef = doc(db, 'settings', 'runningText');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTexts(data.text || data.content || '');
          setIsActive(data.active ?? true);
        }
      } catch (error) {
        console.error("Gagal memuat running text:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRunningText();
  }, []);

  const setTexts = (val) => setTextInput(val);

  // Fungsi untuk menampilkan Toast yang otomatis hilang setelah 3 detik
  const showToastMessage = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast({ show: false, text: '', type: 'success' });
    }, 3000); // Hilang otomatis dalam 3 detik
  };

  // Handle Simpan ke settings/runningText
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    setSaving(true);

    try {
      const docRef = doc(db, 'settings', 'runningText');
      await setDoc(docRef, {
        text: textInput,
        active: isActive,
        updatedAt: serverTimestamp()
      }, { merge: true });

      showToastMessage('Running text berhasil diperbarui!', 'success');
    } catch (error) {
      console.error("Gagal menyimpan running text:", error);
      showToastMessage('Gagal menyimpan perubahan.', 'error');
    } finally {
      setSaving(false);
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
        ::-webkit-scrollbar {
          display: none;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>

      {/* TOAST POP-UP MELAYANG DI ATAS */}
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

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        boxSizing: 'border-box',
        marginBottom: '90px'
      }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0' }}>
          📢 Manajemen Running Text
        </h1>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0f766e', margin: '0 0 12px 0' }}>
            Pengaturan Teks Berjalan
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '12px' }}>
              Memuat data...
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                  Isi Teks Berjalan (Field: text)
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Contoh: Selamat datang di portal resmi RT Digital..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="isActive" style={{ fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                  Aktifkan Running Text ini di Beranda
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    backgroundColor: '#0f766e',
                    color: 'white',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}