import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export default function Rapat({ sidebarOpen, isDesktop }) {
  const [rapatList, setRapatList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Modal Form (Tambah / Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [judul, setJudul] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [kategori, setKategori] = useState('Rapat Pleno RT');
  const [saving, setSaving] = useState(false);

  // Ref untuk area editor rich text
  const editorRef = useRef(null);

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

  // Ambil data notulen rapat dari Firestore (koleksi 'rapat')
  const fetchRapat = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'rapat'));
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setRapatList(list);
    } catch (error) {
      console.error("Gagal memuat data rapat:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRapat();
  }, []);

  // Fungsi Eksekusi Perintah Formatting (Bold, Italic, Underline, List, Alignment)
  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Buka Modal Tambah
  const handleOpenAdd = () => {
    setEditingId(null);
    setJudul('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setKategori('Rapat Pleno RT');
    setShowModal(true);
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = '';
    }, 100);
  };

  // Buka Modal Edit
  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setJudul(item.judul || '');
    setTanggal(item.tanggal || new Date().toISOString().split('T')[0]);
    setKategori(item.kategori || 'Rapat Pleno RT');
    setShowModal(true);
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = item.notulen || '';
    }, 100);
  };

  // Simpan Notulen Rapat ke Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    const notulenHtml = editorRef.current ? editorRef.current.innerHTML : '';
    if (!judul.trim() || !notulenHtml.trim()) return;
    setSaving(true);

    try {
      const authorName = currentUser ? (currentUser.displayName || 'Pengurus RT') : 'Admin RT';

      const payload = {
        judul,
        tanggal,
        kategori,
        notulen: notulenHtml, // Menyimpan format HTML (Bold, Miring, Underline, List, Alignment)
        authorName,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        const docRef = doc(db, 'rapat', editingId);
        await updateDoc(docRef, payload);
        showToastMessage('Notulen rapat berhasil diperbarui!', 'success');
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'rapat'), payload);
        showToastMessage('Notulen rapat berhasil disimpan!', 'success');
      }

      setShowModal(false);
      fetchRapat();
    } catch (error) {
      console.error("Gagal menyimpan notulen:", error);
      showToastMessage('Terjadi kesalahan saat menyimpan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Hapus Notulen Rapat
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus notulen rapat ini?')) {
      try {
        await deleteDoc(doc(db, 'rapat', id));
        showToastMessage('Notulen rapat berhasil dihapus!', 'success');
        fetchRapat();
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
        .rich-editor-content ul { list-style-type: disc; margin-left: 20px; }
        .rich-editor-content ol { list-style-type: decimal; margin-left: 20px; }
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

      {/* KARTU KONTEN UTAMA */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        border: '1px solid #f1f5f9',
        maxWidth: '900px',
        margin: '0 auto',
        marginBottom: '100px',
        boxSizing: 'border-box'
      }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>
              📢 Notulen & Hasil Rapat Warga
            </h1>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
              Catat dan arsipkan hasil keputusan rapat rukun tetangga.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            style={{
              backgroundColor: '#0f766e',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)',
              flexShrink: 0
            }}
          >
            + Tulis Notulen Rapat
          </button>
        </div>

        {/* DAFTAR NOTULEN RAPAT */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>
            Memuat data notulen rapat...
          </div>
        ) : rapatList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>
            Belum ada notulen rapat yang dicatat. Klik tombol "+ Tulis Notulen Rapat" di atas.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {rapatList.map((item) => (
              <div key={item.id} style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '18px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                        {item.kategori || 'Rapat Pleno RT'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        📅 {item.tanggal}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                      {item.judul}
                    </h3>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Pencatat: <strong>{item.authorName || 'Pengurus RT'}</strong>
                  </span>
                </div>

                {/* Render HTML Notulen dengan format (Bold, Miring, Underline, List, Alignment) */}
                <div 
                  className="rich-editor-content"
                  style={{ fontSize: '12px', color: '#334155', lineHeight: '1.6', backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  dangerouslySetInnerHTML={{ __html: item.notulen }}
                />

                {/* TOMBOL AKSI (EDIT & HAPUS) */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '4px' }}>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    style={{ backgroundColor: '#fef9c3', color: '#854d0e', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL FORM TAMBAH / EDIT NOTULEN RAPAT */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 2000, padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '540px',
            padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', boxSizing: 'border-box', position: 'relative',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}>
              ✕
            </button>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              {editingId ? 'Edit Notulen Rapat' : 'Tulis Notulen Rapat Baru'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Kategori Rapat</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  style={{ ...inputStyle, backgroundColor: 'white' }}
                >
                  <option value="Rapat Pleno RT">Rapat Pleno RT</option>
                  <option value="Rapat Pengurus">Rapat Pengurus</option>
                  <option value="Rapat Keamanan">Rapat Keamanan & Ronda</option>
                  <option value="Rapat Kegiatan / PHBN">Rapat Kegiatan / PHBN</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Judul / Topik Rapat</label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Persiapan Kerja Bakti Bulanan"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Tanggal Pelaksanaan</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              {/* EDITOR FORMATTING TOOLBAR & CONTENTEDITABLE AREA */}
              <div>
                <label style={labelStyle}>Isi Notulen & Hasil Keputusan</label>
                
                {/* TOOLBAR FORMATTING */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '8px 8px 0 0', border: '1px solid #cbd5e1', borderBottom: 'none' }}>
                  <button type="button" onClick={() => handleFormat('bold')} style={toolbarBtnStyle} title="Bold"><b>B</b></button>
                  <button type="button" onClick={() => handleFormat('italic')} style={toolbarBtnStyle} title="Italic"><i>I</i></button>
                  <button type="button" onClick={() => handleFormat('underline')} style={toolbarBtnStyle} title="Underline"><u>U</u></button>
                  
                  <div style={{ width: '1px', backgroundColor: '#cbd5e1', margin: '0 4px' }} />

                  <button type="button" onClick={() => handleFormat('insertOrderedList')} style={toolbarBtnStyle} title="Nomor (1, 2, 3...)">1.</button>
                  <button type="button" onClick={() => handleFormat('insertUnorderedList')} style={toolbarBtnStyle} title="Bullet List">•</button>

                  <div style={{ width: '1px', backgroundColor: '#cbd5e1', margin: '0 4px' }} />

                  <button type="button" onClick={() => handleFormat('justifyLeft')} style={toolbarBtnStyle} title="Rata Kiri">⬅</button>
                  <button type="button" onClick={() => handleFormat('justifyCenter')} style={toolbarBtnStyle} title="Rata Tengah">⬌</button>
                  <button type="button" onClick={() => handleFormat('justifyRight')} style={toolbarBtnStyle} title="Rata Kanan">➡</button>
                  <button type="button" onClick={() => handleFormat('justifyFull')} style={toolbarBtnStyle} title="Rata Kanan-Kiri">☷</button>
                </div>

                {/* CONTENTEDITABLE INPUT AREA */}
                <div
                  ref={editorRef}
                  contentEditable={true}
                  style={{
                    width: '100%',
                    minHeight: '140px',
                    padding: '10px 14px',
                    borderRadius: '0 0 8px 8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#1e293b',
                    backgroundColor: '#f8fafc',
                    boxSizing: 'border-box',
                    outline: 'none',
                    overflowY: 'auto'
                  }}
                  placeholder="Tuliskan poin-poin pembahasan, keputusan, dan tindak lanjut rapat secara rinci..."
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
                {saving ? 'Menyimpan...' : 'Simpan Notulen Rapat'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Styling Pendukung Form & Toolbar
const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#334155',
  marginBottom: '4px'
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

const toolbarBtnStyle = {
  backgroundColor: 'white',
  border: '1px solid #cbd5e1',
  borderRadius: '4px',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#334155',
  cursor: 'pointer'
};