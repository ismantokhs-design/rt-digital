import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Gallery({ sidebarOpen, isDesktop }) {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentLeft = isDesktop ? (sidebarOpen ? '260px' : '70px') : '0px';

  // Ambil data galeri dari Firestore saat halaman dimuat
  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'galleries'));
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Hanya tampilkan yang aktif (active === true)
        const activeGalleries = list.filter(item => item.active !== false);
        setGalleries(activeGalleries);
      } catch (error) {
        console.error("Gagal memuat galeri:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleries();
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

      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        boxSizing: 'border-box',
        marginBottom: '100px'
      }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0' }}>
          🖼️ Galeri Kegiatan Warga
        </h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>
            Memuat galeri...
          </div>
        ) : galleries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            Belum ada galeri foto yang dibagikan.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {galleries.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/300'}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ padding: '14px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}