import React, { useState, useEffect } from 'react';
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

export default function Warga({ sidebarOpen, isDesktop }) {
  // Jika selectedMenu null, tampilkan menu utama (seperti Manajemen.jsx)
  // Jika berisi nama menu, tampilkan isi/tabel data menu tersebut
  const [selectedMenu, setSelectedMenu] = useState(null);

  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // State Modal Form
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // State Form fields
  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    noKk: '',
    noHp: '',
    alamat: '',
    statusTinggal: 'Tetap',
    kepalaKeluarga: '',
    jumlahAnggota: '',
    tanggalPeristiwa: new Date().toISOString().split('T')[0],
    keterangan: '',
    jenisMutasi: 'Masuk'
  });

  // State Toast Notification
  const [toast, setToast] = useState({ show: false, text: '', type: 'success' });

  const currentLeft = isDesktop ? (sidebarOpen ? '260px' : '70px') : '0px';

  const showToastMessage = (text, type = 'success') => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast({ show: false, text: '', type: 'success' });
    }, 3000);
  };

  // Daftar Menu Kependudukan (Gaya Manajemen.jsx)
  const wargaMenus = [
    { title: 'Daftar Warga', icon: '👥', key: 'Daftar Warga', desc: 'Kelola data seluruh warga RT' },
    { title: 'Daftar KK', icon: 'カード', key: 'Daftar KK', desc: 'Kelola data Kartu Keluarga' },
    { title: 'Input KK Baru', icon: '➕', key: 'Input KK Baru', desc: 'Tambah data Kartu Keluarga baru' },
    { title: 'Kelahiran', icon: '👶', key: 'Kelahiran', desc: 'Catat data kelahiran warga' },
    { title: 'Kematian', icon: '🕊️', key: 'Kematian', desc: 'Catat data kematian warga' },
    { title: 'Mutasi', icon: '🔄', key: 'Mutasi', desc: 'Catat warga masuk atau keluar' },
  ];

  // Ambil data dari Firestore berdasarkan menu yang aktif
  const fetchData = async (menuKey) => {
    if (menuKey === 'Input KK Baru') return;
    setLoading(true);
    let colName = 'warga';
    if (menuKey === 'Daftar KK') colName = 'kk';
    if (menuKey === 'Kelahiran') colName = 'kelahiran';
    if (menuKey === 'Kematian') colName = 'kematian';
    if (menuKey === 'Mutasi') colName = 'mutasi';

    try {
      const snap = await getDocs(collection(db, colName));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setListData(items);
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (menu) => {
    if (menu.key === 'Input KK Baru') {
      setSelectedMenu('Daftar KK');
      handleOpenAdd('kk');
    } else {
      setSelectedMenu(menu.key);
      fetchData(menu.key);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      nama: '',
      nik: '',
      noKk: '',
      noHp: '',
      alamat: '',
      statusTinggal: 'Tetap',
      kepalaKeluarga: '',
      jumlahAnggota: '',
      tanggalPeristiwa: new Date().toISOString().split('T')[0],
      keterangan: '',
      jenisMutasi: 'Masuk'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      nama: item.nama || '',
      nik: item.nik || '',
      noKk: item.noKk || '',
      noHp: item.noHp || '',
      alamat: item.alamat || '',
      statusTinggal: item.statusTinggal || 'Tetap',
      kepalaKeluarga: item.kepalaKeluarga || '',
      jumlahAnggota: item.jumlahAnggota || '',
      tanggalPeristiwa: item.tanggalPeristiwa || new Date().toISOString().split('T')[0],
      keterangan: item.keterangan || '',
      jenisMutasi: item.jenisMutasi || 'Masuk'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    let colName = 'warga';
    if (selectedMenu === 'Daftar KK') colName = 'kk';
    if (selectedMenu === 'Kelahiran') colName = 'kelahiran';
    if (selectedMenu === 'Kematian') colName = 'kematian';
    if (selectedMenu === 'Mutasi') colName = 'mutasi';

    try {
      const payload = { ...formData, updatedAt: serverTimestamp() };

      if (editingId) {
        await updateDoc(doc(db, colName, editingId), payload);
        showToastMessage('Data berhasil diperbarui!', 'success');
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, colName), payload);
        showToastMessage('Data berhasil ditambahkan!', 'success');
      }

      setShowModal(false);
      fetchData(selectedMenu);
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      showToastMessage('Terjadi kesalahan saat menyimpan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    let colName = 'warga';
    if (selectedMenu === 'Daftar KK') colName = 'kk';
    if (selectedMenu === 'Kelahiran') colName = 'kelahiran';
    if (selectedMenu === 'Kematian') colName = 'kematian';
    if (selectedMenu === 'Mutasi') colName = 'mutasi';

    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        await deleteDoc(doc(db, colName, id));
        showToastMessage('Data berhasil dihapus!', 'success');
        fetchData(selectedMenu);
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
          position: 'fixed', top: isDesktop ? '130px' : '20px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: toast.type === 'success' ? '#16a34a' : '#dc2626',
          border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          padding: '10px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 9999, animation: 'fadeInOut 3s ease forwards'
        }}>
          {toast.text}
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto', boxSizing: 'border-box', marginBottom: '100px' }}>
        
        {/* JIKA BELUM MEMILIH MENU (TAMPILAN GRID 2 KOLOM SEPERTI MANAJEMEN.JSX) */}
        {!selectedMenu ? (
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0' }}>
              👥 Manajemen Kependudukan RT
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {wargaMenus.map((menu, index) => (
                <div
                  key={index}
                  onClick={() => handleMenuClick(menu)}
                  style={{
                    backgroundColor: 'white', borderRadius: '12px', padding: '20px 12px',
                    border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#0f766e';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 118, 110, 0.08)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                  }}
                >
                  <span style={{ fontSize: '24px', marginBottom: '8px', color: '#0f766e' }}>
                    {menu.icon}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '2px' }}>
                    {menu.title}
                  </span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>
                    {menu.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* JIKA MENU DIPILIH: TAMPILKAN HALAMAN / TABEL DATA TERSEBUT */
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            
            {/* HEADER KEMBALI & TOMBOL TAMBAH */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setSelectedMenu(null)}
                  style={{ backgroundColor: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', color: '#334155' }}
                >
                  ← Kembali
                </button>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                  📁 {selectedMenu}
                </h1>
              </div>

              <button
                onClick={handleOpenAdd}
                style={{ backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)' }}
              >
                + Tambah Data
              </button>
            </div>

            {/* PENCARIAN */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder={`🔍 Cari di ${selectedMenu}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* LIST DATA */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>Memuat data...</div>
            ) : listData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>Belum ada data pada menu ini.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {listData.map((item) => (
                  <div key={item.id} style={{
                    backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>
                        {item.nama || item.kepalaKeluarga || 'Tanpa Nama'}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0' }}>
                        📌 {selectedMenu === 'Daftar KK' ? 'No. KK' : 'NIK / Info'}: {item.nik || item.noKk || item.tanggalPeristiwa || '-'} {item.noHp ? `| 📱 ${item.noHp}` : ''}
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                        🏠 Keterangan: {item.alamat || item.keterangan || '-'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
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
        )}

      </div>

      {/* MODAL FORM TAMBAH / EDIT */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 2000, padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px',
            padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', boxSizing: 'border-box', position: 'relative'
          }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}>
              ✕
            </button>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              {editingId ? 'Edit Data' : `Tambah Data (${selectedMenu})`}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(selectedMenu === 'Daftar Warga' || selectedMenu === 'Kelahiran' || selectedMenu === 'Kematian' || selectedMenu === 'Mutasi') && (
                <div>
                  <label style={labelStyle}>Nama Lengkap</label>
                  <input type="text" name="nama" value={formData.nama} onChange={handleChange} style={inputStyle} required />
                </div>
              )}

              {selectedMenu === 'Daftar Warga' && (
                <>
                  <div>
                    <label style={labelStyle}>NIK</label>
                    <input type="text" name="nik" value={formData.nik} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>No. HP</label>
                    <input type="text" name="noHp" value={formData.noHp} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Status Tinggal</label>
                    <select name="statusTinggal" value={formData.statusTinggal} onChange={handleChange} style={{ ...inputStyle, backgroundColor: 'white' }}>
                      <option value="Tetap">Tetap</option>
                      <option value="Kontrak">Kontrak</option>
                    </select>
                  </div>
                </>
              )}

              {selectedMenu === 'Daftar KK' && (
                <>
                  <div>
                    <label style={labelStyle}>Nomor KK</label>
                    <input type="text" name="noKk" value={formData.noKk} onChange={handleChange} style={inputStyle} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Kepala Keluarga</label>
                    <input type="text" name="kepalaKeluarga" value={formData.kepalaKeluarga} onChange={handleChange} style={inputStyle} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Jumlah Anggota Keluarga</label>
                    <input type="number" name="jumlahAnggota" value={formData.jumlahAnggota} onChange={handleChange} style={inputStyle} />
                  </div>
                </>
              )}

              {(selectedMenu === 'Kelahiran' || selectedMenu === 'Kematian') && (
                <div>
                  <label style={labelStyle}>Tanggal Peristiwa</label>
                  <input type="date" name="tanggalPeristiwa" value={formData.tanggalPeristiwa} onChange={handleChange} style={inputStyle} required />
                </div>
              )}

              {selectedMenu === 'Mutasi' && (
                <div>
                  <label style={labelStyle}>Jenis Mutasi</label>
                  <select name="jenisMutasi" value={formData.jenisMutasi} onChange={handleChange} style={{ ...inputStyle, backgroundColor: 'white' }}>
                    <option value="Masuk">Warga Masuk</option>
                    <option value="Keluar">Warga Keluar</option>
                  </select>
                </div>
              )}

              <div>
                <label style={labelStyle}>Alamat / Keterangan</label>
                <textarea name="alamat" value={formData.alamat} onChange={handleChange} placeholder="Alamat atau keterangan tambahan..." rows="3" style={{ ...inputStyle, resize: 'vertical' }} />
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
                {saving ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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