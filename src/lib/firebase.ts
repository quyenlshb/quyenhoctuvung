/**
 * Firebase Integration Layer
 * Pre-configured Firebase setup ready for production deployment
 */

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"; 
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, doc, setDoc, getDoc, collection, addDoc, query, 
  getDocs, updateDoc, deleteDoc, Timestamp, orderBy, writeBatch, increment 
} from "firebase/firestore";

// ----------------- Firebase config -----------------
const firebaseConfig = {
  apiKey: "AIzaSyDJRsHMjU2G2BAtR3ZC9TlYjP0QMu1xSaw",
  authDomain: "qwer-c9de3.firebaseapp.com",
  projectId: "qwer-c9de3",
  storageBucket: "qwer-c9de3.firebasestorage.app",
  messagingSenderId: "144621785008",
  appId: "1:144621785008:web:97ce2b548fd1c26c629075",
  measurementId: "G-CJ1KJL5WWY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app); 
export const googleProvider = new GoogleAuthProvider();

export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup, Timestamp };

// ----------------- Interfaces -----------------
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
  totalWords: number;
}

export interface VocabularyWord {
  id: string;
  kanji: string;
  kana: string;
  meaning: string;
  notes?: string;
  difficulty: number;
  lastReviewed?: Timestamp;
}

export interface LearningSessionHistory {
  id: string;
  date: Timestamp;
  correctAnswers: number;
  totalAttempts: number;
  wordUpdates: Array<{ wordId: string; newDifficulty: number; oldDifficulty: number }>;
}

// ----------------- User functions -----------------
export const saveUserData = async (userId: string, email: string, name: string, photoURL?: string) => {
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, {
    email,
    name,
    photoURL: photoURL || null,
    totalPoints: 0,
    streak: 0,
    totalWords: 0,
    createdAt: Timestamp.now(),
  }, { merge: true });
};

export const getUserData = async (userId: string): Promise<User | null> => {
  const userDocRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userDocRef);
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } as User : null;
};

// ----------------- Vocabulary Sets -----------------
export const getVocabularySets = async (userId: string): Promise<VocabularySet[]> => {
  const setsRef = collection(db, 'users', userId, 'vocabularySets');
  const setsSnap = await getDocs(setsRef);
  return setsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VocabularySet[];
};

export const addVocabularySet = async (userId: string, name: string, description: string): Promise<VocabularySet> => {
  const newSet = { name, description, userId, createdAt: Timestamp.now(), totalWords: 0 };
  const setDocRef = await addDoc(collection(db, 'users', userId, 'vocabularySets'), newSet);
  return { id: setDocRef.id, ...newSet } as VocabularySet;
};

export const updateVocabularySet = async (userId: string, setId: string, name: string, description: string) => {
  const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
  await updateDoc(setDocRef, { name, description });
};

export const deleteVocabularySet = async (userId: string, setId: string) => {
  const batch = writeBatch(db);
  const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
  const wordsRef = collection(setDocRef, 'words');
  const wordsSnap = await getDocs(wordsRef);
  wordsSnap.docs.forEach(wordDoc => batch.delete(wordDoc.ref));
  batch.delete(setDocRef);
  await batch.commit();
};

// ----------------- Vocabulary Words -----------------
export const getVocabularyWords = async (userId: string, setId: string): Promise<VocabularyWord[]> => {
  const wordsRef = collection(db, 'users', userId, 'vocabularySets', setId, 'words');
  const q = query(wordsRef, orderBy('difficulty', 'asc'));
  const wordsSnap = await getDocs(q);
  return wordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VocabularyWord[];
};

export const addVocabularyWord = async (
  userId: string, 
  setId: string, 
  word: Omit<VocabularyWord, 'id' | 'lastReviewed'>
): Promise<VocabularyWord> => {
  const wordsRef = collection(db, 'users', userId, 'vocabularySets', setId, 'words');
  const newWordPayload = { ...word, difficulty: 50, lastReviewed: null, createdAt: Timestamp.now() };
  const wordDocRef = await addDoc(wordsRef, newWordPayload);

  const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
  await updateDoc(setDocRef, { totalWords: increment(1) });

  return { id: wordDocRef.id, ...newWordPayload } as VocabularyWord;
};

export const updateVocabularyWord = async (userId: string, setId: string, wordId: string, updates: Partial<VocabularyWord>) => {
  const wordDocRef = doc(db, 'users', userId, 'vocabularySets', setId, 'words', wordId);
  await updateDoc(wordDocRef, updates);
};

export const deleteVocabularyWord = async (userId: string, setId: string, wordId: string) => {
  const wordDocRef = doc(db, 'users', userId, 'vocabularySets', setId, 'words', wordId);
  await deleteDoc(wordDocRef);

  const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);
  await updateDoc(setDocRef, { totalWords: increment(-1) });
};

/**
 * ✅ Bulk Import Words
 */
export const bulkAddVocabularyWords = async (
  userId: string,
  setId: string,
  words: Omit<VocabularyWord, 'id' | 'difficulty' | 'lastReviewed'>[]
): Promise<VocabularyWord[]> => {
  const batch = writeBatch(db);
  const newWords: VocabularyWord[] = [];
  const setDocRef = doc(db, 'users', userId, 'vocabularySets', setId);

  words.forEach(word => {
    const wordRef = doc(collection(db, 'users', userId, 'vocabularySets', setId, 'words'));
    const wordData = { ...word, difficulty: 50, lastReviewed: null, createdAt: Timestamp.now() };
    batch.set(wordRef, wordData);
    newWords.push({ id: wordRef.id, ...wordData });
  });

  batch.update(setDocRef, { totalWords: increment(words.length) });
  await batch.commit();

  return newWords;
};

// ----------------- Learning Sessions -----------------
export const saveLearningSession = async (userId: string, sessionData: Omit<LearningSessionHistory, 'id'>) => {
  const sessionsRef = collection(db, 'users', userId, 'learningSessions');
  await addDoc(sessionsRef, { ...sessionData, date: Timestamp.now() });
};

export const getLearningSessions = async (userId: string): Promise<LearningSessionHistory[]> => {
  const sessionsRef = collection(db, 'users', userId, 'learningSessions');
  const q = query(sessionsRef, orderBy('date', 'desc'));
  const sessionsSnap = await getDocs(q);
  return sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LearningSessionHistory[];
};

// ----------------- Statistics -----------------
export const updateUserStatistics = async (userId: string, stats: any) => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { ...stats, lastUpdated: new Date() });
};

export const getUserStatistics = async (userId: string) => {
  const userDocRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userDocRef);
  return userSnap.exists() ? userSnap.data() : null;
};
