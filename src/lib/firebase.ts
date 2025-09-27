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
  storageBucket: "fghy-44958.appspot.com",
  messagingSenderId: "788099850550",
  appId: "1:788099850550:web:d720275ccb990141978248",
  measurementId: "G-G6J30T1R1T"
};

// 3. KHỞI TẠO CÁC DỊCH VỤ
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Giữ nguyên, có thể bị bỏ qua nếu không dùng
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ----------------------------------------------------
// FIRESTORE USERS (Giữ nguyên)
// ----------------------------------------------------

export const saveUserData = async (userId: string, data: { email: string, name: string, photoURL?: string }) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...data,
      totalPoints: 0,
      streak: 0,
      totalWords: 0,
      lastLogin: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    throw new Error('Lưu dữ liệu người dùng thất bại');
  }
};

export const getUserData = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw new Error('Lấy dữ liệu người dùng thất bại');
  }
};


// ----------------------------------------------------
// FIRESTORE VOCABULARY SETS (ĐÃ CẬP NHẬT)
// ----------------------------------------------------

// ✅ ĐÃ SỬA: Thêm userId làm tham số bắt buộc và đưa vào document
export const addVocabularySet = async (userId: string, setName: string) => {
  if (!userId) {
    throw new Error("Lỗi xác thực: Người dùng chưa đăng nhập. Không thể tạo bộ từ.");
  }
  
  try {
    // Thao tác này đòi hỏi userId trong data để vượt qua Security Rules
    const setsCollectionRef = collection(db, 'vocabularySets');
    
    const newSetDoc = {
      name: setName,
      userId: userId, // <--- TRƯỜNG BẮT BUỘC ĐÃ ĐƯỢC THÊM
      createdAt: new Date(),
      wordCount: 0, 
    };
    
    const docRef = await addDoc(setsCollectionRef, newSetDoc);
    
    return { id: docRef.id, ...newSetDoc };

  } catch (error) {
    console.error('Lỗi khi thêm bộ từ vựng:', error);
    // Thay đổi thông báo lỗi để dễ debug hơn ở phía client
    throw new Error('Thêm bộ từ thất bại: Lỗi quyền truy cập hoặc kết nối.');
  }
};


export const getVocabularySets = async (userId: string) => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'vocabularySets'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const sets = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any;
    return sets;
  } catch (error) {
    console.error('Error getting vocabulary sets:', error);
    throw new Error('Lấy danh sách bộ từ thất bại');
  }
};

export const updateVocabularySet = async (setId: string, userId: string, newName: string) => {
  try {
    // Vì Security Rule đã kiểm tra userId trong document, ta chỉ cần docRef
    const setDocRef = doc(db, 'vocabularySets', setId);
    await updateDoc(setDocRef, { name: newName });
  } catch (error) {
    console.error('Error updating vocabulary set:', error);
    throw new Error('Cập nhật bộ từ thất bại');
  }
};

export const deleteVocabularySet = async (setId: string, userId: string) => {
  try {
    // 1. Xóa tất cả từ vựng trong bộ từ đó (nếu cần) - Giả định đã được xử lý bằng Cloud Functions
    // 2. Xóa bộ từ
    const setDocRef = doc(db, 'vocabularySets', setId);
    await deleteDoc(setDocRef);
  } catch (error) {
    console.error('Error deleting vocabulary set:', error);
    throw new Error('Xóa bộ từ thất bại');
  }
};

// ----------------------------------------------------
// FIRESTORE VOCABULARY WORDS (Giữ nguyên)
// ----------------------------------------------------

export const getVocabularyWords = async (setId: string, userId: string) => {
  if (!userId) return []; // Should not happen on protected route
  try {
    const q = query(
      collection(db, 'vocabularyWords'),
      where('setId', '==', setId),
      where('userId', '==', userId), // Đảm bảo chỉ lấy từ của người dùng hiện tại
      orderBy('kanji', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const words = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any;
    return words;
  } catch (error) {
    console.error('Error getting vocabulary words:', error);
    throw new Error('Lấy từ vựng thất bại');
  }
};

export const addVocabularyWord = async (setId: string, userId: string, word: { kanji: string, kana: string, meaning: string, notes?: string }) => {
  try {
    const wordsCollectionRef = collection(db, 'vocabularyWords');
    const newWordDoc = {
      ...word,
      setId: setId,
      userId: userId, // Bắt buộc phải có để Security Rules cho phép
      difficulty: 50, // Khởi tạo điểm khó mặc định
      lastReviewed: null,
      nextReview: new Date(),
      createdAt: new Date(),
    };
    
    const docRef = await addDoc(wordsCollectionRef, newWordDoc);

    // Tăng wordCount của bộ từ
    const setDocRef = doc(db, 'vocabularySets', setId);
    await updateDoc(setDocRef, { wordCount: increment(1) });
    
    return { id: docRef.id, ...newWordDoc };
  } catch (error) {
    console.error('Error adding vocabulary word:', error);
    throw new Error('Thêm từ vựng thất bại');
  }
};

export const addMultipleVocabularyWords = async (setId: string, userId: string, words: { kanji: string, kana: string, meaning: string }[]) => {
  if (words.length === 0) return 0;
  
  const batch = writeBatch(db);
  const wordsCollectionRef = collection(db, 'vocabularyWords');
  let successCount = 0;

  words.forEach(word => {
    const newWordRef = doc(wordsCollectionRef);
    batch.set(newWordRef, {
      ...word,
      setId: setId,
      userId: userId,
      difficulty: 50,
      lastReviewed: null,
      nextReview: new Date(),
      createdAt: new Date(),
    });
    successCount++;
  });
  
  try {
    await batch.commit();

    // Tăng wordCount của bộ từ
    const setDocRef = doc(db, 'vocabularySets', setId);
    await updateDoc(setDocRef, { wordCount: increment(successCount) });
    
    return successCount;

  } catch (error) {
    console.error('Error adding multiple vocabulary words:', error);
    throw new Error('Thêm hàng loạt từ vựng thất bại');
  }
};

export const updateVocabularyWord = async (setId: string, wordId: string, userId: string, data: Partial<{ kanji: string, kana: string, meaning: string, notes: string }>) => {
  try {
    const wordDocRef = doc(db, 'vocabularyWords', wordId);
    await updateDoc(wordDocRef, data);
  } catch (error) {
    console.error('Error updating vocabulary word:', error);
    throw new Error('Cập nhật từ vựng thất bại');
  }
};

export const deleteVocabularyWord = async (setId: string, wordId: string, userId: string) => {
  try {
    const wordDocRef = doc(db, 'vocabularyWords', wordId);
    await deleteDoc(wordDocRef);
    
    const setDocRef = doc(db, 'vocabularySets', setId);
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
    console.error('Error getting user statistics:', error);
    throw new Error('Lấy thống kê thất bại');
  }
};