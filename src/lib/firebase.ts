/**
 * Firebase Integration Layer
 * Pre-configured Firebase setup ready for production deployment
 * Cập nhật: Hàm addVocabularySet đã thêm trường totalWords=0 vào payload ghi DB.
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
  writeBatch, 
  increment 
} from "firebase/firestore";

// 2. CẤU HÌNH FIREBASE MỚI CỦA BẠN (Dự án: qwer-c9de3)
const firebaseConfig = {
  apiKey: "AIzaSyDJRsHMjU2G2BAtR3ZC9TlYjP0QMu1xSaw",
  authDomain: "qwer-c9de3.firebaseapp.com",
  projectId: "qwer-c9de3",
  storageBucket: "qwer-c9de3.firebasestorage.app",
  messagingSenderId: "144621785008",
  appId: "1:144621785008:web:97ce2b548fd1c26c629075",
  measurementId: "G-CJ1KJL5WWY"
};

// 3. KHỞI TẠO VÀ EXPORT
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app); 
export const googleProvider = new GoogleAuthProvider();

// Export Auth functions directly from Firebase
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup, Timestamp };

// ----------------------------------------------------
// INTERFACES (Giữ nguyên)
// ----------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  totalPoints: number;
  streak: number;
  totalWords: number;
  lastUpdated: Timestamp;
}

export interface VocabularySet {
  id: string;
  name: string;
  description: string;
  createdAt: Timestamp;
  userId: string;
  totalWords: number; // Dùng để hiển thị số lượng từ
}

export interface VocabularyWord {
  id: string;
  kanji: string;
  kana: string;
  meaning: string;
  notes?: string;
  difficulty: number; // 0-100 (score)
  lastReviewed?: Timestamp;
}

export interface LearningSessionHistory {
  id: string;
  date: Timestamp;
  correctAnswers: number;
  totalAttempts: number;
  wordUpdates: Array<{ wordId: string; newDifficulty: number; oldDifficulty: number }>;
}

// ----------------------------------------------------
// FIRESTORE USER DATA (Giữ nguyên)
// ----------------------------------------------------

/**
 * Lưu/Cập nhật dữ liệu người dùng mới/hiện có
 */
export const saveUserData = async (
  userId: string, 
  email: string, 
  name: string, 
  photoURL?: string
) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    // Sử dụng setDoc với merge: true để chỉ tạo nếu chưa tồn tại
    await setDoc(userDocRef, {
      email,
      name,
      photoURL: photoURL || null,
      totalPoints: 0,
      streak: 0,
      totalWords: 0,
      createdAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    console.error('Save user data error:', error);
    throw new Error('Lưu dữ liệu người dùng thất bại');
  }
};

/**
 * Tải dữ liệu người dùng từ Firestore
 */
export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
      } as User;
    }
    return null;
  } catch (error) {
    console.error('Get user data error:', error);
    throw new Error('Tải dữ liệu người dùng thất bại');
  }
};

// ----------------------------------------------------
// FIRESTORE VOCABULARY SETS
// ----------------------------------------------------

/**
 * Tải danh sách bộ từ vựng của người dùng (Đường dẫn Subcollection đã đúng)
 */
export const getVocabularySets = async (userId: string): Promise<VocabularySet[]> => {
  try {
    const setsRef = collection(db, 'users', userId, 'vocabularySets');
    const setsSnap = await getDocs(setsRef);

    return setsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as VocabularySet[];
  } catch (error) {
    console.error('Error getting vocabulary sets:', error);
    throw new Error('Tải bộ từ thất bại');
  }
};

/**
 * ✅ ĐÃ SỬA CHỮA: Thêm bộ từ vựng mới và trả về đối tượng bộ từ đã có ID.
 * ⚡️ FIX: Đảm bảo trường totalWords: 0 (hoặc wordCount: 0) được thêm vào payload ghi DB.
 * @returns Đối tượng VocabularySet vừa được tạo (cùng với ID)
 */
export const addVocabularySet = async (
  userId: string, 
  name: string, 
  description: string
): Promise<VocabularySet> => {
  try {
    // Chuẩn bị dữ liệu bộ từ mới
    const newSet = { // ⚡️ SỬA 1: KHÔNG DÙNG Omit<..., 'totalWords'> NỮA
      name,
      description,
      userId,
      createdAt: Timestamp.now(),
      totalWords: 0, // ⚡️ SỬA 2: THÊM TRƯỜNG TOTALWORDS VÀO PAYLOAD GHI DB
    };

    // Đường dẫn subcollection: users/{userId}/vocabularySets
    const setDocRef = await addDoc(collection(db, 'users', userId, 'vocabularySets'), newSet);

    // Trả về đối tượng VocabularySet hoàn chỉnh (có ID)
    return {
      id: setDocRef.id,
      ...newSet
    } as VocabularySet;

  } catch (error) {
    console.error('Error adding vocabulary set:', error);
    throw new Error('Thêm bộ từ thất bại');
  }
};

/**
 * Cập nhật tên và mô tả của bộ từ vựng
 */
export const updateVocabularySet = async (
  userId: string, 
  setId: string, 
  name: string, 
  description: string
) => {
  try {
    const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
    await updateDoc(setDocRef, { name, description });
  } catch (error) {
    console.error('Error updating vocabulary set:', error);
    throw new Error('Cập nhật bộ từ thất bại');
  }
};

/**
 * Xóa một bộ từ vựng. Cần xóa TẤT CẢ các từ con trong subcollection 'words'
 */
export const deleteVocabularySet = async (userId: string, setId: string) => {
  try {
    const batch = writeBatch(db);
    const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
    
    // 1. Xóa TẤT CẢ các từ con trong subcollection 'words' (rất quan trọng!)
    const wordsRef = collection(setDocRef, 'words');
    const wordsSnap = await getDocs(wordsRef);
    wordsSnap.docs.forEach(wordDoc => {
      batch.delete(wordDoc.ref);
    });

    // 2. Xóa tài liệu VocabularySet chính
    batch.delete(setDocRef);

    // 3. Commit batch
    await batch.commit();

  } catch (error) {
    console.error('Error deleting vocabulary set:', error);
    throw new Error('Xóa bộ từ thất bại');
  }
};


// ----------------------------------------------------
// FIRESTORE VOCABULARY WORDS
// ----------------------------------------------------

/**
 * Tải các từ vựng thuộc một bộ từ (Subcollection: words)
 */
export const getVocabularyWords = async (userId: string, setId: string): Promise<VocabularyWord[]> => {
  try {
    // Đường dẫn Subcollection: users/{userId}/vocabularySets/{setId}/words
    const wordsRef = collection(db, 'users', userId, 'vocabularySets', setId, 'words');
    // Sắp xếp theo difficulty (ví dụ)
    const q = query(wordsRef, orderBy('difficulty', 'asc')); 
    const wordsSnap = await getDocs(q);

    return wordsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as VocabularyWord[];

  } catch (error) {
    console.error('Error getting vocabulary words:', error);
    throw new Error('Tải từ vựng thất bại');
  }
};

/**
 * Thêm từ vựng mới vào bộ từ (Subcollection: words)
 */
export const addVocabularyWord = async (
  userId: string, 
  setId: string, 
  word: Omit<VocabularyWord, 'id' | 'lastReviewed'>
): Promise<VocabularyWord> => {
  try {
    const wordsRef = collection(db, 'users', userId, 'vocabularySets', setId, 'words');
    const newWordPayload = {
      ...word,
      difficulty: 50, // Khởi tạo độ khó trung bình (0-100)
      lastReviewed: null,
      createdAt: Timestamp.now(),
    };
    
    const wordDocRef = await addDoc(wordsRef, newWordPayload);

    // Tăng trường totalWords trong tài liệu VocabularySet chính
    const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
    await updateDoc(setDocRef, {
        totalWords: increment(1)
    });

    return {
      id: wordDocRef.id,
      ...newWordPayload
    } as VocabularyWord;

  } catch (error) {
    console.error('Error adding vocabulary word:', error);
    throw new Error('Thêm từ vựng thất bại');
  }
};

/**
 * Cập nhật một từ vựng
 */
export const updateVocabularyWord = async (
  userId: string, 
  setId: string, 
  wordId: string, 
  updates: Partial<VocabularyWord>
) => {
  try {
    const wordDocRef = doc(db, 'users', userId, 'vocabularySets', setId, 'words', wordId);
    await updateDoc(wordDocRef, updates);
  } catch (error) {
    console.error('Error updating vocabulary word:', error);
    throw new Error('Cập nhật từ vựng thất bại');
  }
};

/**
 * Xóa một từ vựng
 */
export const deleteVocabularyWord = async (userId: string, setId: string, wordId: string) => {
  try {
    // 1. Xóa tài liệu từ vựng
    const wordDocRef = doc(db, 'users', userId, 'vocabularySets', setId, 'words', wordId);
    await deleteDoc(wordDocRef);

    // 2. Giảm trường totalWords trong tài liệu VocabularySet chính
    const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
    await updateDoc(setDocRef, {
        totalWords: increment(-1)
    });
  } catch (error) {
    console.error('Error deleting vocabulary word:', error);
    throw new Error('Xóa từ vựng thất bại');
  }
};

// ----------------------------------------------------
// FIRESTORE LEARNING SESSIONS
// ----------------------------------------------------

/**
 * Lưu kết quả một phiên học
 */
export const saveLearningSession = async (userId: string, sessionData: Omit<LearningSessionHistory, 'id'>) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'learningSessions');
    await addDoc(sessionsRef, {
      ...sessionData,
      date: Timestamp.now()
    });
  } catch (error) {
    console.error('Save learning session error:', error);
    throw new Error('Lưu phiên học thất bại');
  }
};

/**
 * Tải lịch sử các phiên học (dùng cho component Statistics.tsx).
 */
export const getLearningSessions = async (userId: string): Promise<LearningSessionHistory[]> => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'learningSessions');
    const q = query(sessionsRef, orderBy('date', 'desc'));
    const sessionsSnap = await getDocs(q);

    return sessionsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LearningSessionHistory[];
  } catch (error) {
    console.error('Error getting learning sessions:', error);
    throw new Error('Tải phiên học thất bại');
  }
}

// ----------------------------------------------------
// FIRESTORE STATISTICS (Giữ nguyên)
// ----------------------------------------------------
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