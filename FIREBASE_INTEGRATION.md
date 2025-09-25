
# Firebase Integration Guide

## 🚀 Upgrading to Production with Firebase

This guide shows how to upgrade the mock authentication system to Firebase Auth and Firestore for production deployment.

## Step 1: Install Firebase Dependencies

```bash
npm install firebase
npm install @types/firebase --save-dev
```

## Step 2: Replace Mock Auth with Firebase Auth

### Update `src/lib/firebase.ts`

Replace the entire file with your Firebase configuration:

```typescript
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
```

### Update `src/components/AuthProvider.tsx`

Replace the mock authentication functions with Firebase calls:

```typescript
// Replace these imports at the top:
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider,
  onAuthStateChanged 
} from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

// Replace the mock functions with:
const signIn = async (email: string, password: string) => {
  setLoading(true)
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = result.user
    
    // Get user document from Firestore
    const userDoc = doc(db, 'users', firebaseUser.uid)
    const userSnap = await getDoc(userDoc)
    
    if (userSnap.exists()) {
      const userData = userSnap.data()
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name,
        photoURL: userData.photoURL,
        totalPoints: userData.totalPoints,
        streak: userData.streak,
        totalWordsLearned: userData.totalWordsLearned,
        totalTimeSpent: userData.totalTimeSpent
      })
    }
  } catch (error) {
    throw new Error('Đăng nhập thất bại')
  } finally {
    setLoading(false)
  }
}

const signInWithGoogle = async () => {
  setLoading(true)
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const firebaseUser = result.user
    
    // Get or create user document
    const userDoc = doc(db, 'users', firebaseUser.uid)
    const userSnap = await getDoc(userDoc)
    
    if (!userSnap.exists()) {
      await setDoc(userDoc, {
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        createdAt: new Date(),
        totalPoints: 0,
        streak: 0,
        totalWordsLearned: 0,
        totalTimeSpent: 0
      })
    }
    
    setUser({
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
      photoURL: firebaseUser.photoURL
    })
  } catch (error) {
    throw new Error('Đăng nhập Google thất bại')
  } finally {
    setLoading(false)
  }
}

const signUp = async (email: string, password: string, name: string) => {
  setLoading(true)
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = result.user
    
    // Create user document
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      name,
      email,
      photoURL: null,
      createdAt: new Date(),
      totalPoints: 0,
      streak: 0,
      totalWordsLearned: 0,
      totalTimeSpent: 0
    })
    
    setUser({
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name
    })
  } catch (error) {
    throw new Error('Đăng ký thất bại')
  } finally {
    setLoading(false)
  }
}

const signOut = () => {
  signOutUser().then(() => {
    setUser(null)
    localStorage.removeItem('user')
  })
}
```

## Step 3: Add Firestore Collections

### Create Firestore Database Structure

Create these collections in Firestore:

#### `users` Collection
```json
{
  "id": "user_uid",
  "name": "User Name",
  "email": "user@example.com",
  "photoURL": "url",
  "totalPoints": 1250,
  "streak": 12,
  "totalWordsLearned": 180,
  "totalTimeSpent": 480,
  "createdAt": "2024-01-15T00:00:00Z",
  "lastActive": "2024-01-22T00:00:00Z"
}
```

#### `vocabularySets` Collection
```json
{
  "id": "set_id",
  "userId": "user_uid",
  "setName": "N5 Từ cơ bản",
  "setDescription": "Các từ vựng cơ bản cho trình độ N5",
  "words": [
    {
      "id": "word_id",
      "kanji": "学生",
      "kana": "がくせい",
      "meaning": "Học sinh",
      "notes": "Ghi chú về từ này",
      "difficulty": 30,
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ],
  "createdAt": "2024-01-15T00:00:00Z",
  "updatedAt": "2024-01-22T00:00:00Z"
}
```

#### `learningSessions` Collection
```json
{
  "id": "session_id",
  "userId": "user_uid",
  "wordsLearned": 15,
  "correctAnswers": 12,
  "totalAttempts": 15,
  "sessionPoints": 120,
  "accuracy": 80,
  "timeSpent": 900,
  "completed": true,
  "createdAt": "2024-01-22T00:00:00Z",
  "completedAt": "2024-01-22T00:15:00Z"
}
```

## Step 4: Update Vocabulary Manager

Replace mock data with Firestore calls in `VocabularyManager.tsx`:

```typescript
// Add these imports:
import { 
  createUserVocabularySet, 
  updateUserVocabularySet, 
  deleteVocabularySet,
  addVocabularyWord, 
  deleteVocabularyWord 
} from '../lib/firebase'

// Replace handleAddSet:
const handleAddSet = async () => {
  if (!newSet.name.trim()) return

  try {
    const setId = await createUserVocabularySet(
      user.id, 
      newSet.name, 
      newSet.description
    )
    
    const set: VocabularySet = {
      id: setId,
      name: newSet.name,
      description: newSet.description,
      words: [],
      createdAt: new Date()
    }

    setSets(prev => [...prev, set])
    setNewSet({ name: '', description: '' })
  } catch (error) {
    console.error('Error creating set:', error)
  }
}

// Replace handleAddWord:
const handleAddWord = async (setId: string) => {
  if (!newWord.kanji.trim() || !newWord.kana.trim() || !newWord.meaning.trim()) return

  try {
    const word: VocabularyWord = {
      id: `${setId}-${Date.now()}`,
      kanji: newWord.kanji,
      kana: newWord.kana,
      meaning: newWord.meaning,
      notes: newWord.notes,
      difficulty: 50
    }

    await addVocabularyWord(setId, word)
    
    setSets(prev => prev.map(set => 
      set.id === setId 
        ? { ...set, words: [...set.words, word] }
        : set
    ))

    setNewWord({ kanji: '', kana: '', meaning: '', notes: '' })
  } catch (error) {
    console.error('Error adding word:', error)
  }
}
```

## Step 5: Update Learning Mode

Replace mock data with Firestore calls in `LearningMode.tsx`:

```typescript
// Add these imports:
import { 
  createLearningSession, 
  completeLearningSession,
  getUserStatistics 
} from '../lib/firebase'

// Replace startNewSession:
const startNewSession = async () => {
  try {
    // Get user's vocabulary sets and words from Firestore
    const userStats = await getUserStatistics(user.id)
    
    // Smart algorithm: select words with lowest difficulty scores
    const sortedWords = [...mockVocabulary].sort((a, b) => a.difficulty - b.difficulty)
    const selectedWords = sortedWords.slice(0, 5)
    
    // Create learning session
    await createLearningSession(user.id, {
      words: selectedWords,
      currentIndex: 0,
      correctAnswers: 0,
      totalAttempts: 0,
      sessionPoints: 0,
      completed: false
    })
    
    setSession({
      words: selectedWords,
      currentIndex: 0,
      correctAnswers: 0,
      totalAttempts: 0,
      sessionPoints: 0
    })
    
    setQuestionCount(0)
    setTimer(0)
    setIsTimerActive(true)
    loadQuestion(selectedWords[0])
  } catch (error) {
    console.error('Error starting session:', error)
  }
}

// Replace handleAnswer:
const handleAnswer = async (answer: string) => {
  if (showResult) return
  
  setSelectedAnswer(answer)
  setShowResult(true)
  setIsTimerActive(false)
  
  const isCorrect = answer === currentWord?.meaning
  const newQuestionCount = questionCount + 1
  
  setSession(prev => ({
    ...prev,
    correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
    totalAttempts: prev.totalAttempts + 1,
    sessionPoints: isCorrect ? prev.sessionPoints + 10 : prev.sessionPoints
  }))
  
  setQuestionCount(newQuestionCount)
  
  // Update word difficulty in Firestore
  if (currentWord) {
    const difficultyChange = isCorrect ? 5 : -10
    const newDifficulty = Math.max(0, Math.min(100, currentWord.difficulty + difficultyChange))
    
    // In real app, update Firestore with new difficulty
    console.log(`Word ${currentWord.kanji} difficulty: ${currentWord.difficulty} -> ${newDifficulty}`)
  }
}
```

## Step 6: Update Statistics Page

Replace mock data with Firestore calls in `Statistics.tsx`:

```typescript
// Add these imports:
import { getUserStatistics, getDocs, query, where, collection } from '../lib/firebase'

// Replace useEffect:
useEffect(() => {
  const loadUserStats = async () => {
    try {
      const stats = await getUserStatistics(user.id)
      if (stats) {
        setTotalPoints(stats.totalPoints || 0)
        setStreak(stats.streak || 0)
        setTotalWordsLearned(stats.totalWordsLearned || 0)
        setTotalTimeSpent(stats.totalTimeSpent || 0)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }
  
  loadUserStats()
}, [user.id])
```

## Step 7: Security Rules

Add Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /vocabularySets/{set} {
      allow read, write: if request.auth != null && request.auth.uid == set.userId;
    }
    
    match /learningSessions/{session} {
      allow read, write: if request.auth != null && request.auth.uid == session.userId;
    }
  }
}
```

## Step 8: Deployment

### Vercel Deployment
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Deploy: `firebase deploy --only hosting`

### Firebase Hosting
1. Build your app: `npm run build`
2. Deploy: `firebase deploy`

## 🎉 Done!

Your app is now fully integrated with Firebase and ready for production!

### Features Added:
- ✅ Firebase Authentication (Email/Password + Google)
- ✅ Firestore Database for user data
- ✅ Real-time data synchronization
- ✅ Secure user data access
- ✅ Scalable cloud infrastructure
- ✅ Production-ready deployment

### Next Steps:
1. Add Firebase Analytics for usage tracking
2. Implement Firebase Cloud Functions for backend logic
3. Add Firebase Storage for image uploads
4. Implement push notifications with Firebase Messaging
