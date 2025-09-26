/**
 * Firebase Integration Layer
 * Pre-configured Firebase setup ready for production deployment
 * Replaces mock auth with Firebase Auth and Firestore
 */

// 1. IMPORT CÁC MODULE FIREBASE CẦN THIẾT
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"; // Giữ lại Analytics
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

// 2. CẤU HÌNH FIREBASE CỦA BẠN ĐÃ ĐƯỢC THAY THẾ
const firebaseConfig = {
  apiKey: "AIzaSyBk_wQreKzw0zKQtl7IBYge-W9RPoF1z7U",
  authDomain: "fghy-44958.firebaseapp.com",
  projectId: "fghy-44958",
  storageBucket: "fghy-44958.firebasestorage.app",
  messagingSenderId: "613742617616",
  appId: "1:613742617616:web:64015040b1f0a639009695",
  measurementId: "G-TBZEV179S4"
};

// 3. KHỞI TẠO FIREBASE & SERVICES
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Khởi tạo Analytics
const auth = getAuth(app); // Khởi tạo Authentication
const googleProvider = new GoogleAuthProvider(); // Khởi tạo Google Auth Provider
const db = getFirestore(app); // Khởi tạo Firestore Database

// 4. EXPORT CÁC HÀM CỐT LÕI

// ------------------------------------
// A. AUTH EXPORTS (Xác thực)
// ------------------------------------

export { 
    auth,
    googleProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
};

// ------------------------------------
// B. FIRESTORE EXPORTS (Tương tác cơ sở dữ liệu)
// ------------------------------------

export { db, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, deleteDoc };

// ------------------------------------
// C. CÁC HÀM THAO TÁC DATA CẤP CAO (Như đã phân tích)
// ------------------------------------

// User Data Operations (Example functions - Cần được tích hợp vào component)
export const saveUserData = async (userId: string, data: any) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, data, { merge: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    throw new Error('Lưu dữ liệu người dùng thất bại');
  }
};

export const getUserData = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw new Error('Tải dữ liệu người dùng thất bại');
  }
};

// User statistics (Dùng trong Statistics.tsx, Home.tsx)
export const updateUserStatistics = async (userId: string, stats: any) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      ...stats,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Update user statistics error:', error);
    throw new Error('Cập nhật thống kê thất bại');
  }
};

export const getUserStatistics = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error('Get user statistics error:', error);
    throw new Error('Tải thống kê thất bại');
  }
};

// Tùy theo nhu cầu:
// export const getVocabularySets = ... (dùng trong VocabularyManager.tsx)
// export const startNewLearningSession = ... (dùng trong LearningMode.tsx)
// ...