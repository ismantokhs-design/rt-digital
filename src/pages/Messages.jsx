import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';

export default function Messages({ sidebarOpen, isDesktop }) {
  const [messagesList, setMessagesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Form (Tambah / Edit Pesan)
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Pengaduan');
  const [saving, setSaving] = useState(false);

  // State Toast Notification
  const [toast, setToast] = useState({ show: false, text: '', type: 'success' });

  const currentUser = auth.currentUser;
  const currentLeft = isDesktop ? (sidebarOpen ? '260px' : '70px') : '0px';

  const showToastMessage = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast({ show: false, text: '', type: 'success' });
    }, 3000);
  };

  // Ambil data pesan dari Firestore (hanya milik akun/user yang sedang login)
  const fetchMessages = async () => {
    try {
      const userId = currentUser ? currentUser.uid : 'guest-user';
      const q = query(collection(db, 'messages'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Urutkan dari yang terbaru
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setMessagesList(list);
    } catch (error) {
      console.error("Gagal memuat pesan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [currentUser]);

  // Buka Modal Tambah Pesan
  const handleOpenAdd = () => {
    setEditingId(null);
    setSubject('');
    setContent('');
    setCategory('Pengaduan');
    setShowModal(true);
  };

  // Buka Modal Edit Pesan
  const handleOpenEdit = (item) => {
    // Validasi tambahan: Jika sudah ditanggapi, cegah edit
    if (item.status && item.status !== 'Menunggu Tanggapan') {
      showToastMessage('Pesan yang sudah ditanggapi tidak dapat diubah.', 'error');
      return;
    }
    setEditingId(item.id);
    setSubject(item.subject || '');
    setContent(item.content || '');
    setCategory(item.category || 'Pengaduan');
    setShowModal(true);
  };

  // Simpan Pesan (Tambah / Edit) ke Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;
    setSaving(true);

    try {
      const userId = currentUser ? currentUser.uid : 'guest-user';
      const userName = currentUser ? (currentUser.displayName || 'Warga') : 'Tamu';

      const payload = {
        userId,
        userName,
        subject,
        content,
        category,
        status: 'Menunggu Tanggapan',
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        const docRef = doc(db, 'messages', editingId);
        await updateDoc(docRef, payload);
        showToastMessage('Pesan berhasil diperbarui!', 'success');
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'messages'), payload);
        showToastMessage('Pesan berhasil dikirim!', 'success');
      }

      setShowModal(false);
      fetchMessages();
    } catch (error) {
      console.error("Gagal menyimpan pesan:", error);
      showToastMessage('Terjadi kesalahan saat menyimpan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Hapus Pesan
  const handleDelete = async (id, status) => {
    if (status && status !== 'Menunggu Tanggapan') {
      showToastMessage('Pesan yang sudah ditanggapi tidak dapat dihapus.', 'error');
      return;
    }

    if (window.confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
      try {
        await deleteDoc(doc(db, 'messages', id));
        showToastMessage('Pesan berhasil dihapus!', 'success');
        fetchMessages();
      } catch (error) {
        console.error("Gagal menghapus:", error);
        showToastMessage('Gagal menghapus data.', 'error');
      }
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

      <div style={{ maxWidth: '800px', margin: '0 auto', boxSizing: 'border-box', marginBottom: '100px' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>
              💬 Pesan, Aspirasi & Pengaduan
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Sampaikan pengaduan atau pesan kepada pengurus RT. Pesan yang sudah ditanggapi tidak dapat diubah atau dihapus.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            style={{
              backgroundColor: '#0f766e',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)',
              flexShrink: 0
            }}
          >
            + Tulis Pesan
          </button>
        </div>

        {/* DAFTAR RIWAYAT PESAN */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>
            Memuat riwayat pesan...
          </div>
        ) : messagesList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            Belum ada pesan yang Anda kirim. Klik tombol "+ Tulis Pesan" di atas.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messagesList.map((item) => {
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
                      <span style={{ fontSize: '10px', backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #ccfbf1', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                        {item.category}
                      </span>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: '8px 0 2px 0' }}>
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
                      borderRadius: '8px' 
                    }}>
                      {statusPesan}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                    {item.content}
                  </p>

                  {/* Tombol Edit & Hapus (Hanya muncul jika status masih "Menunggu Tanggapan") */}
                  {isPending && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '4px' }}>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        style={{ backgroundColor: '#fef9c3', color: '#854d0e', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.status)}
                        style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL FORM TAMBAH / EDIT PESAN */}
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
              {editingId ? 'Edit Pesan / Pengaduan' : 'Tulis Pesan Baru'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                  Kategori Pesan
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none', backgroundColor: 'white' }}
                >
                  <option value="Pengaduan">Pengaduan Warga</option>
                  <option value="Aspirasi">Aspirasi & Saran</option>
                  <option value="Permintaan Surat">Permintaan Surat Pengantar</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                  Subjek / Perihal
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Misal: Perbaikan Lampu Jalan RT 01"
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                  Isi Pesan
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan isi pesan atau pengaduan secara lengkap..."
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
                {saving ? 'Mengirim...' : 'Kirim Pesan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}