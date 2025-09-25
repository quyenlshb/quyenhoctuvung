
/**
 * Firebase Integration Layer
 * Pre-configured Firebase setup ready for production deployment
 * Replace mock auth with Firebase Auth and Firestore
 */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, deleteDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuZ3yW8HGPFhFyvezRMG5ZcVExQ1Lo6fU",
  authDomain: "nihongo-navigator-8yoqm.firebaseapp.com",
  projectId: "nihongo-navigator-8yoqm",
  storageBucket: "nihongo-navigator-8yoqm.firebasestorage.app",
  messagingSenderId: "752831403496",
  appId: "1:752831403496:web:27c95b6c6d198d8582805d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

// Export Firebase services
export { auth, googleProvider, db };

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create user document if doesn't exist
    const userDoc = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDoc);
    
    if (!userSnap.exists()) {
      await setDoc(userDoc, {
        name: user.displayName || user.email?.split('@')[0],
        email: user.email,
        photoURL: user.photoURL || null,
        createdAt: new Date(),
        totalPoints: 0,
        streak: 0,
        totalWordsLearned: 0,
        totalTimeSpent: 0
      });
    }
    
    return user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw new Error('Đăng nhập Google thất bại');
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw new Error('Đăng nhập thất bại');
  }
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Create user document
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      photoURL: null,
      createdAt: new Date(),
      totalPoints: 0,
      streak: 0,
      totalWordsLearned: 0,
      totalTimeSpent: 0
    });
    
    return user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw new Error('Đăng ký thất bại');
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Đăng xuất thất bại');
  }
};

// Real-time auth state observer
export const onAuthStateChangedObserver = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions for vocabulary
export const createUserVocabularySet = async (userId: string, setName: string, setDescription: string) => {
  try {
    const setRef = await addDoc(collection(db, 'vocabularySets'), {
      userId,
      setName,
      setDescription,
      words: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return setRef.id;
  } catch (error) {
    console.error('Create vocabulary set error:', error);
    throw new Error('Tạo bộ từ thất bại');
  }
};

export const updateUserVocabularySet = async (setId: string, updates: any) => {
  try {
    await updateDoc(doc(db, 'vocabularySets', setId), {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Update vocabulary set error:', error);
    throw new Error('Cập nhật bộ từ thất bại');
  }
};

export const deleteVocabularySet = async (setId: string) => {
  try {
    await deleteDoc(doc(db, 'vocabularySets', setId));
  } catch (error) {
    console.error('Delete vocabulary set error:', error);
    throw new Error('Xóa bộ từ thất bại');
  }
};

export const addVocabularyWord = async (setId: string, wordData: any) => {
  try {
    const setDocRef = doc(db, 'vocabularySets', setId);
    const setSnap = await getDoc(setDocRef);
    
    if (setSnap.exists()) {
      const currentWords = setSnap.data().words || [];
      await updateDoc(setDocRef, {
        words: [...currentWords, wordData],
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Add vocabulary word error:', error);
    throw new Error('Thêm từ thất bại');
  }
};

export const deleteVocabularyWord = async (setId: string, wordId: string) => {
  try {
    const setDocRef = doc(db, 'vocabularySets', setId);
    const setSnap = await getDoc(setDocRef);
    
    if (setSnap.exists()) {
      const currentWords = setSnap.data().words || [];
      const updatedWords = currentWords.filter((word: any) => word.id !== wordId);
      await updateDoc(setDocRef, {
        words: updatedWords,
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Delete vocabulary word error:', error);
    throw new Error('Xóa từ thất bại');
  }
};

// Learning session tracking
export const createLearningSession = async (userId: string, sessionData: any) => {
  try {
    await addDoc(collection(db, 'learningSessions'), {
      userId,
      ...sessionData,
      completed: false,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Create learning session error:', error);
    throw new Error('Lưu phiên học thất bại');
  }
};

export const completeLearningSession = async (sessionId: string, sessionResults: any) => {
  try {
    await updateDoc(doc(db, 'learningSessions', sessionId), {
      ...sessionResults,
      completed: true,
      completedAt: new Date()
    });
  } catch (error) {
    console.error('Complete learning session error:', error);
    throw new Error('Cập nhật phiên học thất bại');
  }
};

// User statistics
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
    throw new Error('Lấy thống kê thất bại');
  }
};

// Helper function to convert Firestore timestamp to Date
export const convertTimestamp = (timestamp: any) => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  return timestamp;
};
