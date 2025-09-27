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
  RotateCcw, // Thêm RotateCcw cho nút Restart
  BookOpen, // Thêm BookOpen cho SessionSummary
  Brain,
  Target,
  Clock, // Thêm Clock cho Timer
  Zap // Thêm Zap cho điểm
} from 'lucide-react'
import { useAuth } from './AuthProvider' // Giả định dùng Auth

// ----------------------------------------------------
// INTERFACES
// ----------------------------------------------------
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

// ----------------------------------------------------
// COMPONENT TÓM TẮT PHIÊN HỌC (NEW)
// ----------------------------------------------------
interface SessionSummaryProps {
  session: LearningSession
  onRestart: () => void
}

const SessionSummary = ({ session, onRestart }: SessionSummaryProps) => {
  const { correctAnswers, totalAttempts, sessionPoints, words } = session
  const percentage = totalAttempts > 0 
    ? Math.round((correctAnswers / totalAttempts) * 100)
    : 0
  
  return (
    <Card className="shadow-2xl text-center border-0 bg-white dark:bg-gray-800">
      <CardHeader className="pt-8">
        <BookOpen className="h-10 w-10 mx-auto text-primary mb-2" />
        <CardTitle className="text-3xl font-bold">Phiên Học Đã Hoàn Thành!</CardTitle>
        <p className="text-gray-600 dark:text-gray-400">
          Bạn đã ôn tập **{words.length}** từ vựng.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pb-8">
        
        <div className="grid grid-cols-3 gap-4 text-center font-medium">
          <div className="space-y-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Chính xác</p>
            <p className="text-xl font-bold text-green-500">{correctAnswers}/{totalAttempts}</p>
          </div>
          <div className="space-y-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Điểm</p>
            <p className="text-xl font-bold text-yellow-500">{sessionPoints} <Zap className="h-5 w-5 inline-block" /></p>
          </div>
          <div className="space-y-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Tỷ lệ</p>
            <p className={`text-xl font-bold ${percentage >= 70 ? 'text-primary' : 'text-orange-500'}`}>{percentage}%</p>
          </div>
        </div>
        
        <Button onClick={onRestart} className="w-full">
          <RotateCcw className="h-4 w-4 mr-2" /> Bắt đầu phiên mới
        </Button>
      </CardContent>
    </Card>
  )
}

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------

export default function LearningMode() {
  const { user } = useAuth() // Giả định useAuth đã được import

  // Mock data (thay thế bằng logic fetch thực tế)
  const mockWords: VocabularyWord[] = [
    { id: '1', kanji: '私', kana: 'わたし', meaning: 'Tôi', difficulty: 50 },
    { id: '2', kanji: '食べる', kana: 'たべる', meaning: 'Ăn', difficulty: 40 },
    { id: '3', kanji: '行く', kana: 'いく', meaning: 'Đi', difficulty: 60 },
    { id: '4', kanji: '犬', kana: 'いぬ', meaning: 'Chó', difficulty: 30 },
    { id: '5', kanji: '本', kana: 'ほん', meaning: 'Sách', difficulty: 70 },
  ]

  const [session, setSession] = useState<LearningSession>({
    words: [],
    currentIndex: 0,
    correctAnswers: 0,
    totalAttempts: 0,
    sessionPoints: 0
  })
  
  const [currentWord, setCurrentWord] = useState<VocabularyWord | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15) // Giả định 15s/câu

  // ✅ NEW STATE: Trạng thái hoàn tất phiên học
  const [isSessionComplete, setIsSessionComplete] = useState(false) 

  // ----------------------------------------------------
  // UTILS
  // ----------------------------------------------------
  
  const generateOptions = (correctMeaning: string, allWords: VocabularyWord[]) => {
    const incorrectMeanings = allWords
      .map(w => w.meaning)
      .filter(m => m !== correctMeaning)
    
    // Chọn ngẫu nhiên 3 đáp án sai
    const shuffledIncorrect = incorrectMeanings.sort(() => 0.5 - Math.random())
    const selectedIncorrect = shuffledIncorrect.slice(0, 3)
    
    // Kết hợp đáp án đúng và đáp án sai, sau đó xáo trộn
    const finalOptions = [...selectedIncorrect, correctMeaning]
    return finalOptions.sort(() => 0.5 - Math.random())
  }
  
  const getScoreColor = () => {
    const percentage = session.totalAttempts > 0 
      ? (session.correctAnswers / session.totalAttempts) * 100
      : 0
      
    if (percentage >= 80) return 'text-green-500'
    if (percentage >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  // ----------------------------------------------------
  // LOGIC PHIÊN HỌC
  // ----------------------------------------------------
  
  const startSession = (words: VocabularyWord[]) => {
    if (words.length === 0) return
    
    // Đặt lại trạng thái
    setSession({
      words: words,
      currentIndex: 0,
      correctAnswers: 0,
      totalAttempts: 0,
      sessionPoints: 0
    })
    
    setIsSessionComplete(false) // Bắt đầu phiên học mới
    setCurrentWord(words[0])
    setOptions(generateOptions(words[0].meaning, words))
    setSelectedOption(null)
    setShowResult(false)
    setIsCorrect(null)
    setShowDetails(false)
    setIsTimerActive(true)
    setTimeLeft(15)
  }
  
  // ✅ NEW FUNCTION: Xử lý kết thúc phiên học
  const endSession = () => {
    setIsTimerActive(false)
    
    // Logic lưu điểm (Tạm thời chỉ cập nhật UI)
    // Cần tích hợp updateUserStatistics từ firebase.ts ở đây trong thực tế
    
    // Cập nhật trạng thái hoàn tất để hiển thị Summary
    setIsSessionComplete(true)
  }
  
  const nextQuestion = () => {
    // 1. Kiểm tra xem đã là từ cuối cùng chưa
    if (session.currentIndex >= session.words.length - 1) {
      endSession() // Gọi hàm kết thúc phiên
      return
    }
    
    // 2. Chuyển sang từ tiếp theo
    const nextIndex = session.currentIndex + 1
    const nextWord = session.words[nextIndex]
    
    setSession(prev => ({
      ...prev,
      currentIndex: nextIndex
    }))
    
    setCurrentWord(nextWord)
    setOptions(generateOptions(nextWord.meaning, session.words))
    
    // 3. Đặt lại trạng thái UI
    setSelectedOption(null)
    setShowResult(false)
    setIsCorrect(null)
    setShowDetails(false)
    setIsTimerActive(true)
    setTimeLeft(15)
  }
  
  const handleAnswerClick = (meaning: string) => {
    if (showResult || !currentWord) return
    
    setIsTimerActive(false) // Dừng timer ngay khi trả lời
    setSelectedOption(meaning)
    setShowResult(true)
    
    const correct = meaning === currentWord.meaning
    setIsCorrect(correct)
    
    setSession(prev => {
      let newPoints = prev.sessionPoints
      
      // Cập nhật điểm và thống kê
      if (correct) {
        // Tăng điểm, ví dụ: +10 điểm và thêm điểm thưởng thời gian
        newPoints += 10 + (timeLeft * 2) 
      }
      
      return {
        ...prev,
        correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
        totalAttempts: prev.totalAttempts + 1,
        sessionPoints: newPoints
      }
    })
    
    // Nếu trả lời sai, hiển thị chi tiết từ đó
    if (!correct) {
      setShowDetails(true)
    }
  }

  // ----------------------------------------------------
  // EFFECTS
  // ----------------------------------------------------
  
  // Khởi tạo phiên học đầu tiên
  useEffect(() => {
    // Tải dữ liệu từ vựng từ mock data khi component mount
    startSession(mockWords)
  }, [])
  
  // Timer effect
  useEffect(() => {
    if (!isTimerActive || timeLeft <= 0) {
      if (timeLeft === 0 && !showResult) {
        // Hết giờ, coi như trả lời sai
        handleAnswerClick('Hết giờ - câu trả lời sai') 
        setShowDetails(true) // Hiển thị chi tiết
      }
      return
    }

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1)
    }, 1000)

    return () => clearInterval(timerId)
  }, [isTimerActive, timeLeft, showResult])
  
  // Xử lý khi user không có
  if (!user) {
    // Trả về màn hình loading hoặc màn hình chờ AuthModal (sẽ được handle ở Shell.tsx)
    // Tạm thời hiển thị loading để tránh lỗi
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Đang chờ xác thực...</span>
      </div>
    )
  }

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------
  
  if (session.words.length === 0) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto text-center">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Chưa có từ vựng</CardTitle>
          </CardHeader>
          <CardContent>
            Vui lòng thêm từ vựng vào kho từ của bạn để bắt đầu học.
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (!currentWord) {
    return null // Hoặc loading
  }

  // ✅ LOGIC HIỂN THỊ CÓ ĐIỀU KIỆN
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      
      {isSessionComplete ? (
        // 1. HIỂN THỊ TÓM TẮT PHIÊN HỌC
        <SessionSummary 
          session={session} 
          onRestart={() => startSession(mockWords)} 
        />
      ) : (
        // 2. HIỂN THỊ UI CÂU HỎI BÌNH THƯỜNG
        <>
          {/* Progress Bar */}
          <div className="flex items-center space-x-4 mb-6">
            <Progress 
              value={(session.currentIndex / session.words.length) * 100} 
              className="flex-1 h-3" 
            />
            <Badge variant="secondary" className="font-semibold px-3 py-1">
              Câu {session.currentIndex + 1} / {session.words.length}
            </Badge>
          </div>
          
          {/* Question Card */}
          <Card className={`shadow-xl transition-all duration-300 ${isCorrect === true ? 'border-green-400' : isCorrect === false ? 'border-red-400' : 'border-gray-200'} bg-white dark:bg-gray-800`}>
            <CardHeader className="flex flex-row justify-between items-start pb-4">
              <CardTitle className="text-4xl md:text-5xl font-extrabold text-primary">
                {currentWord.kanji}
              </CardTitle>
              <div className="flex items-center space-x-2 text-xl font-bold">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className={timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-primary'}>{timeLeft}s</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-2xl font-medium text-gray-600 dark:text-gray-300">
                {currentWord.kana}
              </p>
              
              {showDetails && (
                <div className="border-t pt-4 mt-4 dark:border-gray-700">
                  <p className="text-base text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-primary">Nghĩa chính:</span> {currentWord.meaning}
                  </p>
                  {currentWord.notes && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-semibold">Ghi chú:</span> {currentWord.notes}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            {options.map((option, index) => {
              const isCorrectOption = option === currentWord.meaning
              const isSelected = option === selectedOption
              
              let variant: 'default' | 'outline' | 'secondary' | 'ghost' = 'outline'
              let className = ''
              
              if (showResult) {
                if (isCorrectOption) {
                  className = 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/50 dark:border-green-400 dark:text-green-300'
                } else if (isSelected && !isCorrectOption) {
                  className = 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/50 dark:border-red-400 dark:text-red-300'
                } else {
                  className = 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }
              }

              return (
                <Button 
                  key={index}
                  variant={variant}
                  className={`h-auto p-4 justify-start text-left text-base ${className}`}
                  onClick={() => handleAnswerClick(option)}
                  disabled={showResult}
                >
                  <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                  <span className="flex-1">{option}</span>
                  {showResult && (isCorrectOption ? <CheckCircle className="h-5 w-5 ml-2" /> : isSelected && <XCircle className="h-5 w-5 ml-2" />)}
                </Button>
              )
            })}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 mt-6">
            {showResult && (
              <Button 
                className="w-full"
                onClick={nextQuestion} // Logic này sẽ gọi endSession nếu là từ cuối cùng
              >
                {session.currentIndex < session.words.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
              </Button>
            )}
            
            {!showResult && (
              <Button 
                variant="outline" 
                className="w-full bg-transparent"
                onClick={() => {
                  // Giả định là trả lời sai và chuyển sang câu tiếp theo
                  handleAnswerClick('Chưa biết - câu trả lời sai') // Coi như trả lời sai
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
        </>
      )}
    </div>
  )
}