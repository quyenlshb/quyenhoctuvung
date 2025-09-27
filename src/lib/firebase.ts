/**
 * Firebase Integration Layer
 * Pre-configured Firebase setup ready for production deployment
 */

// 1. IMPORT CÁC MODULE FIREBASE CẦN THIẾT
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"; 
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
  deleteDoc,
  Timestamp,
  orderBy,
  writeBatch, // <-- MỚI THÊM
  increment // <-- MỚI THÊM
} from "firebase/firestore";

// 2. CẤU HÌNH FIREBASE CỦA BẠN ĐÃ ĐƯỢC THAY THẾ
const firebaseConfig = {
  apiKey: "AIzaSyBk_wQreKzw0zKQtl7IBYge-W9RPoF1z7U",
  authDomain: "fghy-44958.firebaseapp.com",
  projectId: "fghy-44958",
  storageBucket: "fghy-44958.firebasestorage.app",
  messagingSenderId: "557118182998",
  appId: "1:557118182998:web:d29497e5d2633008985172",
  measurementId: "G-G6468N6Q32"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Có thể cần hoặc không
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// 3. EXPORT CÁC HÀM AUTH CẦN THIẾT
export { 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
};

// ----------------------------------------------------
// FIRESTORE USER DATA
// ----------------------------------------------------

export const saveUserData = async (userId: string, data: any) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { 
      ...data, 
      createdAt: Timestamp.now(), 
      totalPoints: data.totalPoints || 0,
      streak: data.streak || 0,
      totalWords: data.totalWords || 0 
    }, { merge: true });
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

// ----------------------------------------------------
// FIRESTORE VOCABULARY SETS
// ----------------------------------------------------

export const getVocabularySets = async (userId: string) => {
  try {
    const setsCollectionRef = collection(db, 'users', userId, 'vocabularySets');
    const q = query(setsCollectionRef, orderBy('createdAt', 'desc'));
    const setsSnap = await getDocs(q);
    
    const sets = setsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      wordCount: doc.data().wordCount || 0,
    }));
    
    return sets as any[]; 
  } catch (error) {
    console.error('Error getting vocabulary sets:', error);
    throw new Error('Tải bộ từ vựng thất bại');
  }
};

export const addVocabularySet = async (userId: string, data: { name: string, description: string }) => {
  try {
    const setsCollectionRef = collection(db, 'users', userId, 'vocabularySets');
    await addDoc(setsCollectionRef, {
      ...data,
      wordCount: 0,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error adding vocabulary set:', error);
    throw new Error('Thêm bộ từ thất bại');
  }
};

export const updateVocabularySet = async (userId: string, setId: string, data: any) => {
  try {
    const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
    await updateDoc(setDocRef, data);
  } catch (error) {
    console.error('Error updating vocabulary set:', error);
    throw new Error('Cập nhật bộ từ thất bại');
  }
};

export const deleteVocabularySet = async (userId: string, setId: string) => {
  try {
    const wordsCollectionRef = collection(db, 'users', userId, 'vocabularySets', setId, 'words');
    const wordsSnap = await getDocs(wordsCollectionRef);
    const deletePromises = wordsSnap.docs.map(wordDoc => deleteDoc(wordDoc.ref));
    await Promise.all(deletePromises);
    
    const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
    await deleteDoc(setDocRef);
  } catch (error) {
    console.error('Error deleting vocabulary set:', error);
    throw new Error('Xóa bộ từ thất bại');
  }
};


// ----------------------------------------------------
// FIRESTORE VOCABULARY WORDS
// ----------------------------------------------------

export const getVocabularyWords = async (userId: string, setId: string) => {
  try {
    const wordsCollectionRef = collection(db, 'users', userId, 'vocabularySets', setId, 'words');
    const q = query(wordsCollectionRef, orderBy('kanji', 'asc'));
    const wordsSnap = await getDocs(q);
    
    return wordsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
  } catch (error) {
    console.error('Error getting vocabulary words:', error);
    throw new Error('Tải từ vựng thất bại');
  }
};

export const addVocabularyWord = async (userId: string, setId: string, data: any) => {
  try {
    const wordsCollectionRef = collection(db, 'users', userId, 'vocabularySets', setId, 'words');
    await addDoc(wordsCollectionRef, {
      ...data,
      createdAt: Timestamp.now(),
      difficulty: data.difficulty || 50,
      lastReviewed: Timestamp.now() 
    });
    
    const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
    const setSnap = await getDoc(setDocRef);
    if (setSnap.exists()) {
        const currentCount = setSnap.data().wordCount || 0;
        await updateDoc(setDocRef, { wordCount: currentCount + 1 });
    }
  } catch (error) {
    console.error('Error adding vocabulary word:', error);
    throw new Error('Thêm từ vựng thất bại');
  }
};

// ✅ HÀM MỚI: Thêm nhiều từ vựng mới bằng Batch Write
export const addMultipleVocabularyWords = async (userId: string, setId: string, words: any[]) => {
  if (words.length === 0) return 0;
  
  const batch = writeBatch(db);
  const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
  let addedCount = 0; // Đếm số từ thực sự được thêm

  try {
    words.forEach(word => {
      // Bỏ qua các từ không hợp lệ
      if (!word.kanji || !word.kana || !word.meaning) return; 
      
      const wordsCollectionRef = collection(db, 'users', userId, 'vocabularySets', setId, 'words');
      const newWordRef = doc(wordsCollectionRef); // Tạo ref mới với ID tự động
      batch.set(newWordRef, {
        ...word,
        createdAt: Timestamp.now(),
        difficulty: word.difficulty || 50,
        lastReviewed: Timestamp.now() 
      });
      addedCount++;
    });
    
    // Nếu không có từ nào hợp lệ để thêm, dừng lại
    if (addedCount === 0) return 0;

    // Cập nhật lại wordCount trong set (TĂNG theo số lượng từ)
    batch.update(setDocRef, { 
        wordCount: increment(addedCount) 
    });
    
    await batch.commit();
    return addedCount;

  } catch (error) {
    console.error('Error adding multiple vocabulary words:', error);
    throw new Error('Thêm danh sách từ vựng thất bại');
  }
};


// Cập nhật từ vựng (giữ nguyên)
export const updateVocabularyWord = async (userId: string, setId: string, wordId: string, data: any) => {
// ... (Logic giữ nguyên)
  try {
    const wordDocRef = doc(db, 'users', userId, 'vocabularySets', setId, 'words', wordId);
    await updateDoc(wordDocRef, data);
  } catch (error) {
    console.error('Error updating vocabulary word:', error);
    throw new Error('Cập nhật từ vựng thất bại');
  }
};

// Xóa từ vựng (giữ nguyên)
export const deleteVocabularyWord = async (userId: string, setId: string, wordId: string) => {
// ... (Logic giữ nguyên)
  try {
    const wordDocRef = doc(db, 'users', userId, 'vocabularySets', setId, 'words', wordId);
    await deleteDoc(wordDocRef);
    
    const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
    const setSnap = await getDoc(setDocRef);
    if (setSnap.exists()) {
        const currentCount = setSnap.data().wordCount || 0;
        if (currentCount > 0) {
            await updateDoc(setDocRef, { wordCount: currentCount - 1 });
        }
    }
  } catch (error) {
    console.error('Error deleting vocabulary word:', error);
    throw new Error('Xóa từ vựng thất bại');
  }
};

// ----------------------------------------------------
// FIRESTORE STATISTICS (Giữ nguyên)
// ----------------------------------------------------
export const updateUserStatistics = async (userId: string, stats: any) => {
// ... (Logic giữ nguyên)
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
// ... (Logic giữ nguyên)
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