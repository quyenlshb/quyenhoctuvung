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
  writeBatch, // <-- Giữ nguyên
  increment, // <-- Giữ nguyên
  limit // <-- MỚI: Dùng để giới hạn kết quả trả về
} from "firebase/firestore";

// 2. CẤU HÌNH FIREBASE CỦA BẠN ĐÃ ĐƯỢC THAY THẾ
const firebaseConfig = {
  apiKey: "AIzaSyBk_wQreKzw0zKQtl7IBYge-W9RPoF1z7U",
  authDomain: "fghy-44958.firebaseapp.com",
  projectId: "fghy-44958",
  storageBucket: "fghy-44958.appspot.com",
  messagingSenderId: "338902099307",
  appId: "1:338902099307:web:2a30b06b987483783a93e3",
  measurementId: "G-8L5B6QW5T2"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); 
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { 
  auth, 
  googleProvider,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
};

// ----------------------------------------------------
// INTERFACES (Được thêm vào để đồng bộ hóa)
// ----------------------------------------------------
interface VocabularyWord {
  id: string
  kanji: string
  kana: string
  meaning: string
  notes?: string
  difficulty: number 
}

interface SessionData {
  userId: string;
  wordsLearned: number;
  points: number;
  accuracy: number; // 0.00 - 1.00
  timeSpent: number; // Giây
  date: Date;
  setId?: string; 
}

export interface LearningSessionHistory {
  id: string;
  wordsLearned: number;
  points: number;
  accuracy: number;
  timeSpent: number;
  date: string; // ISO Date string
}

// ----------------------------------------------------
// FIRESTORE USER DATA (Giữ nguyên)
// ----------------------------------------------------
export const saveUserData = async (userId: string, data: any) => {
  try {
    await setDoc(doc(db, 'users', userId), data, { merge: true });
  } catch (error) {
    console.error('Save user data error:', error);
    throw new Error('Lưu dữ liệu người dùng thất bại');
  }
};

export const getUserData = async (userId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Get user data error:', error);
    throw new Error('Tải dữ liệu người dùng thất bại');
  }
};

// ----------------------------------------------------
// FIRESTORE VOCABULARY SETS (Giữ nguyên)
// ----------------------------------------------------
// ... (Các hàm getVocabularySets, addVocabularySet, updateVocabularySet, deleteVocabularySet)
export const getVocabularySets = async (userId: string) => {
    try {
        const setsCollectionRef = collection(db, 'users', userId, 'vocabularySets');
        const q = query(setsCollectionRef, orderBy('createdAt', 'desc'));
        const setsSnapshot = await getDocs(q);
        
        const sets = setsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return sets;
    } catch (error) {
        console.error('Error fetching vocabulary sets:', error);
        throw new Error('Tải bộ từ vựng thất bại');
    }
};

export const addVocabularySet = async (userId: string, name: string, description: string) => {
    try {
        const setsCollectionRef = collection(db, 'users', userId, 'vocabularySets');
        await addDoc(setsCollectionRef, {
            name,
            description,
            wordCount: 0,
            userId,
            createdAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error adding vocabulary set:', error);
        throw new Error('Thêm bộ từ thất bại');
    }
};

export const updateVocabularySet = async (userId: string, setId: string, name: string, description: string) => {
    try {
        const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
        await updateDoc(setDocRef, { name, description, updatedAt: Timestamp.now() });
    } catch (error) {
        console.error('Error updating vocabulary set:', error);
        throw new Error('Cập nhật bộ từ thất bại');
    }
};

export const deleteVocabularySet = async (userId: string, setId: string) => {
    try {
        const batch = writeBatch(db);
        const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);

        // 1. Xóa tất cả từ vựng trong bộ từ
        const wordsCollectionRef = collection(setDocRef, 'words');
        const wordsSnapshot = await getDocs(wordsCollectionRef);
        wordsSnapshot.docs.forEach(wordDoc => {
            batch.delete(wordDoc.ref);
        });

        // 2. Xóa chính bộ từ
        batch.delete(setDocRef);

        await batch.commit();
    } catch (error) {
        console.error('Error deleting vocabulary set:', error);
        throw new Error('Xóa bộ từ thất bại');
    }
};


// ----------------------------------------------------
// FIRESTORE VOCABULARY WORDS (Giữ nguyên)
// ----------------------------------------------------
// ... (Các hàm addVocabularyWord, updateVocabularyWord, deleteVocabularyWord, addMultipleVocabularyWords)
export const addVocabularyWord = async (userId: string, setId: string, kanji: string, kana: string, meaning: string, notes?: string) => {
  try {
    const wordRef = collection(db, 'users', userId, 'vocabularySets', setId, 'words');
    await addDoc(wordRef, {
      kanji,
      kana,
      meaning,
      notes: notes || '',
      difficulty: 50, // Khởi tạo độ khó
      createdAt: Timestamp.now(),
    });

    // Cập nhật wordCount trong set
    const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
    await updateDoc(setDocRef, { wordCount: increment(1) });

  } catch (error) {
    console.error('Error adding vocabulary word:', error);
    throw new Error('Thêm từ vựng thất bại');
  }
};

export const updateVocabularyWord = async (userId: string, setId: string, wordId: string, kanji: string, kana: string, meaning: string, notes?: string) => {
  try {
    const wordDocRef = doc(db, 'users', userId, 'vocabularySets', setId, 'words', wordId);
    await updateDoc(wordDocRef, {
      kanji,
      kana,
      meaning,
      notes: notes || '',
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating vocabulary word:', error);
    throw new Error('Cập nhật từ vựng thất bại');
  }
};

export const deleteVocabularyWord = async (userId: string, setId: string, wordId: string) => {
  try {
    const batch = writeBatch(db);
    const wordDocRef = doc(db, 'users', userId, 'vocabularySets', setId, 'words', wordId);
    batch.delete(wordDocRef);
    
    // Giảm wordCount
    const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
    batch.update(setDocRef, { wordCount: increment(-1) });
    
    await batch.commit();

  } catch (error) {
    console.error('Error deleting vocabulary word:', error);
    throw new Error('Xóa từ vựng thất bại');
  }
};

export const addMultipleVocabularyWords = async (userId: string, setId: string, words: { kanji: string; kana: string; meaning: string; notes?: string }[]) => {
  try {
    const batch = writeBatch(db);
    const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
    const wordsCollectionRef = collection(setDocRef, 'words');

    words.forEach(word => {
        const newWordRef = doc(wordsCollectionRef);
        batch.set(newWordRef, {
            ...word,
            difficulty: 50,
            createdAt: Timestamp.now(),
        });
    });

    // Cập nhật wordCount trong set
    batch.update(setDocRef, { wordCount: increment(words.length) });

    await batch.commit();

  } catch (error) {
    console.error('Error adding multiple vocabulary words:', error);
    throw new Error('Thêm hàng loạt từ vựng thất bại');
  }
};


// ----------------------------------------------------
// 🧠 FIRESTORE LEARNING MODE (HÀM MỚI)
// ----------------------------------------------------

/**
 * Tải tất cả từ vựng trong một bộ từ cụ thể.
 * @param userId ID người dùng.
 * @param setId ID của bộ từ.
 * @returns Mảng từ vựng (VocabularyWord[]).
 */
export const getVocabularyWords = async (userId: string, setId: string): Promise<VocabularyWord[]> => {
  try {
    const wordsCollectionRef = collection(db, 'users', userId, 'vocabularySets', setId, 'words');
    
    // Tải tất cả từ vựng, sắp xếp theo độ khó (giả định)
    const q = query(wordsCollectionRef, orderBy('difficulty', 'asc')); 
    const wordsSnapshot = await getDocs(q);
    
    const words = wordsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(), 
      difficulty: doc.data().difficulty || 50, // Mặc định 50 nếu không có
    } as VocabularyWord));
    return words;
  } catch (error) {
    console.error('Error fetching vocabulary words:', error);
    throw new Error('Tải từ vựng thất bại');
  }
};

/**
 * Lưu kết quả của một phiên học.
 * @param session Dữ liệu phiên học.
 */
export const saveLearningSession = async (session: SessionData) => {
  try {
    // Lưu vào sub-collection của người dùng
    const sessionsCollectionRef = collection(db, 'users', session.userId, 'learningSessions');
    
    await addDoc(sessionsCollectionRef, {
      ...session,
      // Chuyển đổi Date object thành Firestore Timestamp
      date: Timestamp.fromDate(session.date), 
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving learning session:', error);
    throw new Error('Lưu phiên học thất bại');
  }
};


// ----------------------------------------------------
// 📈 FIRESTORE STATISTICS (HÀM MỚI)
// ----------------------------------------------------

/**
 * Tải lịch sử các phiên học của người dùng.
 * @param userId ID người dùng.
 * @param numSessions Số lượng phiên học muốn tải (mặc định 10).
 * @returns Mảng lịch sử phiên học (LearningSessionHistory[]).
 */
export const getLearningSessions = async (userId: string, numSessions = 10): Promise<LearningSessionHistory[]> => {
  try {
    const sessionsCollectionRef = collection(db, 'users', userId, 'learningSessions');
    // Sắp xếp theo ngày giảm dần và giới hạn số lượng
    const q = query(sessionsCollectionRef, orderBy('date', 'desc'), limit(numSessions));
    const sessionsSnapshot = await getDocs(q);
    
    const sessions = sessionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        wordsLearned: data.wordsLearned,
        points: data.points,
        accuracy: data.accuracy,
        timeSpent: data.timeSpent,
        // Chuyển Timestamp của Firebase thành chuỗi ISO Date cho React
        date: data.date.toDate().toISOString(), 
      };
    }) as LearningSessionHistory[];
    return sessions;
  } catch (error) {
    console.error('Error fetching learning sessions:', error);
    return []; 
  }
};


// ----------------------------------------------------
// FIRESTORE STATISTICS (Giữ nguyên)
// ----------------------------------------------------
export const updateUserStatistics = async (userId: string, stats: any) => {
// ... (Logic giữ nguyên)
  try {
    const userDocRef = doc(db, 'users', userId);
    // ✅ CÂN NHẮC SỬ DỤNG INCREMENT Ở ĐÂY NẾU CẬP NHẬT ĐIỂM SỐ
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
    return userSnap.exists() ? userSnap.data() : null;
  } catch (error) {
    console.error('Get user statistics error:', error);
    throw new Error('Tải thống kê thất bại');
  }
};