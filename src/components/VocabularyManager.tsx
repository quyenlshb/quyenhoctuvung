/**
 * Vocabulary Manager Component
 * Handles adding, editing, and deleting vocabulary words and sets
 * Integrated with Firebase Firestore
 */

import { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogDescription // ✅ SỬA: Đã thêm DialogDescription để khắc phục ReferenceError
} from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { useToast } from '../hooks/use-toast' 
import { 
  Plus, 
  Edit2, 
  Trash2, 
  BookOpen,
  Hash,
  Loader2,
  List,
  MessageSquare,
  Import
} from 'lucide-react'

import { useAuth } from './AuthProvider' 

// ⚡️ IMPORT HÀM FIREBASE THỰC TẾ
import { 
  getVocabularySets, 
  addVocabularySet, 
  updateVocabularySet, 
  deleteVocabularySet, 
  getVocabularyWords,
  addVocabularyWord, 
  updateVocabularyWord,
  deleteVocabularyWord
} from '../lib/firebase' 
import type { VocabularySet, VocabularyWord } from '../lib/firebase' // Import interfaces

// ----------------------------------------------------
// INTERFACES (Được giữ nguyên)

export default function VocabularyManager() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [vocabularySets, setVocabularySets] = useState<VocabularySet[]>([])
  const [selectedSet, setSelectedSet] = useState<VocabularySet | null>(null)
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [isCreateSetOpen, setIsCreateSetOpen] = useState(false)
  
  // State cho form tạo bộ từ
  const [newSetName, setNewSetName] = useState('')
  const [newSetDescription, setNewSetDescription] = useState('')

  // State cho form thêm từ
  const [newWordKanji, setNewWordKanji] = useState('')
  const [newWordKana, setNewWordKana] = useState('')
  const [newWordMeaning, setNewWordMeaning] = useState('')
  const [newWordNotes, setNewWordNotes] = useState('')
  
  // State cho form chỉnh sửa từ (dùng chung)
  const [isEditWordOpen, setIsEditWordOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null)
  const [editKanji, setEditKanji] = useState('')
  const [editKana, setEditKana] = useState('')
  const [editMeaning, setEditMeaning] = useState('')
  const [editNotes, setEditNotes] = useState('')

  // State cho Bulk Import
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [bulkData, setBulkData] = useState('')
  const [bulkImportProgress, setBulkImportProgress] = useState<string | null>(null)


  // ----------------------------------------------------
  // I. LOGIC TẢI DỮ LIỆU
  // ----------------------------------------------------

  // 1. Tải danh sách bộ từ
  const fetchSets = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const sets = await getVocabularySets(user.id)
      setVocabularySets(sets)
      // Nếu không có bộ từ nào được chọn trước, chọn bộ từ đầu tiên (nếu có)
      if (!selectedSet && sets.length > 0) {
        setSelectedSet(sets[0])
      }
    } catch (error) {
      console.error('Error fetching vocabulary sets:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách bộ từ.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedSet, toast])

  // 2. Tải các từ trong bộ từ đã chọn
  const fetchWords = useCallback(async (setId: string) => {
    setIsLoading(true)
    try {
      const words = await getVocabularyWords(user!.id, setId)
      setVocabularyWords(words)
    } catch (error) {
      console.error('Error fetching vocabulary words:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải từ vựng.',
        variant: 'destructive',
      })
      setVocabularyWords([]) // Xóa danh sách nếu lỗi
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  // useEffect để tải danh sách bộ từ ban đầu
  useEffect(() => {
    fetchSets()
  }, [fetchSets]) 

  // useEffect để tải từ vựng khi bộ từ được chọn thay đổi
  useEffect(() => {
    if (selectedSet) {
      fetchWords(selectedSet.id)
    } else {
      setVocabularyWords([])
    }
  }, [selectedSet, fetchWords])


  // ----------------------------------------------------
  // II. LOGIC QUẢN LÝ BỘ TỪ (VOCABULARY SETS)
  // ----------------------------------------------------

  // ✅ SỬA: Cập nhật hàm này để giải quyết lỗi tạo bộ từ không hiển thị
  const handleCreateSet = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSetName.trim() || !user) return

    setIsLoading(true)
    try {
      // 1. GỌI HÀM TẠO TỪ FIREBASE VÀ LẤY VỀ ĐỐI TƯỢNG BỘ TỪ MỚI
      const newSet = await addVocabularySet(
        user.id,
        newSetName.trim(),
        newSetDescription.trim()
      )

      // ⚡️ BƯỚC SỬA 1: CẬP NHẬT STATE VỚI BỘ TỪ MỚI
      setVocabularySets((prevSets) => [...prevSets, newSet])
      
      // ⚡️ BƯỚC SỬA 2: CHỌN BỘ TỪ MỚI NGAY LẬP TỨC
      setSelectedSet(newSet) 
      
      // Reset form và đóng dialog
      setNewSetName('')
      setNewSetDescription('')
      setIsCreateSetOpen(false) 
      
      toast({
        title: 'Thành công!',
        description: `Đã tạo bộ từ "${newSet.name}". Bộ từ đã được chọn.`,
      })
      
    } catch (error) {
      console.error('Error creating vocabulary set:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo bộ từ. Vui lòng thử lại.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, newSetName, newSetDescription, toast])


  const handleDeleteSet = useCallback(async (setId: string, setName: string) => {
    if (!user || !confirm(`Bạn có chắc chắn muốn xóa bộ từ "${setName}" và tất cả từ vựng của nó?`)) return

    setIsLoading(true)
    try {
      await deleteVocabularySet(user.id, setId)
      
      // Cập nhật state cục bộ
      setVocabularySets(prevSets => prevSets.filter(set => set.id !== setId))
      
      // Nếu bộ từ đang chọn bị xóa, hủy chọn
      if (selectedSet && selectedSet.id === setId) {
        setSelectedSet(null)
        setVocabularyWords([])
      }
      
      toast({
        title: 'Thành công!',
        description: `Đã xóa bộ từ "${setName}".`,
      })

    } catch (error) {
      console.error('Error deleting vocabulary set:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa bộ từ. Vui lòng thử lại.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedSet, toast])

  // Logic cập nhật bộ từ (giữ nguyên)
  const handleUpdateSet = useCallback(async (setId: string, newName: string, newDescription: string) => {
    if (!user) return
    
    setIsLoading(true)
    try {
      await updateVocabularySet(user.id, setId, { name: newName, description: newDescription })

      // Cập nhật state cục bộ
      setVocabularySets(prevSets => prevSets.map(set => 
        set.id === setId ? { ...set, name: newName, description: newDescription } : set
      ))
      
      // Cập nhật selectedSet
      if (selectedSet && selectedSet.id === setId) {
        setSelectedSet(prevSet => prevSet ? { ...prevSet, name: newName, description: newDescription } : null)
      }

      toast({
        title: 'Thành công!',
        description: 'Đã cập nhật bộ từ.',
      })

    } catch (error) {
      console.error('Error updating vocabulary set:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật bộ từ.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedSet, toast])

  // ----------------------------------------------------
  // III. LOGIC QUẢN LÝ TỪ VỰNG (VOCABULARY WORDS)
  // ----------------------------------------------------

  const handleAddWord = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSet || !user || !newWordKanji.trim() || !newWordMeaning.trim()) return

    setIsLoading(true)
    try {
      const newWord: Omit<VocabularyWord, 'id' | 'difficulty'> = {
        kanji: newWordKanji.trim(),
        kana: newWordKana.trim(),
        meaning: newWordMeaning.trim(),
        notes: newWordNotes.trim(),
      }
      
      // Thêm từ vào Firestore và nhận lại đối tượng từ đã có ID
      const wordWithId = await addVocabularyWord(user.id, selectedSet.id, newWord)
      
      // Cập nhật state cục bộ
      setVocabularyWords(prevWords => [wordWithId, ...prevWords])
      
      // Cập nhật số lượng từ trong bộ từ đang chọn (Nếu totalWords chưa được update tự động)
      if (selectedSet) {
        setSelectedSet(prevSet => prevSet ? { ...prevSet, totalWords: (prevSet.totalWords || 0) + 1 } : null)
        setVocabularySets(prevSets => prevSets.map(set => 
          set.id === selectedSet.id ? { ...set, totalWords: (set.totalWords || 0) + 1 } : set
        ))
      }

      // Reset form
      setNewWordKanji('')
      setNewWordKana('')
      setNewWordMeaning('')
      setNewWordNotes('')

      toast({
        title: 'Thành công!',
        description: `Đã thêm từ: ${wordWithId.kanji}`,
      })
      
    } catch (error) {
      console.error('Error adding vocabulary word:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm từ vựng.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedSet, newWordKanji, newWordKana, newWordMeaning, newWordNotes, toast])

  // Logic chỉnh sửa từ (giữ nguyên)
  const handleUpdateWord = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSet || !user || !editingWord) return

    setIsLoading(true)
    try {
      const updatedData = {
        kanji: editKanji.trim(),
        kana: editKana.trim(),
        meaning: editMeaning.trim(),
        notes: editNotes.trim(),
      }
      
      await updateVocabularyWord(user.id, selectedSet.id, editingWord.id, updatedData)

      // Cập nhật state cục bộ
      setVocabularyWords(prevWords => prevWords.map(word => 
        word.id === editingWord.id ? { ...word, ...updatedData } as VocabularyWord : word
      ))
      
      // Đóng dialog
      setIsEditWordOpen(false)
      setEditingWord(null)

      toast({
        title: 'Thành công!',
        description: `Đã cập nhật từ: ${editKanji}`,
      })

    } catch (error) {
      console.error('Error updating vocabulary word:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật từ vựng.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedSet, editingWord, editKanji, editKana, editMeaning, editNotes, toast])

  const handleDeleteWord = useCallback(async (setId: string, wordId: string) => {
    if (!user || !confirm('Bạn có chắc chắn muốn xóa từ vựng này?')) return

    setIsLoading(true)
    try {
      await deleteVocabularyWord(user.id, setId, wordId)
      
      // Cập nhật state cục bộ
      setVocabularyWords(prevWords => prevWords.filter(word => word.id !== wordId))
      
      // Cập nhật số lượng từ trong bộ từ đang chọn (Nếu totalWords chưa được update tự động)
      if (selectedSet && selectedSet.id === setId) {
        setSelectedSet(prevSet => prevSet ? { ...prevSet, totalWords: Math.max(0, (prevSet.totalWords || 0) - 1) } : null)
        setVocabularySets(prevSets => prevSets.map(set => 
            set.id === setId ? { ...set, totalWords: Math.max(0, (set.totalWords || 0) - 1) } : set
        ))
      }

      toast({
        title: 'Thành công!',
        description: 'Đã xóa từ vựng.',
      })

    } catch (error) {
      console.error('Error deleting vocabulary word:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa từ vựng. Vui lòng thử lại.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedSet, toast])

  // ----------------------------------------------------
  // IV. LOGIC BULK IMPORT (Giữ nguyên)
  // ----------------------------------------------------

  const handleBulkImport = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSet || !user || !bulkData.trim()) return

    const lines = bulkData.trim().split('\n').filter(line => line.trim() !== '')
    const newWords: Omit<VocabularyWord, 'id' | 'difficulty'>[] = []
    
    // Format: Kanji,Kana,Meaning,Notes (Notes là tùy chọn, chỉ lấy 3 trường chính)
    for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
            newWords.push({
                kanji: parts[0],
                kana: parts[1] || '',
                meaning: parts[2],
                notes: parts[3] || '',
            });
        }
    }

    if (newWords.length === 0) {
        toast({
            title: 'Lỗi định dạng',
            description: 'Không tìm thấy từ vựng hợp lệ. Vui lòng sử dụng định dạng: Kanji,Kana,Meaning',
            variant: 'destructive',
        });
        return;
    }

    setBulkImportProgress(`Đang nhập ${newWords.length} từ...`)

    try {
        // Sử dụng batch write để thêm nhiều từ một lúc (giả định hàm đã có trong firebase.ts)
        // LƯU Ý: addVocabularyWord.bulk là giả định, bạn cần đảm bảo hàm này có trong '../lib/firebase'
        const addedWords = await (addVocabularyWord as any).bulk(user.id, selectedSet.id, newWords)
        
        // Cập nhật state cục bộ
        setVocabularyWords(prevWords => [...addedWords, ...prevWords])
        
        // Cập nhật số lượng từ trong bộ từ đang chọn
        if (selectedSet) {
            setSelectedSet(prevSet => prevSet ? { ...prevSet, totalWords: (prevSet.totalWords || 0) + addedWords.length } : null)
            setVocabularySets(prevSets => prevSets.map(set => 
                set.id === selectedSet.id ? { ...set, totalWords: (set.totalWords || 0) + addedWords.length } : set
            ))
        }

        toast({
            title: 'Thành công!',
            description: `Đã nhập thành công ${addedWords.length} từ vào bộ từ "${selectedSet.name}".`,
        })

        // Reset form và đóng dialog
        setBulkData('')
        setIsBulkImportOpen(false)

    } catch (error) {
        console.error('Error during bulk import:', error)
        toast({
            title: 'Lỗi',
            description: 'Không thể nhập từ vựng số lượng lớn. Vui lòng thử lại.',
            variant: 'destructive',
        })
    } finally {
        setBulkImportProgress(null)
    }

  }, [user, selectedSet, bulkData, toast])

  // ----------------------------------------------------
  // V. RENDER
  // ----------------------------------------------------
  
  const totalWords = vocabularyWords.length

  // Hàm helper để mở dialog chỉnh sửa
  const openEditDialog = (word: VocabularyWord) => {
    setEditingWord(word)
    setEditKanji(word.kanji)
    setEditKana(word.kana)
    setEditMeaning(word.meaning)
    setEditNotes(word.notes || '')
    setIsEditWordOpen(true)
  }


  if (!user) {
    return (
      <Card className="text-center shadow-lg w-full max-w-sm mx-auto">
        <CardHeader>
            <CardTitle>Yêu cầu Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-gray-500 mb-4">Bạn cần đăng nhập để quản lý từ vựng.</p>
        </CardContent>
    </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Từ vựng</h1>
      <p className="text-gray-600 dark:text-gray-400">Tạo, chỉnh sửa và sắp xếp các bộ từ vựng cá nhân của bạn.</p>

      {/* DIALOG TẠO BỘ TỪ MỚI */}
      <Dialog open={isCreateSetOpen} onOpenChange={setIsCreateSetOpen}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto" onClick={() => { 
            setNewSetName(''); 
            setNewSetDescription(''); 
            setIsCreateSetOpen(true); 
          }}>
            <Plus className="h-4 w-4 mr-2" /> Tạo Bộ Từ Mới
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tạo Bộ Từ Vựng Mới</DialogTitle>
            <DialogDescription>
                Đặt tên và mô tả cho bộ từ mới của bạn.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSet} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="setName">Tên bộ từ <span className="text-red-500">*</span></Label>
              <Input
                id="setName"
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                placeholder="Ví dụ: N3 Từ vựng, Từ chuyên ngành IT"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="setDescription">Mô tả (Tùy chọn)</Label>
              <Textarea
                id="setDescription"
                value={newSetDescription}
                onChange={(e) => setNewSetDescription(e.target.value)}
                placeholder="Mô tả ngắn gọn về bộ từ này"
              />
            </div>
            <Button type="submit" disabled={isLoading || !newSetName.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Tạo Bộ Từ'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
        {/* Cột 1: Danh sách Bộ Từ */}
        <div className="md:col-span-1 flex flex-col space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 text-gray-800 dark:text-white">Danh sách Bộ Từ ({vocabularySets.length})</h2>
          
          <div className="space-y-2 overflow-y-auto pr-2">
            {isLoading && vocabularySets.length === 0 ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : vocabularySets.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center p-4">
                Chưa có bộ từ nào.
              </p>
            ) : (
              vocabularySets.map((set) => (
                <Card
                  key={set.id}
                  className={`cursor-pointer transition-all ${
                    selectedSet && selectedSet.id === set.id
                      ? 'border-primary shadow-lg bg-primary/10 dark:bg-primary/20'
                      : 'hover:border-primary/50 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                  onClick={() => setSelectedSet(set)}
                >
                  <CardContent className="p-4 flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-medium">
                        {set.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {set.description || 'Không có mô tả'}
                      </CardDescription>
                      <Badge variant="secondary" className="mt-2">
                          <Hash className="h-3 w-3 mr-1" /> {set.totalWords || 0} từ
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteSet(set.id, set.name)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Cột 2 & 3: Chi tiết và Quản lý Từ vựng */}
        <div className="md:col-span-2">
            {selectedSet ? (
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className='flex items-center space-x-3'>
                    <BookOpen className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl font-bold">{selectedSet.name}</CardTitle>
                  </div>
                  {/* Dialog chỉnh sửa bộ từ */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit2 className="h-4 w-4 mr-2" /> Chỉnh sửa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Chỉnh sửa Bộ Từ Vựng</DialogTitle>
                        <DialogDescription>
                            Thay đổi tên và mô tả của bộ từ này.
                        </DialogDescription>
                      </DialogHeader>
                      <EditSetForm 
                        set={selectedSet} 
                        onSave={handleUpdateSet}
                        isLoading={isLoading}
                      />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardDescription className="px-6 pb-4">
                  {selectedSet.description || 'Không có mô tả'}
                </CardDescription>

                {/* Tabs: Thêm Từ / Nhập Số Lượng Lớn / Danh sách Từ */}
                <CardContent className="p-6 pt-0">
                  <Tabs defaultValue="addWord" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="addWord">
                        <Plus className="h-4 w-4 mr-1" /> Thêm Từ
                      </TabsTrigger>
                      <TabsTrigger value="wordList">
                        <List className="h-4 w-4 mr-1" /> Danh sách ({totalWords})
                      </TabsTrigger>
                      <TabsTrigger value="bulkImport" onClick={() => {setBulkData(''); setBulkImportProgress(null);}}>
                        <Import className="h-4 w-4 mr-1" /> Nhập SL
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Tab 1: Thêm Từ */}
                    <TabsContent value="addWord" className="mt-4">
                      <form onSubmit={handleAddWord} className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="kanji">Kanji/Từ <span className="text-red-500">*</span></Label>
                          <Input id="kanji" value={newWordKanji} onChange={(e) => setNewWordKanji(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kana">Kana/Phiên âm</Label>
                          <Input id="kana" value={newWordKana} onChange={(e) => setNewWordKana(e.target.value)} />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="meaning">Nghĩa <span className="text-red-500">*</span></Label>
                          <Input id="meaning" value={newWordMeaning} onChange={(e) => setNewWordMeaning(e.target.value)} required />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="notes">Ghi chú (Tùy chọn)</Label>
                          <Textarea id="notes" value={newWordNotes} onChange={(e) => setNewWordNotes(e.target.value)} />
                        </div>
                        <Button type="submit" className="col-span-2" disabled={isLoading || !newWordKanji.trim() || !newWordMeaning.trim()}>
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Thêm Từ Vựng'}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    {/* Tab 2: Danh sách Từ */}
                    <TabsContent value="wordList" className="mt-4">
                      <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">
                        {isLoading && totalWords === 0 ? (
                            <div className="flex justify-center items-center h-24">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : totalWords === 0 ? (
                          <p className="text-gray-500 dark:text-gray-400 text-center p-4">
                            Bộ từ này chưa có từ vựng nào.
                          </p>
                        ) : (
                          vocabularyWords.map((word) => (
                            <Card key={word.id} className="bg-gray-50 dark:bg-gray-900 shadow-sm">
                              <CardContent className="p-3 flex justify-between items-center">
                                <div className="flex-1 min-w-0 pr-4">
                                  <p className="font-semibold text-lg truncate text-gray-900 dark:text-white">{word.kanji}</p>
                                  <p className="text-sm text-primary dark:text-primary-light truncate">{word.kana}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">{word.meaning}</p>
                                  {word.notes && (
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      <span className="truncate">{word.notes}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => openEditDialog(word)}
                                    title="Chỉnh sửa từ"
                                  >
                                    <Edit2 className="h-4 w-4 text-primary" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleDeleteWord(selectedSet.id, word.id)}
                                    title="Xóa từ"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    {/* Tab 3: Nhập Số Lượng Lớn */}
                    <TabsContent value="bulkImport" className="mt-4">
                      <form onSubmit={handleBulkImport} className="grid gap-4">
                        <Label htmlFor="bulkData" className="text-sm font-medium">
                          Nhập từ vựng (mỗi từ một dòng, phân tách bằng dấu phẩy)
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                          Định dạng: **Kanji/Từ, Kana/Phiên âm, Nghĩa, Ghi chú (tùy chọn)**
                        </p>
                        <Textarea
                          id="bulkData"
                          rows={8}
                          value={bulkData}
                          onChange={(e) => setBulkData(e.target.value)}
                          placeholder="Ví dụ:&#10;食べる, たべる, Ăn&#10;日本語, にほんご, Tiếng Nhật, Ghi chú quan trọng"
                          required
                        />
                        {bulkImportProgress && (
                            <div className="flex items-center text-sm text-blue-500">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" /> {bulkImportProgress}
                            </div>
                        )}
                        <Button type="submit" disabled={isLoading || bulkImportProgress !== null || !bulkData.trim()}>
                          <Import className="h-4 w-4 mr-2" /> Nhập {bulkData.trim().split('\n').filter(line => line.trim() !== '').length} Từ
                        </Button>
                      </form>
                    </TabsContent>

                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg text-center p-8 h-full flex flex-col justify-center items-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Chọn một bộ từ</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Vui lòng chọn một bộ từ từ danh sách bên trái hoặc tạo bộ từ mới.
                </p>
                <Button variant="outline" onClick={fetchSets} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Tải lại danh sách bộ từ'}
                </Button>
              </Card>
            )}
          </div>
        </div>
      {/* THẺ <p> ĐƯỢC DI CHUYỂN VÀO TRONG THẺ DIV GỐC */}
      <p className="mt-8 text-sm text-center text-gray-500 dark:text-gray-500">
          * Độ khó (Difficulty) sẽ được cập nhật tự động sau mỗi buổi học.
      </p>

      {/* DIALOG CHỈNH SỬA TỪ */}
      <Dialog open={isEditWordOpen} onOpenChange={setIsEditWordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Từ Vựng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho từ "{editingWord?.kanji}".
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateWord} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editKanji">Kanji/Từ <span className="text-red-500">*</span></Label>
              <Input
                id="editKanji"
                value={editKanji}
                onChange={(e) => setEditKanji(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editKana">Kana/Phiên âm</Label>
              <Input
                id="editKana"
                value={editKana}
                onChange={(e) => setEditKana(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editMeaning">Nghĩa <span className="text-red-500">*</span></Label>
              <Input
                id="editMeaning"
                value={editMeaning}
                onChange={(e) => setEditMeaning(e.target.value)}
                required
              />
            </div>
            {/* ⚡️ PHẦN BỊ THIẾU ĐÃ ĐƯỢC BỔ SUNG Ở ĐÂY */}
            <div className="grid gap-2">
              <Label htmlFor="editNotes">Ghi chú (Tùy chọn)</Label>
              <Textarea
                id="editNotes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading || !editKanji.trim() || !editMeaning.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Lưu Thay Đổi'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}


// Component con cho việc chỉnh sửa bộ từ (giữ nguyên logic)
interface EditSetFormProps {
  set: VocabularySet;
  onSave: (id: string, newName: string, newDescription: string) => Promise<void>;
  isLoading: boolean;
}

const EditSetForm: React.FC<EditSetFormProps> = ({ set, onSave, isLoading }) => {
  const [name, setName] = useState(set.name);
  const [description, setDescription] = useState(set.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(set.id, name, description);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="editSetName">Tên bộ từ <span className="text-red-500">*</span></Label>
        <Input
          id="editSetName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="editSetDescription">Mô tả</Label>
        <Textarea
          id="editSetDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn gọn về bộ từ này"
        />
      </div>
      <Button type="submit" disabled={isLoading || !name.trim()}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Lưu Bộ Từ'}
      </Button>
    </form>
  );
};