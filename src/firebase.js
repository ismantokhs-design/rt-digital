// Import fungsi yang diperlukan dari SDK Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Konfigurasi Firebase dari proyek Anda
const firebaseConfig = {
  apiKey: "AIzaSyBx2AF0YRpOEq--q__dn39NwiNCKXvKutM",
  authDomain: "erte-979ca.firebaseapp.com",
  projectId: "erte-979ca",
  storageBucket: "erte-979ca.firebasestorage.app",
  messagingSenderId: "329513636032",
  appId: "1:329513636032:web:25a10b627b91db2bbb5d25",
  measurementId: "G-VQ7N0NJFKG"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi layanan yang akan digunakan di aplikasi PWA Anda
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Inisialisasi Analytics secara aman (hanya berjalan jika didukung browser)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { analytics };