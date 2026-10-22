import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export default function LihatPesan({ sidebarOpen, isDesktop }) {
  const [messagesList, setMessagesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('belum'); // 'belum' atau 'sudah'

  // State untuk Modal Tanggapi
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [tanggapan, setTanggapan] = useState('');
  const [saving, setSaving] = useState(false);

  // State Toast Notification
  const [toast, setToast] = useState({ show: false, text: '', type: 'success' });

  const currentLeft = isDesktop ? (sidebarOpen ? '260px' : '70px') : '0px';

  const showToastMessage = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast({ show: false, text: '', type: 'success' });
    }, 3000);
  };

  // Ambil seluruh pesan dari koleksi 'messages' di Firestore
  const fetchAllMessages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'messages'));
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Urutkan dari yang terbaru
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setMessagesList(list);
    } catch (error) {
      console.error("Gagal memuat daftar pesan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMessages();
  }, []);

  // Format Tanggal dari Firestore Timestamp
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return 'Baru saja';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Buka Modal Tanggapi
  const handleOpenTanggapi = (item) => {
    setSelectedMessage(item);
    setTanggapan(item.tanggapan || '');
    setShowModal(true);
  };

  // Simpan Tanggapan Admin ke Firestore
  const handleSubmitTanggapan = async (e) => {
    e.preventDefault();
    if (!selectedMessage || !tanggapan.trim()) return;
    setSaving(true);

    try {
      const docRef = doc(db, 'messages', selectedMessage.id);
      await updateDoc(docRef, {
        status: 'Sudah Ditanggapi',
        tanggapan: tanggapan.trim(),
        respondedAt: serverTimestamp()
      });

      showToastMessage('Tanggapan berhasil dikirim!', 'success');
      setShowModal(false);
      fetchAllMessages();
    } catch (error) {
      console.error("Gagal mengirim tanggapan:", error);
      showToastMessage('Terjadi kesalahan saat menyimpan tanggapan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filter pesan berdasarkan Tab aktif
  const filteredMessages = messagesList.filter(item => {
    const status = item.status || 'Menunggu Tanggapan';
    if (activeTab === 'belum') {
      return status === 'Menunggu Tanggapan';
    } else {
      return status === 'Sudah Ditanggapi';
    }
  });

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

      <div style={{ maxWidth: '850px', margin: '0 auto', boxSizing: 'border-box', marginBottom: '100px' }}>
        {/* HEADER */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>
            📥 Daftar Pesan & Aspirasi Warga
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
            Kelola pengaduan dan aspirasi warga berdasarkan status penanganan.
          </p>
        </div>

        {/* TAB NAVIGATION */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          <button
            onClick={() => setActiveTab('belum')}
            style={{
              backgroundColor: activeTab === 'belum' ? '#0f766e' : '#f1f5f9',
              color: activeTab === 'belum' ? 'white' : '#64748b',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ⏳ Belum Ditanggapi ({messagesList.filter(m => (m.status || 'Menunggu Tanggapan') === 'Menunggu Tanggapan').length})
          </button>
          <button
            onClick={() => setActiveTab('sudah')}
            style={{
              backgroundColor: activeTab === 'sudah' ? '#0f766e' : '#f1f5f9',
              color: activeTab === 'sudah' ? 'white' : '#64748b',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ✅ Sudah Ditanggapi ({messagesList.filter(m => m.status === 'Sudah Ditanggapi').length})
          </button>
        </div>

        {/* DAFTAR PESAN BERDASARKAN TAB */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>
            Memuat data pesan warga...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            Tidak ada pesan pada kategori ini.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredMessages.map((item) => {
              const statusPesan = item.status || 'Menunggu Tanggapan';
              const isPending = statusPesan === 'Menunggu Tanggapan';

              return (
                <div key={item.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '18px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #ccfbf1', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                          {item.category || 'Pengaduan'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600' }}>
                          Dari: <strong style={{ color: '#1e293b' }}>{item.userName || 'Tamu'}</strong>
                        </span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                          • {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                        {item.subject}
                      </h3>
                    </div>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '600', 
                      backgroundColor: isPending ? '#eff6ff' : '#f0fdf4', 
                      color: isPending ? '#2563eb' : '#16a34a',
                      border: `1px solid ${isPending ? '#bfdbfe' : '#bbf7d0'}`,
                      padding: '3px 10px', 
                      borderRadius: '8px',
                      flexShrink: 0
                    }}>
                      {statusPesan}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.5', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    {item.content}
                  </p>

                  {/* Jika sudah ditanggapi, tampilkan kotak tanggapan */}
                  {item.tanggapan && (
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px', borderRadius: '8px', fontSize: '12px', color: '#166534' }}>
                      <strong>Tanggapan Pengurus RT:</strong>
                      <p style={{ margin: '4px 0 0 0', lineHeight: '1.4' }}>{item.tanggapan}</p>
                    </div>
                  )}

                  {/* Tombol Tanggapi */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '4px' }}>
                    <button
                      onClick={() => handleOpenTanggapi(item)}
                      style={{
                        backgroundColor: isPending ? '#0f766e' : '#e2e8f0',
                        color: isPending ? 'white' : '#334155',
                        border: 'none',
                        padding: '6px 16px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {isPending ? '✍️ Berikan Tanggapan' : '✏️ Ubah Tanggapan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL FORM TANGGAPI PESAN */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 2000, padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px',
            padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', boxSizing: 'border-box', position: 'relative'
          }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}>
              ✕
            </button>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              Tanggapi Pesan Warga
            </h3>

            {selectedMessage && (
              <div style={{ marginBottom: '14px', fontSize: '12px', color: '#475569', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong>Dari:</strong> {selectedMessage.userName || 'Tamu'}<br />
                <strong>Subjek:</strong> {selectedMessage.subject}<br />
                <strong>Pesan:</strong> {selectedMessage.content}
              </div>
            )}

            <form onSubmit={handleSubmitTanggapan} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                  Catatan / Tanggapan Pengurus RT
                </label>
                <textarea
                  value={tanggapan}
                  onChange={(e) => setTanggapan(e.target.value)}
                  placeholder="Tuliskan tanggapan atau solusi untuk warga..."
                  rows="4"
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none', resize: 'none' }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%', backgroundColor: '#0f766e', color: 'white', border: 'none',
                  padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px',
                  cursor: saving ? 'not-allowed' : 'pointer', marginTop: '6px', boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)'
                }}
              >
                {saving ? 'Mengirim...' : 'Kirim Tanggapan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}