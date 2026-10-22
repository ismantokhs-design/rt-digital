import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export default function GalleryInput({ sidebarOpen, isDesktop }) {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal Form (Tambah / Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // State untuk Toast Notification yang smooth
  const [toast, setToast] = useState({ show: false, text: '', type: 'success' });

  // State untuk posisi tombol geser (Draggable)
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 140 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0 });

  const currentLeft = isDesktop ? (sidebarOpen ? '260px' : '70px') : '0px';

  // Fungsi menampilkan Toast otomatis hilang
  const showToastMessage = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast({ show: false, text: '', type: 'success' });
    }, 3000);
  };

  // Ambil data galeri dari Firestore
  const fetchGalleries = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'galleries'));
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGalleries(list);
    } catch (error) {
      console.error("Gagal memuat galeri:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  // Kompresi & Resize Foto Maks 500px
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 500;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setImageBase64(compressedBase64);
      };
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop Tombol (+)
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragRef.current = { startX: touch.clientX, startY: touch.clientY, posX: position.x, posY: position.y };
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: dragRef.current.posX + (touch.clientX - dragRef.current.startX),
      y: dragRef.current.posY + (touch.clientY - dragRef.current.startY)
    });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, posX: position.x, posY: position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: dragRef.current.posX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.posY + (e.clientY - dragRef.current.startY)
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setImageBase64('');
    setIsActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setImageBase64(item.imageUrl || '');
    setIsActive(item.active ?? true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);

    try {
      const payload = {
        title,
        imageUrl: imageBase64 || 'https://via.placeholder.com/150',
        active: isActive,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        const docRef = doc(db, 'galleries', editingId);
        await updateDoc(docRef, payload);
        showToastMessage('Galeri berhasil diperbarui!', 'success');
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'galleries'), payload);
        showToastMessage('Galeri berhasil ditambahkan!', 'success');
      }

      setShowModal(false);
      fetchGalleries();
    } catch (error) {
      console.error("Gagal menyimpan galeri:", error);
      showToastMessage('Terjadi kesalahan saat menyimpan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const docRef = doc(db, 'galleries', item.id);
      await updateDoc(docRef, { active: !(item.active ?? true) });
      fetchGalleries();
    } catch (error) {
      console.error("Gagal mengubah status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus galeri ini?')) {
      try {
        await deleteDoc(doc(db, 'galleries', id));
        showToastMessage('Galeri berhasil dihapus!', 'success');
        fetchGalleries();
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

      {/* TOAST NOTIFICATION MELAYANG */}
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
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0' }}>
          🖼️ Manajemen Galeri
        </h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>
            Memuat data galeri...
          </div>
        ) : galleries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            Belum ada galeri. Geser atau klik tombol (+) di bawah untuk menambah.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {galleries.map((item) => {
              const isActive = item.active ?? true;
              return (
                <div key={item.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <img
                        src={item.imageUrl || 'https://via.placeholder.com/150'}
                        alt={item.title}
                        style={{ width: '80px', height: '55px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </h3>
                        <span style={{ fontSize: '11px', color: isActive ? '#16a34a' : '#94a3b8', fontWeight: '600' }}>
                          {isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                    </div>

                    <div onClick={() => handleToggleActive(item)} style={{
                      width: '44px', height: '24px', backgroundColor: isActive ? '#1e3a8a' : '#cbd5e1',
                      borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0
                    }}>
                      <div style={{
                        width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%',
                        position: 'absolute', top: '2px', left: isActive ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <button onClick={() => handleOpenEdit(item)} style={{ backgroundColor: '#fef9c3', color: '#854d0e', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TOMBOL MELAYANG (+) BISA DIGESER */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={() => { if (!isDragging) handleOpenAdd(); }}
        style={{
          position: 'fixed', left: `${position.x}px`, top: `${position.y}px`,
          width: '56px', height: '56px', backgroundColor: '#dc2626', color: 'white',
          borderRadius: '50%', fontSize: '28px', fontWeight: 'bold', display: 'flex',
          alignItems: 'center', justifyContent: 'center', cursor: 'grab',
          boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)', zIndex: 1000, userSelect: 'none', touchAction: 'none'
        }}
        title="Geser atau Klik untuk Tambah Galeri"
      >
        +
      </div>

      {/* MODAL FORM TAMBAH / EDIT */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 2000, padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '400px',
            padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', boxSizing: 'border-box', position: 'relative'
          }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}>
              ✕
            </button>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              {editingId ? 'Edit Galeri' : 'Tambah Galeri Baru'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                  Judul Galeri
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Kegiatan Kerja Bakti RT"
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                  Pilih File Foto (Maksimal 500px)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ width: '100%', fontSize: '11px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
                />
                
                {imageBase64 && (
                  <div style={{ marginTop: '8px', textAlign: 'center' }}>
                    <img src={imageBase64} alt="Preview" style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="modalActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="modalActive" style={{ fontSize: '12px', color: '#334155', cursor: 'pointer' }}>
                  Aktifkan galeri ini
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%', backgroundColor: '#1e3a8a', color: 'white', border: 'none',
                  padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px',
                  cursor: saving ? 'not-allowed' : 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
                }}
              >
                {saving ? 'Menyimpan...' : 'Simpan Galeri'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}