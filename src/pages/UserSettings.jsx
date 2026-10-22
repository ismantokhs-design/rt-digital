import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export default function Profile({ sidebarOpen, isDesktop }) {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Semua'); // 'Semua', 'Admin RT', 'Warga', 'Pengurus'

  // State untuk Modal Edit User
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Warga');
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

  // Ambil data dari koleksi 'users' di Firestore
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsersList(list);
    } catch (error) {
      console.error("Gagal memuat data pengguna:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Buka Modal Edit
  const handleOpenEdit = (user) => {
    setEditingId(user.id);
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setRole(user.role || 'Warga');
    setShowModal(true);
  };

  // Simpan Perubahan Edit User ke Firestore
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    try {
      const docRef = doc(db, 'users', editingId);
      await updateDoc(docRef, {
        name,
        email,
        phone,
        role,
        updatedAt: serverTimestamp()
      });

      showToastMessage('Data profil berhasil diperbarui!', 'success');
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);
      showToastMessage('Terjadi kesalahan saat menyimpan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Hapus User
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        await deleteDoc(doc(db, 'users', id));
        showToastMessage('Pengguna berhasil dihapus!', 'success');
        fetchUsers();
      } catch (error) {
        console.error("Gagal menghapus:", error);
        showToastMessage('Gagal menghapus data.', 'error');
      }
    }
  };

  // Filter daftar user berdasarkan Tab Role yang aktif
  const filteredUsers = usersList.filter(user => {
    const userRole = user.role || 'Warga';
    if (activeTab === 'Semua') return true;
    return userRole === activeTab;
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
        {/* HEADER KECIL DI DALAM KARTU */}
        <div style={{ marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>
            👥 Manajemen Profil Pengguna & Warga
          </h1>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
            Daftar akun terdaftar di sistem RT Digital beserta fasilitas pengelolaan data.
          </p>
        </div>

        {/* TAB NAVIGATION BERDASARKAN ROLE */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {['Semua', 'Admin RT', 'Warga', 'Pengurus'].map((tab) => {
            const count = tab === 'Semua' 
              ? usersList.length 
              : usersList.filter(u => (u.role || 'Warga') === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  backgroundColor: activeTab === tab ? '#0f766e' : '#f1f5f9',
                  color: activeTab === tab ? 'white' : '#64748b',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>
            Memuat data pengguna...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>
            Tidak ada pengguna dengan kategori role ini.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredUsers.map((user) => (
              <div key={user.id} style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                      {user.name || 'Tanpa Nama'}
                    </h3>
                    <span style={{ fontSize: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      {user.role || 'Warga'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0' }}>
                    📧 Email: {user.email || '-'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    📱 No. HP: {user.phone || '-'}
                  </p>
                </div>

                {/* KOLOM AKSI (EDIT & HAPUS) */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleOpenEdit(user)}
                    style={{ backgroundColor: '#fef9c3', color: '#854d0e', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
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

      {/* MODAL EDIT PROFIL */}
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
              Edit Data Pengguna
            </h3>

            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Nomor HP</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Role / Jabatan</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ ...inputStyle, backgroundColor: 'white' }}
                >
                  <option value="Admin RT">Admin RT</option>
                  <option value="Warga">Warga</option>
                  <option value="Pengurus">Pengurus</option>
                </select>
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
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Styling Pendukung Form
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