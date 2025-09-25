
/**
 * Learning Mode Component
 * Implements smart learning algorithm with difficulty scoring
 * Displays vocabulary questions with 4 answer options
 */

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  BookOpen,
  Brain,
  Target
} from 'lucide-react'

interface VocabularyWord {
  id: string
  kanji: string
  kana: string
  meaning: string
  notes?: string
  difficulty: number // Score from 0-100, lower means more difficult
}

interface LearningSession {
  words: VocabularyWord[]
  currentIndex: number
  correctAnswers: number
  totalAttempts: number
  sessionPoints: number
}

export default function LearningMode() {
  const [session, setSession] = useState<LearningSession>({
    words: [],
    currentIndex: 0,
    correctAnswers: 0,
    totalAttempts: 0,
    sessionPoints: 0
  })
  
  const [currentWord, setCurrentWord] = useState<VocabularyWord | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState<boolean>(false)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [questionCount, setQuestionCount] = useState<number>(0)
  const [timer, setTimer] = useState<number>(0)
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false)

  // Mock vocabulary data with difficulty scores
  const mockVocabulary: VocabularyWord[] = [
    { id: '1', kanji: '学生', kana: 'がくせい', meaning: 'Học sinh', difficulty: 30 },
    { id: '2', kanji: '先生', kana: 'せんせい', meaning: 'Giáo viên', difficulty: 25 },
    { id: '3', kanji: '学校', kana: 'がっこう', meaning: 'Trường học', difficulty: 40 },
    { id: '4', kanji: '図書館', kana: 'としょかん', meaning: 'Thư viện', difficulty: 20 },
    { id: '5', kanji: '友達', kana: 'ともだち', meaning: 'Bạn bè', difficulty: 50 },
    { id: '6', kanji: '家族', kana: 'かぞく', meaning: 'Gia đình', difficulty: 60 },
    { id: '7', kanji: '時間', kana: 'じかん', meaning: 'Thời gian', difficulty: 35 },
    { id: '8', kanji: '勉強', kana: 'べんきょう', meaning: 'Học tập', difficulty: 45 }
  ]

  // Initialize learning session
  useEffect(() => {
    startNewSession()
  }, [])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerActive])

  const startNewSession = () => {
    // Smart algorithm: select words with lowest difficulty scores
    const sortedWords = [...mockVocabulary].sort((a, b) => a.difficulty - b.difficulty)
    const selectedWords = sortedWords.slice(0, 5) // Select 5 most difficult words
    
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
  }

  const loadQuestion = (word: VocabularyWord) => {
    setCurrentWord(word)
    setSelectedAnswer(null)
    setShowResult(false)
    setShowDetails(false)
    
    // Generate 4 options including the correct answer
    const allMeanings = mockVocabulary.map(w => w.meaning)
    const wrongOptions = allMeanings.filter(m => m !== word.meaning)
    const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3)
    const allOptions = [word.meaning, ...shuffledWrong].sort(() => Math.random() - 0.5)
    
    setOptions(allOptions)
  }

  const handleAnswer = (answer: string) => {
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
    
    // Update word difficulty based on answer
    if (currentWord) {
      const difficultyChange = isCorrect ? 5 : -10 // Correct: +5, Wrong: -10
      const newDifficulty = Math.max(0, Math.min(100, currentWord.difficulty + difficultyChange))
      
      // In real app, this would update Firestore
      console.log(`Word ${currentWord.kanji} difficulty: ${currentWord.difficulty} -> ${newDifficulty}`)
    }
  }

  const nextQuestion = () => {
    if (session.currentIndex < session.words.length - 1) {
      const nextIndex = session.currentIndex + 1
      setSession(prev => ({ ...prev, currentIndex: nextIndex }))
      loadQuestion(session.words[nextIndex])
      setTimer(0)
      setIsTimerActive(true)
    } else {
      // Session completed
      setIsTimerActive(false)
    }
  }

  const getScoreColor = () => {
    const percentage = session.totalAttempts > 0 
      ? (session.correctAnswers / session.totalAttempts) * 100 
      : 0
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (session.currentIndex >= session.words.length && session.words.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 mr-2" />
              Hoàn thành!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-lg mb-2">Phiên học đã kết thúc</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {session.sessionPoints}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Điểm</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round((session.correctAnswers / session.totalAttempts) * 100)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Độ chính xác</p>
                </div>
              </div>
              <Button onClick={startNewSession} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Học tiếp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header with progress */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Câu {session.currentIndex + 1}/{session.words.length}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-transparent">
              {formatTime(timer)}
            </Badge>
            <Badge variant="outline" className="bg-transparent">
              {session.sessionPoints} điểm
            </Badge>
          </div>
        </div>

        <Progress 
          value={(session.currentIndex / session.words.length) * 100} 
          className="mb-6 h-2" 
        />

        {/* Question card */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl mb-6">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl mb-2">{currentWord?.kanji}</CardTitle>
            {!showDetails && (
              <p className="text-gray-500 text-lg">{currentWord?.kana}</p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-3">
            {showDetails ? (
              <div className="space-y-3 text-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Kana</p>
                  <p className="text-lg font-medium">{currentWord?.kana}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nghĩa</p>
                  <p className="text-lg font-medium text-green-600">{currentWord?.meaning}</p>
                </div>
                {currentWord?.notes && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ghi chú</p>
                    <p className="text-gray-700 dark:text-gray-300">{currentWord.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full h-auto p-4 text-left justify-start bg-transparent
                      ${selectedAnswer === option ? 'ring-2 ring-blue-500' : ''}
                      ${showResult && option === currentWord?.meaning ? 'bg-green-100 dark:bg-green-900/20 border-green-500' : ''}
                      ${showResult && selectedAnswer === option && option !== currentWord?.meaning ? 'bg-red-100 dark:bg-red-900/20 border-red-500' : ''}
                    `}
                    onClick={() => handleAnswer(option)}
                    disabled={showResult}
                  >
                    <span className="flex-1">{option}</span>
                    {showResult && option === currentWord?.meaning && (
                      <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                    )}
                    {showResult && selectedAnswer === option && option !== currentWord?.meaning && (
                      <XCircle className="h-5 w-5 text-red-600 ml-2" />
                    )}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="space-y-3">
          {showResult && !showDetails && (
            <Button 
              variant="outline" 
              className="w-full bg-transparent"
              onClick={() => setShowDetails(true)}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Xem chi tiết
            </Button>
          )}
          
          {showResult && (
            <Button 
              className="w-full"
              onClick={nextQuestion}
            >
              {session.currentIndex < session.words.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
            </Button>
          )}
          
          {!showResult && (
            <Button 
              variant="outline" 
              className="w-full bg-transparent"
              onClick={() => {
                setShowDetails(true)
                setShowResult(true)
                setIsTimerActive(false)
              }}
            >
              Chưa biết
            </Button>
          )}
        </div>

        {/* Session stats */}
        <Card className="mt-6 bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  Chính xác: {session.correctAnswers}/{session.totalAttempts}
                </span>
              </div>
              <span className={`font-medium ${getScoreColor()}`}>
                {session.totalAttempts > 0 
                  ? Math.round((session.correctAnswers / session.totalAttempts) * 100)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
