
/**
 * Vocabulary Manager Component
 * Handles adding, editing, and deleting vocabulary words and sets
 */

import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  X,
  BookOpen,
  Hash
} from 'lucide-react'

interface VocabularyWord {
  id: string
  kanji: string
  kana: string
  meaning: string
  notes?: string
  difficulty: number
}

interface VocabularySet {
  id: string
  name: string
  description?: string
  words: VocabularyWord[]
  createdAt: Date
}

export default function VocabularyManager() {
  const [sets, setSets] = useState<VocabularySet[]>([
    {
      id: '1',
      name: 'N5 Từ cơ bản',
      description: 'Các từ vựng cơ bản cho trình độ N5',
      words: [
        { id: '1-1', kanji: '学生', kana: 'がくせい', meaning: 'Học sinh', difficulty: 30 },
        { id: '1-2', kanji: '先生', kana: 'せんせい', meaning: 'Giáo viên', difficulty: 25 },
        { id: '1-3', kanji: '学校', kana: 'がっこう', meaning: 'Trường học', difficulty: 40 }
      ],
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Động từ thông dụng',
      description: 'Các động verbs thường gặp',
      words: [
        { id: '2-1', kanji: '食べる', kana: 'たべる', meaning: 'Ăn', difficulty: 50 },
        { id: '2-2', kanji: '飲む', kana: 'のむ', meaning: 'Uống', difficulty: 45 },
        { id: '2-3', kanji: '見る', kana: 'みる', meaning: 'Nhìn', difficulty: 60 }
      ],
      createdAt: new Date('2024-01-20')
    }
  ])

  const [newSet, setNewSet] = useState({ name: '', description: '' })
  const [newWord, setNewWord] = useState({ kanji: '', kana: '', meaning: '', notes: '' })
  const [editingSet, setEditingSet] = useState<VocabularySet | null>(null)
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null)
  const [selectedSet, setSelectedSet] = useState<VocabularySet | null>(null)

  const handleAddSet = () => {
    if (!newSet.name.trim()) return

    const set: VocabularySet = {
      id: Date.now().toString(),
      name: newSet.name,
      description: newSet.description,
      words: [],
      createdAt: new Date()
    }

    setSets(prev => [...prev, set])
    setNewSet({ name: '', description: '' })
  }

  const handleAddWord = (setId: string) => {
    if (!newWord.kanji.trim() || !newWord.kana.trim() || !newWord.meaning.trim()) return

    const word: VocabularyWord = {
      id: `${setId}-${Date.now()}`,
      kanji: newWord.kanji,
      kana: newWord.kana,
      meaning: newWord.meaning,
      notes: newWord.notes,
      difficulty: 50 // Default difficulty
    }

    setSets(prev => prev.map(set => 
      set.id === setId 
        ? { ...set, words: [...set.words, word] }
        : set
    ))

    setNewWord({ kanji: '', kana: '', meaning: '', notes: '' })
  }

  const handleDeleteSet = (setId: string) => {
    setSets(prev => prev.filter(set => set.id !== setId))
    if (selectedSet?.id === setId) {
      setSelectedSet(null)
    }
  }

  const handleDeleteWord = (setId: string, wordId: string) => {
    setSets(prev => prev.map(set => 
      set.id === setId 
        ? { ...set, words: set.words.filter(word => word.id !== wordId) }
        : set
    ))
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 70) return 'bg-green-500'
    if (difficulty >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Quản lý từ vựng
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Tổ chức và quản lý các bộ từ vựng của bạn
          </p>
        </div>

        <Tabs defaultValue="sets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="sets">Bộ từ</TabsTrigger>
            <TabsTrigger value="words">Quản lý từ</TabsTrigger>
          </TabsList>

          <TabsContent value="sets" className="space-y-4">
            {/* Add new set */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Tạo bộ từ mới</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="setName">Tên bộ từ</Label>
                  <Input
                    id="setName"
                    value={newSet.name}
                    onChange={(e) => setNewSet(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="VD: N5 Từ cơ bản"
                  />
                </div>
                <div>
                  <Label htmlFor="setDescription">Mô tả (tùy chọn)</Label>
                  <Textarea
                    id="setDescription"
                    value={newSet.description}
                    onChange={(e) => setNewSet(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả về bộ từ này"
                  />
                </div>
                <Button 
                  onClick={handleAddSet} 
                  className="w-full"
                >
                  Tạo bộ từ
                </Button>
              </CardContent>
            </Card>

            {/* List of sets */}
            <div className="grid gap-4 md:grid-cols-2">
              {sets.map((set) => (
                <Card key={set.id} className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5 text-blue-500" />
                          <span>{set.name}</span>
                        </CardTitle>
                        {set.description && (
                          <CardDescription className="mt-1">
                            {set.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedSet(set)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSet(set.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">
                        <Hash className="h-3 w-3 mr-1" />
                        {set.words.length} từ
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSet(set)}
                        className="bg-transparent"
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="words" className="space-y-4">
            {selectedSet ? (
              <div className="space-y-4">
                {/* Set header */}
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{selectedSet.name}</CardTitle>
                        <CardDescription>{selectedSet.description}</CardDescription>
                      </div>
                      <Button variant="outline" onClick={() => setSelectedSet(null)}>
                        <X className="h-4 w-4 mr-2" />
                        Quay lại
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                {/* Add new word */}
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span>Thêm từ mới</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="kanji">Kanji</Label>
                        <Input
                          id="kanji"
                          value={newWord.kanji}
                          onChange={(e) => setNewWord(prev => ({ ...prev, kanji: e.target.value }))}
                          placeholder="VD: 学生"
                        />
                      </div>
                      <div>
                        <Label htmlFor="kana">Kana</Label>
                        <Input
                          id="kana"
                          value={newWord.kana}
                          onChange={(e) => setNewWord(prev => ({ ...prev, kana: e.target.value }))}
                          placeholder="VD: がくせい"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="meaning">Nghĩa</Label>
                      <Input
                        id="meaning"
                        value={newWord.meaning}
                        onChange={(e) => setNewWord(prev => ({ ...prev, meaning: e.target.value }))}
                        placeholder="VD: Học sinh"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                      <Textarea
                        id="notes"
                        value={newWord.notes}
                        onChange={(e) => setNewWord(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Ghi chú thêm về từ này..."
                      />
                    </div>
                    <Button 
                      onClick={() => handleAddWord(selectedSet.id)} 
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Thêm từ
                    </Button>
                  </CardContent>
                </Card>

                {/* Words list */}
                <div className="space-y-3">
                  {selectedSet.words.map((word) => (
                    <Card key={word.id} className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-xl font-bold">{word.kanji}</span>
                              <span className="text-gray-600 dark:text-gray-300">{word.kana}</span>
                              <Badge variant="outline" className="bg-transparent">
                                <div className={`w-2 h-2 rounded-full mr-1 ${getDifficultyColor(word.difficulty)}`} />
                                {word.difficulty}
                              </Badge>
                            </div>
                            <p className="text-lg text-blue-600 dark:text-blue-400 mb-1">
                              {word.meaning}
                            </p>
                            {word.notes && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {word.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingWord(word)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteWord(selectedSet.id, word.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg text-center p-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Chọn một bộ từ</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Vui lòng chọn một bộ từ để quản lý các từ vựng
                </p>
                <Button variant="outline" onClick={() => document.querySelector('[value="sets"]')?.click()}>
                  Xem danh sách bộ từ
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
