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

// 2. CẤU HÌNH FIREBASE CỦA BẠN (Sử dụng cấu hình từ snippet)
const firebaseConfig = {
  apiKey: "AIzaSyBk_wQreKzw0zKQtl7IBYge-W9RPoF1z7U",
  authDomain: "fghy-44958.firebaseapp.com",
  projectId: "fghy-44958",
  storageBucket: "fghy-44958.appspot.com",
  messagingSenderId: "360098045610",
  appId: "1:360098045610:web:10e5882e5b7e3f895c1f6b",
  measurementId: "G-J98FJH88S"
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
    }) as VocabularySet);
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

    // Ghi dữ liệu vào Firestore
    const newSetRef = await addDoc(collection(db, 'users', userId, 'vocabularySets'), newSet);

    // Trả về đối tượng hoàn chỉnh bao gồm ID
    return { 
      id: newSetRef.id, 
      ...newSet, 
    } as VocabularySet; 
  } catch (error) {
    console.error('Error adding vocabulary set:', error);
    throw new Error('Tạo bộ từ thất bại');
  }
};

/**
 * Cập nhật thông tin bộ từ (Đường dẫn Subcollection đã đúng)
 */
export const updateVocabularySet = async (
  userId: string, 
  setId: string, 
  data: Partial<Omit<VocabularySet, 'id' | 'userId' | 'createdAt'>>
) => {
  try {
    const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
    await updateDoc(setDocRef, data);
  } catch (error) {
    console.error('Error updating vocabulary set:', error);
    throw new Error('Cập nhật bộ từ thất bại');
  }
};

/**
 * Xóa bộ từ vựng (Đường dẫn Subcollection đã đúng)
 */
export const deleteVocabularySet = async (userId: string, setId: string) => {
  try {
    const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
    // Lưu ý: Việc xóa các sub-collection ('words') nên được xử lý bằng Cloud Functions
    // hoặc đảm bảo Firestore Rules không ngăn cản việc xóa set này.
    await deleteDoc(setDocRef);
  } catch (error) {
    console.error('Error deleting vocabulary set:', error);
    throw new Error('Xóa bộ từ thất bại');
  }
};

// ----------------------------------------------------
// FIRESTORE VOCABULARY WORDS (Đường dẫn Subcollection đã đúng)
// ----------------------------------------------------

/**
 * Tải danh sách từ vựng trong một bộ từ
 */
export const getVocabularyWords = async (userId: string, setId: string): Promise<VocabularyWord[]> => {
  try {
    const wordsRef = collection(db, 'users', userId, 'vocabularySets', setId, 'words');
    const wordsSnap = await getDocs(wordsRef);

    return wordsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }) as VocabularyWord);
  } catch (error) {
    console.error('Error getting vocabulary words:', error);
    throw new Error('Tải từ vựng thất bại');
  }
};

/**
 * Thêm một từ vựng mới
 */
export const addVocabularyWord = async (
  userId: string, 
  setId: string, 
  wordData: Omit<VocabularyWord, 'id' | 'difficulty' | 'lastReviewed'>
): Promise<VocabularyWord> => {
  try {
    const newWord = {
      ...wordData,
      difficulty: 0, // Mặc định là khó nhất khi mới tạo
      lastReviewed: Timestamp.now(),
    };
    
    const wordsRef = collection(db, 'users', userId, 'vocabularySets', setId, 'words');
    const newWordRef = await addDoc(wordsRef, newWord);

    // Cập nhật totalWords cho bộ từ
    const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
    await updateDoc(setDocRef, {
        totalWords: increment(1)
    });

    return { 
      id: newWordRef.id, 
      ...newWord 
    } as VocabularyWord;
    
  } catch (error) {
    console.error('Error adding vocabulary word:', error);
    throw new Error('Thêm từ vựng thất bại');
  }
};

// Hàm Bulk Import được sử dụng trong VocabularyManager.tsx
addVocabularyWord.bulk = async (
  userId: string,
  setId: string,
  wordDataArray: Omit<VocabularyWord, 'id' | 'difficulty' | 'lastReviewed'>[]
): Promise<VocabularyWord[]> => {
  if (wordDataArray.length === 0) return [];
  
  const batch = writeBatch(db);
  const wordsRef = collection(db, 'users', userId, 'vocabularySets', setId, 'words');
  const addedWords: VocabularyWord[] = [];
  const now = Timestamp.now();

  wordDataArray.forEach(wordData => {
    const newWordRef = doc(wordsRef); // Tạo reference với ID mới
    const newWord = {
      ...wordData,
      difficulty: 0,  
      lastReviewed: now,
    };
    
    batch.set(newWordRef, newWord);
    
    addedWords.push({ 
      id: newWordRef.id, 
      ...newWord 
    } as VocabularyWord);
  });

  try {
    await batch.commit();

    // Cập nhật totalWords cho bộ từ
    const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
    await updateDoc(setDocRef, {
        totalWords: increment(wordDataArray.length)
    });

    return addedWords;

  } catch (error) {
    console.error('Error during bulk import:', error);
    throw new Error('Nhập từ vựng số lượng lớn thất bại');
  }
};


/**
 * Cập nhật thông tin từ vựng
 */
export const updateVocabularyWord = async (
  userId: string, 
  setId: string, 
  wordId: string, 
  data: Partial<Omit<VocabularyWord, 'id' | 'lastReviewed'>>
) => {
  try {
    const wordDocRef = doc(db, 'users', userId, 'vocabularySets', setId, 'words', wordId);
    await updateDoc(wordDocRef, data);
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
    const wordDocRef = doc(db, 'users', userId, 'vocabularySets', setId, 'words', wordId);
    await deleteDoc(wordDocRef);
    
    // Cập nhật totalWords cho bộ từ
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
 * Lưu phiên học và cập nhật độ khó từ vựng
 * @param sessionData - Dữ liệu phiên học
 */
export const saveLearningSession = async (
  userId: string, 
  setId: string, 
  sessionData: Omit<LearningSessionHistory, 'id'>
) => {
  const batch = writeBatch(db);
  const now = Timestamp.now();
  
  try {
    // 1. Lưu session history
    const sessionsRef = collection(db, 'users', userId, 'learningSessions');
    const sessionDocRef = doc(sessionsRef);
    batch.set(sessionDocRef, {
        ...sessionData,
        date: now
    });

    // 2. Cập nhật độ khó của từng từ vựng
    sessionData.wordUpdates.forEach(update => {
        const wordDocRef = doc(db, 'users', userId, 'vocabularySets', setId, 'words', update.wordId);
        batch.update(wordDocRef, {
            difficulty: update.newDifficulty,
            lastReviewed: now
        });
    });

    // 3. Cập nhật thống kê tổng quát của người dùng (tăng điểm, tăng streak,...)
    // Giả định logic tính toán điểm và streak nằm ở component gọi hàm này
    const pointsGained = sessionData.correctAnswers;
    const userDocRef = doc(db, 'users', userId);
    batch.update(userDocRef, {
        totalPoints: increment(pointsGained),
        // Logic streak phức tạp hơn, có thể cần Cloud Function hoặc hàm riêng biệt
        lastUpdated: now
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error saving learning session:', error);
    throw new Error('Lưu phiên học thất bại');
  }
};

/**
 * Tải lịch sử các phiên học (cần cho component Statistics.tsx).
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