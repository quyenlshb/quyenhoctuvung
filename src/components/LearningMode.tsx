/**
 * LearningMode.tsx
 * Chế độ học từ vựng thông minh với scoring
 * Tích hợp Firestore, hỗ trợ 4 lựa chọn, summary, học lại, thống kê
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { CheckCircle, XCircle, RotateCcw, BookOpen, Brain, Target, Clock, Zap, Loader2, BarChart3 } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { getVocabularyWords, saveLearningSession } from '../lib/firebase'
import type { LearningSessionHistory } from '../lib/firebase'

// ----------------- Interfaces -----------------
interface VocabularyWord {
  id: string
  kanji: string
  kana: string
  meaning: string
  notes?: string
  difficulty: number
}

interface LearningSession {
  words: VocabularyWord[]
  currentIndex: number
  correctAnswers: number
  totalAttempts: number
  sessionPoints: number
  timeSpent: number
  startTime: number
}

// ----------------- Subcomponents -----------------
interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <div className="p-3 border rounded-lg flex flex-col items-center">
    {icon}
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    <p className="text-xl font-semibold mt-1">{value}</p>
  </div>
)

interface SessionSummaryProps {
  session: LearningSession
  onRestart: () => void
  onNavigate: (path: string) => void
}

const SessionSummary: React.FC<SessionSummaryProps> = ({ session, onRestart, onNavigate }) => {
  const finalScore = session.sessionPoints
  const totalWords = session.words.length
  const accuracy = totalWords > 0 ? Math.round((session.correctAnswers / session.totalAttempts) * 100) : 0

  return (
    <Card className="max-w-xl mx-auto mt-10 p-8 shadow-2xl bg-white dark:bg-gray-800 border-t-4 border-primary">
      <CardHeader className="text-center">
        <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
        <CardTitle className="text-3xl font-extrabold text-primary">Hoàn thành Buổi Học!</CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">
          Bạn đã hoàn thành <strong>{totalWords}</strong> từ vựng trong phiên này.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-4 space-y-4">
        <div className="flex justify-between items-center p-3 bg-green-50/50 dark:bg-green-900/50 rounded-lg">
          <Zap className="h-5 w-5 text-green-600" />
          <span className="text-lg font-bold text-green-700 dark:text-green-300">+{finalScore} Điểm</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <StatCard icon={<Target className="h-5 w-5 text-blue-500" />} label="Chính xác" value={`${accuracy}%`} />
          <StatCard icon={<Clock className="h-5 w-5 text-indigo-500" />} label="Thời gian" value={`${session.timeSpent}s`} />
        </div>
        <div className="flex flex-col space-y-3 pt-4">
          <Button onClick={onRestart} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" /> Học lại bộ từ này
          </Button>
          <Button variant="outline" onClick={() => onNavigate('/statistics')} className="w-full">
            <BarChart3 className="h-4 w-4 mr-2" /> Xem Thống kê
          </Button>
          <Button variant="outline" onClick={() => onNavigate('/vocabulary')} className="w-full">
            <BookOpen className="h-4 w-4 mr-2" /> Quản lý Từ vựng
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ----------------- Main Component -----------------
export default function LearningMode() {
  const { user } = useAuth()
  const { setId } = useParams<{ setId: string }>()
  const navigate = useNavigate()

  const [wordsToLearn, setWordsToLearn] = useState<VocabularyWord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const initialSession: LearningSession = useMemo(() => ({
    words: wordsToLearn,
    currentIndex: 0,
    correctAnswers: 0,
    totalAttempts: 0,
    sessionPoints: 0,
    timeSpent: 0,
    startTime: Date.now()
  }), [wordsToLearn])

  const [session, setSession] = useState<LearningSession>(initialSession)
  const [showResult, setShowResult] = useState<'correct' | 'incorrect' | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)

  // ----------------- Fetch words -----------------
  useEffect(() => {
    if (!user?.id || !setId) return

    const fetchWords = async () => {
      setIsLoading(true)
      try {
        const fetchedWords = await getVocabularyWords(user.id, setId)
        const shuffledWords = fetchedWords.sort(() => 0.5 - Math.random()).slice(0, 10)
        setWordsToLearn(shuffledWords)
        setSession(prev => ({ ...prev, words: shuffledWords, startTime: Date.now() }))
      } catch (error) {
        console.error('Không thể tải từ vựng:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWords()
  }, [user?.id, setId])

  // Reset session khi wordsToLearn thay đổi
  useEffect(() => {
    setSession(initialSession)
  }, [initialSession])
  // ----------------- Answer Options -----------------
  const currentWord = session.words[session.currentIndex]
  const answerOptions = useMemo(() => {
    if (!currentWord) return []

    const incorrectWords = session.words
      .filter(w => w.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.meaning)

    return [currentWord.meaning, ...incorrectWords].sort(() => 0.5 - Math.random())
  }, [currentWord, session.words])

  // ----------------- Handlers -----------------
  const handleAnswerClick = (option: string) => {
    if (showResult) return

    setSelectedAnswer(option)
    const isCorrect = option === currentWord.meaning

    setSession(prev => ({
      ...prev,
      totalAttempts: prev.totalAttempts + 1,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      sessionPoints: isCorrect ? prev.sessionPoints + 10 : prev.sessionPoints
    }))

    setShowResult(isCorrect ? 'correct' : 'incorrect')
  }

  const handleNextQuestion = useCallback(() => {
    setShowResult(null)
    setSelectedAnswer(null)

    if (session.currentIndex >= session.words.length - 1) {
      handleFinishSession()
    } else {
      setSession(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }))
    }
  }, [session.currentIndex, session.words.length])

  const handleFinishSession = async () => {
    if (!user) return

    const timeInSeconds = Math.round((Date.now() - session.startTime) / 1000)
    const finalSessionData: LearningSessionHistory = {
      id: '',
      userId: user.id,
      wordsLearned: session.totalAttempts,
      points: session.sessionPoints,
      accuracy: session.totalAttempts > 0 ? session.correctAnswers / session.totalAttempts : 0,
      timeSpent: timeInSeconds,
      date: new Date(),
      setId: setId || ''
    }

    try {
      await saveLearningSession(finalSessionData)
      setSession(prev => ({ ...prev, timeSpent: timeInSeconds }))
    } catch (error) {
      console.error('Lưu phiên học thất bại:', error)
    }

    setShowSummary(true)
  }

  const handleRestart = () => {
    setSession(prev => ({
      ...initialSession,
      words: prev.words.sort(() => 0.5 - Math.random()),
      startTime: Date.now()
    }))
    setShowSummary(false)
  }

  const getScoreColor = () => {
    const accuracy = session.totalAttempts > 0 ? session.correctAnswers / session.totalAttempts : 0
    if (accuracy >= 0.75) return 'text-green-500 dark:text-green-400'
    if (accuracy >= 0.5) return 'text-yellow-500 dark:text-yellow-400'
    return 'text-red-500 dark:text-red-400'
  }

  // ----------------- Render -----------------
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
        <p className="text-gray-500 dark:text-gray-400">Đang tải từ vựng cho phiên học...</p>
      </div>
    )
  }

  if (!isLoading && wordsToLearn.length === 0) {
    return (
      <Card className="max-w-xl mx-auto mt-10">
        <CardHeader>
          <CardTitle>Không tìm thấy từ vựng</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Bộ từ này chưa có từ vựng nào, hoặc bạn chưa chọn bộ từ. Vui lòng thêm từ vựng hoặc{' '}
            <Button variant="link" onClick={() => navigate('/vocabulary')}>
              quay lại trang Quản lý Từ vựng
            </Button>
          </p>
        </CardContent>
      </Card>
    )
  }

  if (showSummary) {
    return <SessionSummary session={session} onRestart={handleRestart} onNavigate={navigate} />
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:p-0">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Chế độ Học tập</h2>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">
          <span>Tiến trình</span>
          <span>
            {session.currentIndex + 1} / {session.words.length}
          </span>
        </div>
        <Progress value={((session.currentIndex + 1) / session.words.length) * 100} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="bg-white dark:bg-gray-800 shadow-xl border-t-4 border-primary">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl md:text-3xl font-extrabold text-primary">
              {currentWord?.kanji || currentWord?.kana}
            </CardTitle>
            <Badge variant="secondary" className="text-md">
              <Zap className="h-4 w-4 mr-1 fill-yellow-400 stroke-yellow-500" /> +10 XP
            </Badge>
          </div>
          {currentWord?.kana && currentWord.kana !== currentWord.kanji && (
            <CardDescription className="text-lg mt-1">{currentWord.kana}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Answer Options */}
          <div className="space-y-3">
            {answerOptions.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className={`w-full h-auto py-3 text-left justify-start text-base font-normal transition-colors
                  ${showResult === 'correct' && option === currentWord.meaning ? 'bg-green-100 dark:bg-green-900/50 border-green-500' : ''}
                  ${showResult === 'incorrect' && option === selectedAnswer ? 'bg-red-100 dark:bg-red-900/50 border-red-500' : ''}
                  ${showResult && option === currentWord.meaning && showResult !== 'correct' ? 'border-green-500' : ''}
                `}
                onClick={() => handleAnswerClick(option)}
                disabled={!!showResult}
              >
                {showResult && (
                  <span className="mr-3">
                    {option === currentWord.meaning ? (
                      <CheckCircle className="h-5 w-5 text-green-500 fill-green-100 dark:fill-green-900" />
                    ) : option === selectedAnswer ? (
                      <XCircle className="h-5 w-5 text-red-500 fill-red-100 dark:fill-red-900" />
                    ) : (
                      <Brain className="h-5 w-5 text-gray-400" />
                    )}
                  </span>
                )}
                <span className="flex-1">{option}</span>
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {showResult && (
              <Button className="w-full" onClick={handleNextQuestion}>
                {session.currentIndex < session.words.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
              </Button>
            )}
            {!showResult && (
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => handleAnswerClick('Chưa biết')}
              >
                Chưa biết
              </Button>
            )}
          </div>

          {/* Session Stats */}
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
                    : 0}
                  %
                </span>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
