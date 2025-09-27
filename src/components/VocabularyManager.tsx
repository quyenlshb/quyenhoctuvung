/**
 * Vocabulary Manager Component
 * Handles adding, editing, and deleting vocabulary words and sets
 * Integrated with Firebase Firestore
 * UPDATED: Bulk Import logic modified to only accept 3 fields (Kanji, Kana, Meaning)
 */

import { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { useToast } from '../hooks/use-toast' // Giả định useToast từ shadcn
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
  deleteVocabularyWord,
  addMultipleVocabularyWords 
} from '../lib/firebase' 

// ----------------------------------------------------
// INTERFACES
// ----------------------------------------------------

interface VocabularySet {
  id: string
  name: string
  wordCount: number
  userId: string
}

interface VocabularyWord {
  id: string
  kanji: string
  kana: string
  meaning: string
  notes?: string
  difficulty: number // Score from 0-100
}

interface NewWordState {
  kanji: string
  kana: string
  meaning: string
  notes: string
}

// ----------------------------------------------------
// CONSTANTS
// ----------------------------------------------------
const INITIAL_NEW_WORD_STATE: NewWordState = {
  kanji: '',
  kana: '',
  meaning: '',
  notes: '',
}

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------

export default function VocabularyManager() {
  const { toast } = useToast()
  
  // ✅ LẤY THÔNG TIN USER TỪ AUTH CONTEXT
  const { user } = useAuth(); 
  const userId = user?.id; // Lấy ID người dùng

  const [sets, setSets] = useState<VocabularySet[]>([])
  const [selectedSet, setSelectedSet] = useState<VocabularySet | null>(null)
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [newSetName, setNewSetName] = useState('')
  const [newWord, setNewWord] = useState<NewWordState>(INITIAL_NEW_WORD_STATE)
  const [isLoading, setIsLoading] = useState(false)
  const [isAddSetDialogOpen, setIsAddSetDialogOpen] = useState(false)
  const [isAddWordDialogOpen, setIsAddWordDialogOpen] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [bulkImportText, setBulkImportText] = useState('')


  // --- LOGIC FETCH DỮ LIỆU ---

  const fetchSets = useCallback(async () => {
    if (!userId) {
      setSets([]);
      // Không cần toast nếu người dùng chưa đăng nhập, vì Shell.tsx đã xử lý
      return; 
    }
    
    setIsLoading(true)
    try {
      const fetchedSets = await getVocabularySets(userId)
      setSets(fetchedSets)
      // Tự động chọn bộ từ đầu tiên nếu có và chưa có bộ nào được chọn
      if (fetchedSets.length > 0 && !selectedSet) {
        setSelectedSet(fetchedSets[0])
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bộ từ.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [userId, selectedSet, toast])

  const fetchWords = useCallback(async (setId: string) => {
    if (!userId) return;
    setIsLoading(true)
    try {
      const fetchedWords = await getVocabularyWords(setId, userId)
      setWords(fetchedWords)
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Không thể tải từ vựng.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [userId, toast])

  useEffect(() => {
    fetchSets()
  }, [fetchSets])

  useEffect(() => {
    if (selectedSet) {
      fetchWords(selectedSet.id)
    } else {
      setWords([])
    }
  }, [selectedSet, fetchWords])


  // --- LOGIC QUẢN LÝ BỘ TỪ ---

  // ✅ HÀM ĐÃ SỬA: handleAddSet
  const handleAddSet = async () => {
    if (!newSetName.trim()) {
      toast({
        title: "Thao tác thất bại",
        description: "Tên bộ từ không được để trống.",
        variant: "destructive",
      });
      return; 
    }

    // ✅ BƯỚC QUAN TRỌNG: KIỂM TRA userId
    if (!userId) {
      toast({
        title: "Lỗi Xác thực",
        description: "Vui lòng đăng nhập để tạo bộ từ vựng mới.",
        variant: "destructive",
      });
      return; 
    }

    setIsLoading(true);
    try {
      // ✅ TRUYỀN userId VÀO HÀM FIREBASE ĐÃ CẬP NHẬT
      await addVocabularySet(userId, newSetName.trim()); 
      
      setNewSetName('');
      setIsAddSetDialogOpen(false);
      
      // Tải lại danh sách bộ từ sau khi thêm thành công
      fetchSets(); 
      
      toast({
        title: "Thành công",
        description: `Đã tạo bộ từ '${newSetName}'`,
      });
    } catch (error) {
      console.error('Lỗi khi thêm bộ từ:', error);
      toast({
        title: "Thao tác thất bại",
        description: "Có lỗi xảy ra, có thể do lỗi quyền truy cập. Vui lòng thử lại.", 
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSet = async (setId: string, setName: string) => {
    if (!userId || !confirm(`Bạn có chắc chắn muốn xóa bộ từ '${setName}' và TẤT CẢ từ vựng bên trong?`)) return

    setIsLoading(true)
    try {
      await deleteVocabularySet(setId, userId)
      setSelectedSet(null) // Bỏ chọn bộ từ đã xóa
      fetchSets() // Tải lại danh sách
      toast({
        title: "Thành công",
        description: `Đã xóa bộ từ '${setName}'.`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Xóa bộ từ thất bại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // --- LOGIC QUẢN LÝ TỪ VỰNG ---

  const handleAddWord = async () => {
    if (!selectedSet || !userId) return
    if (!newWord.kanji.trim() || !newWord.meaning.trim()) {
      toast({
        title: "Lỗi",
        description: "Kanji/Kana và Nghĩa không được để trống.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await addVocabularyWord(selectedSet.id, userId, newWord); 
      setNewWord(INITIAL_NEW_WORD_STATE);
      fetchWords(selectedSet.id); // Tải lại danh sách từ
      fetchSets(); // Tải lại set để cập nhật wordCount
      setIsAddWordDialogOpen(false);
      toast({
        title: "Thành công",
        description: "Đã thêm từ vựng mới.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi",
        description: "Thêm từ vựng thất bại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteWord = async (setId: string, wordId: string) => {
    if (!userId || !confirm('Bạn có chắc chắn muốn xóa từ vựng này?')) return

    setIsLoading(true)
    try {
      await deleteVocabularyWord(setId, wordId, userId)
      fetchWords(setId) // Tải lại danh sách từ
      fetchSets() // Tải lại set để cập nhật wordCount
      toast({
        title: "Thành công",
        description: "Đã xóa từ vựng.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Lỗi",
        description: "Xóa từ vựng thất bại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkImport = async () => {
    if (!selectedSet || !userId) return;

    const lines = bulkImportText.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      toast({
        title: "Lỗi",
        description: "Nội dung nhập hàng loạt trống.",
        variant: "destructive",
      });
      return;
    }

    const wordsToImport = lines.map(line => {
      const parts = line.split('\t').map(p => p.trim()); // Giả định dùng tab hoặc khoảng trắng
      // Cấu trúc dự kiến: Kanji/Kana \t Nghĩa
      const [kanjiOrKana, meaning] = parts;

      // Logic đơn giản: nếu có cả 2 trường thì hợp lệ
      if (kanjiOrKana && meaning) {
        return {
          kanji: kanjiOrKana,
          kana: '', // Để trống hoặc sử dụng logic phân tích phức tạp hơn
          meaning: meaning,
        };
      }
      return null;
    }).filter((word): word is { kanji: string; kana: string; meaning: string } => word !== null);

    if (wordsToImport.length === 0) {
        toast({
            title: "Lỗi",
            description: "Không tìm thấy từ vựng hợp lệ nào trong định dạng 'Từ vựng TAB Nghĩa'.",
            variant: "destructive",
        });
        return;
    }

    setIsLoading(true);
    try {
        const count = await addMultipleVocabularyWords(selectedSet.id, userId, wordsToImport);
        setBulkImportText('');
        setIsBulkImportOpen(false);
        fetchWords(selectedSet.id);
        fetchSets(); 
        toast({
            title: "Thành công",
            description: `Đã thêm thành công ${count} từ vựng mới.`,
        });
    } catch (error) {
        console.error(error);
        toast({
            title: "Lỗi",
            description: "Nhập hàng loạt thất bại.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="flex h-full min-h-[calc(100vh-80px)]">
      {/* Sidebar - Danh sách Bộ Từ */}
      <div className="w-1/4 max-w-xs border-r bg-gray-50 dark:bg-gray-900/50 p-4 space-y-4">
        <h2 className="text-xl font-bold flex items-center">
          <List className="h-5 w-5 mr-2" /> Bộ Từ Vựng
        </h2>
        
        {/* Nút Thêm Bộ Từ Mới */}
        <Dialog open={isAddSetDialogOpen} onOpenChange={setIsAddSetDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" /> Thêm Bộ Từ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo Bộ Từ Vựng Mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="set-name">Tên Bộ Từ</Label>
              <Input 
                id="set-name"
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                placeholder="Ví dụ: N3 Từ vựng cơ bản"
              />
              <Button onClick={handleAddSet} disabled={isLoading || !userId} className="w-full">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Tạo Bộ Từ'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>


        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
          {isLoading && sets.length === 0 ? (
             <div className="text-center text-gray-500">
               <Loader2 className="h-6 w-6 animate-spin mx-auto" />
               <p className='text-sm mt-2'>Đang tải bộ từ...</p>
             </div>
          ) : sets.length === 0 ? (
            <p className="text-gray-500 text-sm italic text-center">Chưa có bộ từ nào.</p>
          ) : (
            sets.map((set) => (
              <Card 
                key={set.id} 
                className={`cursor-pointer transition-all ${
                  selectedSet?.id === set.id 
                    ? 'border-primary border-2 bg-primary/10 dark:bg-primary/20' 
                    : 'border hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                }`}
                onClick={() => {
                  setSelectedSet(set)
                  setWords([]) // Xóa từ vựng cũ khi chuyển set
                  fetchWords(set.id)
                }}
              >
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium truncate">{set.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{set.wordCount} từ</p>
                  </div>
                  <div className="flex space-x-2">
                    {/* Nút Edit/Rename */}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Giả định có hàm handleRenameSet
                        // handleRenameSet(set.id, set.name)
                        toast({title: "Tính năng", description: "Tính năng đổi tên đang được phát triển."})
                      }}
                    >
                      <Edit2 className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                    </Button>
                    {/* Nút Delete */}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteSet(set.id, set.name)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {/* Nội dung chính - Danh sách Từ Vựng */}
      <div className="flex-1 p-4">
        {selectedSet ? (
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl">{selectedSet.name} ({selectedSet.wordCount} từ)</CardTitle>
                <div className="space-x-2">
                    {/* Dialog Thêm Từ Vựng Mới */}
                    <Dialog open={isAddWordDialogOpen} onOpenChange={setIsAddWordDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="secondary">
                                <Plus className="h-4 w-4 mr-2" /> Thêm Từ Đơn
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Thêm Từ Vựng vào Bộ "{selectedSet.name}"</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Label htmlFor="word-kanji">Kanji / Kana</Label>
                                <Input 
                                    id="word-kanji"
                                    value={newWord.kanji}
                                    onChange={(e) => setNewWord({...newWord, kanji: e.target.value})}
                                    placeholder="例: 日本語 (にほんご)"
                                />
                                <Label htmlFor="word-meaning">Nghĩa</Label>
                                <Input 
                                    id="word-meaning"
                                    value={newWord.meaning}
                                    onChange={(e) => setNewWord({...newWord, meaning: e.target.value})}
                                    placeholder="Ví dụ: Tiếng Nhật"
                                />
                                <Label htmlFor="word-notes">Ghi chú (Tùy chọn)</Label>
                                <Textarea
                                    id="word-notes"
                                    value={newWord.notes}
                                    onChange={(e) => setNewWord({...newWord, notes: e.target.value})}
                                    placeholder="Ghi chú về ngữ pháp hoặc cách dùng..."
                                />
                                <Button onClick={handleAddWord} disabled={isLoading || !newWord.kanji.trim() || !newWord.meaning.trim()} className="w-full">
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Lưu Từ Vựng'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    
                    {/* Dialog Nhập Hàng Loạt */}
                    <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Import className="h-4 w-4 mr-2" /> Nhập Hàng Loạt
                            </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-xl'>
                            <DialogHeader>
                                <DialogTitle>Nhập Hàng Loạt Từ Vựng</DialogTitle>
                                <CardDescription>Nhập từ vựng theo định dạng: **Từ vựng [TAB] Nghĩa**. Mỗi từ một dòng.</CardDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Textarea
                                    rows={10}
                                    value={bulkImportText}
                                    onChange={(e) => setBulkImportText(e.target.value)}
                                    placeholder="Ví dụ:\n家族\tGia đình\n勉強\tHọc tập\n頑張る\tCố gắng"
                                />
                                <Button onClick={handleBulkImport} disabled={isLoading || bulkImportText.trim().length === 0} className="w-full">
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : `Nhập ${bulkImportText.split('\n').filter(l => l.trim()).length} Dòng`}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center text-gray-500 py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      <p className='text-md mt-2'>Đang tải từ vựng...</p>
                    </div>
                  ) : words.length === 0 ? (
                    <div className="text-center p-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium">Bộ từ "{selectedSet.name}" chưa có từ vựng nào.</h3>
                      <p className="text-gray-600 dark:text-gray-400">Vui lòng thêm từ vựng để bắt đầu học.</p>
                      <Button onClick={() => setIsAddWordDialogOpen(true)} className="mt-4">
                          Thêm Từ Vựng Ngay
                      </Button>
                    </div>
                  ) : (
                    words.map((word) => (
                      <Card key={word.id} className="bg-gray-50 dark:bg-gray-700 border-0 shadow-sm transition-shadow hover:shadow-md">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center space-x-3 mb-1">
                              <p className="text-lg font-semibold text-primary dark:text-primary-light truncate">{word.kanji}</p>
                              {word.kana && <Badge variant="secondary" className="text-sm">{word.kana}</Badge>}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 line-clamp-1">{word.meaning}</p>
                            {word.notes && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                <MessageSquare className="h-3 w-3 mr-1" /> {word.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2 shrink-0">
                            {/* Nút Edit */}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                // Giả định hàm handleEditWord(word)
                                toast({title: "Tính năng", description: "Tính năng chỉnh sửa từ vựng đang được phát triển."})
                              }}
                            >
                              <Edit2 className="h-4 w-4 text-gray-500" />
                            </Button>
                            {/* Nút Delete */}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteWord(selectedSet.id, word.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg text-center p-8 h-full flex flex-col justify-center items-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Chọn một bộ từ</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Vui lòng chọn một bộ từ từ danh sách bên trái để quản lý các từ vựng
              </p>
              <Button variant="outline" onClick={fetchSets} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Tải lại danh sách bộ từ'}
              </Button>
            </Card>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-sm text-center text-gray-500 dark:text-gray-400">
        **LƯU Ý**: Chế độ Học (Learning Mode) chỉ hoạt động nếu bộ từ đã chọn có ít nhất 4 từ.
      </p>
    </div>
  )
}