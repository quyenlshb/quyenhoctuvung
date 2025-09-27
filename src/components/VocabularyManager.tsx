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
import { 
  Plus, 
  Edit2, 
  Trash2, 
  BookOpen,
  Hash,
  Loader2,
  List,
  MessageSquare
} from 'lucide-react'

import { useAuth } from './AuthProvider' 

// ⚡️ IMPORT HÀM FIREBASE THỰC TẾ
import { 
  getVocabularySets, 
  addVocabularySet, 
  updateVocabularySet, 
  deleteVocabularySet, 
  addVocabularyWord, 
  updateVocabularyWord, 
  deleteVocabularyWord,
  addMultipleVocabularyWords 
} from '../lib/firebase' 

// ----------------------------------------------------
// INTERFACES (Giữ nguyên)
// ----------------------------------------------------

interface VocabularyWord {
  id: string
  kanji: string
  kana: string
  meaning: string
  notes?: string
  difficulty: number // 0-100. Lower means more difficult.
}

interface VocabularySet {
  id: string
  name: string
  description?: string
  wordCount: number 
}

// ----------------------------------------------------
// HELPER: PARSER CHO BULK IMPORT (ĐÃ CHỈNH SỬA)
// ----------------------------------------------------

const parseBulkText = (text: string): { kanji: string, kana: string, meaning: string, notes: string, difficulty: number }[] => {
    // Loại bỏ dòng trống và dòng comment (bắt đầu bằng // hoặc #)
    const lines = text.trim().split('\n').filter(line => line.trim() !== '' && !line.trim().startsWith('//') && !line.trim().startsWith('#'));
    
    return lines.map(line => {
        // Tách các trường bằng dấu cách hoặc nhiều khoảng trắng
        const parts = line.trim().split(/\s+/); 
        
        // ✅ CHỈ CẦN 3 TRƯỜNG: kanji, kana, meaning
        if (parts.length < 3) {
            return null;
        }
        
        let kanji = parts[0] || '';
        let kana = parts[1] || '';
        let meaning = parts[2] || '';
        // ✅ GHI CHÚ LUÔN LÀ RỖNG, BỎ QUA CÁC TRƯỜNG THỨ 4 TRỞ ĐI CỦA INPUT
        let notes = ''; 
        
        return {
            kanji: kanji.trim(),
            kana: kana.trim(),
            meaning: meaning.trim(),
            notes: notes, 
            difficulty: 50 // Giá trị mặc định
        };
    }).filter((word): word is { kanji: string, kana: string, meaning: string, notes: string, difficulty: number } => word !== null);
};

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------

export default function VocabularyManager() {
  const { user } = useAuth()
  const userId = user?.id 
  
  const [sets, setSets] = useState<VocabularySet[]>([])
  const [selectedSet, setSelectedSet] = useState<VocabularySet | null>(null)
  const [words, setWords] = useState<VocabularyWord[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isSetDialogOpen, setIsSetDialogOpen] = useState(false)
  const [isWordDialogOpen, setIsWordDialogOpen] = useState(false)
  const [editingSet, setEditingSet] = useState<VocabularySet | null>(null)
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null)
  const [wordFormLoading, setWordFormLoading] = useState(false);

  // ----------------------------------------------------
  // HÀM FETCH DỮ LIỆU (Giữ nguyên)
  // ----------------------------------------------------

  const fetchSets = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      const fetchedSets = await getVocabularySets(userId)
      setSets(fetchedSets)
    } catch (err) {
      setError("Không thể tải danh sách bộ từ. Vui lòng thử lại.");
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])
  
  const fetchWordsForSet = useCallback(async (setId: string) => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
        const fetchedWords = await getVocabularyWords(userId, setId); 
        setWords(fetchedWords);
    } catch (err) {
      setError("Không thể tải từ vựng cho bộ từ này.");
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])


  useEffect(() => {
    fetchSets()
  }, [fetchSets])
  
  // ----------------------------------------------------
  // HÀM XỬ LÝ SETS (Giữ nguyên)
  // ----------------------------------------------------

  const handleSetFormSubmit = async (name: string, description: string) => {
    if (!userId || !name.trim()) return
    setError(null)
    setIsLoading(true)
    try {
      if (editingSet) {
        // UPDATE
        await updateVocabularySet(userId, editingSet.id, { name, description })
      } else {
        // ADD NEW
        await addVocabularySet(userId, { name, description })
      }
      setIsSetDialogOpen(false)
      setEditingSet(null)
      await fetchSets()
      
    } catch (err) {
      setError("Thao tác thất bại. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSet = async (setId: string) => {
    if (!userId) return
    if (!window.confirm("Bạn có chắc chắn muốn xóa bộ từ này? Thao tác này không thể hoàn tác.")) return;

    setError(null)
    setIsLoading(true)
    try {
      await deleteVocabularySet(userId, setId)
      await fetchSets()
      if (selectedSet?.id === setId) {
        setSelectedSet(null)
        setWords([])
      }
    } catch (err) {
      setError("Xóa bộ từ thất bại.");
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSetSelect = (set: VocabularySet) => {
    setSelectedSet(set)
    fetchWordsForSet(set.id); 
  }

  // ----------------------------------------------------
  // HÀM XỬ LÝ WORDS (Giữ nguyên logic chính)
  // ----------------------------------------------------
  
  const handleWordFormSubmit = async (data: { kanji: string, kana: string, meaning: string, notes: string }) => {
    if (!userId || !selectedSet) return
    setWordFormLoading(true)
    setError(null)
    try {
      if (editingWord) {
        // UPDATE WORD
        await updateVocabularyWord(userId, selectedSet.id, editingWord.id, { 
            kanji: data.kanji, 
            kana: data.kana, 
            meaning: data.meaning, 
            notes: data.notes 
        })
      } else {
        // ADD NEW WORD (Single)
        await addVocabularyWord(userId, selectedSet.id, { 
            kanji: data.kanji, 
            kana: data.kana, 
            meaning: data.meaning, 
            notes: data.notes,
            difficulty: 50 
        })
      }
      
      setIsWordDialogOpen(false)
      setEditingWord(null)
      await fetchWordsForSet(selectedSet.id) 
      await fetchSets() 
      
    } catch (err) {
      setError("Thao tác từ vựng thất bại. Vui lòng thử lại.");
    } finally {
      setWordFormLoading(false)
    }
  }
  
  // HÀM XỬ LÝ BULK IMPORT MỚI
  const handleBulkImport = async (bulkText: string) => {
    if (!userId || !selectedSet) return;
    setWordFormLoading(true);
    setError(null);
    
    const newWords = parseBulkText(bulkText);
    
    if (newWords.length === 0) {
        setError("Không có từ vựng hợp lệ nào được tìm thấy. Định dạng yêu cầu: [Kanji/Từ] [Kana/Đọc] [Nghĩa]");
        setWordFormLoading(false);
        return;
    }
    
    try {
        const addedCount = await addMultipleVocabularyWords(userId, selectedSet.id, newWords); 
        
        setIsWordDialogOpen(false);
        setEditingWord(null);
        
        if (addedCount > 0) {
            // Tải lại từ vựng và sets chỉ khi có từ được thêm
            await fetchWordsForSet(selectedSet.id); 
            await fetchSets(); 
        } else {
            setError("Không có từ nào được thêm. Vui lòng kiểm tra lại định dạng.");
        }
        
    } catch (err: any) {
        setError(err.message || "Thao tác nhập danh sách từ vựng thất bại. Vui lòng thử lại.");
    } finally {
        setWordFormLoading(false);
    }
  };

  const handleDeleteWord = async (setId: string, wordId: string) => {
    if (!userId) return
    if (!window.confirm("Bạn có chắc chắn muốn xóa từ vựng này?")) return;
    
    setWordFormLoading(true)
    setError(null)
    try {
      await deleteVocabularyWord(userId, setId, wordId)
      
      setWords(prev => prev.filter(w => w.id !== wordId));
      await fetchSets(); 
      
    } catch (err) {
      setError("Xóa từ vựng thất bại.");
    } finally {
      setWordFormLoading(false)
    }
  }


  // ----------------------------------------------------
  // COMPONENTS NỘI BỘ: SET FORM (Giữ nguyên)
  // ----------------------------------------------------
  
  const SetForm = () => {
    const [name, setName] = useState(editingSet?.name || '')
    const [description, setDescription] = useState(editingSet?.description || '')
    const [formError, setFormError] = useState<string | null>(null)
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!name.trim()) {
        setFormError("Tên bộ từ không được để trống.")
        return
      }
      setFormError(null)
      handleSetFormSubmit(name, description)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="set-name">Tên bộ từ</Label>
          <Input 
            id="set-name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Ví dụ: N5 Động từ" 
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="set-description">Mô tả</Label>
          <Textarea 
            id="set-description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Mô tả ngắn về nội dung bộ từ này..."
            rows={3}
            disabled={isLoading}
          />
        </div>
        
        {formError && <p className="text-red-500 text-sm">{formError}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : editingSet ? 'Cập nhật Bộ từ' : 'Tạo Bộ từ mới'}
        </Button>
      </form>
    )
  }
  
  // ----------------------------------------------------
  // COMPONENTS NỘI BỘ: WORD FORM (Single Entry - Giữ nguyên)
  // ----------------------------------------------------
  
  const WordForm = () => {
    const [kanji, setKanji] = useState(editingWord?.kanji || '')
    const [kana, setKana] = useState(editingWord?.kana || '')
    const [meaning, setMeaning] = useState(editingWord?.meaning || '')
    const [notes, setNotes] = useState(editingWord?.notes || '')
    const [formError, setFormError] = useState<string | null>(null)
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!kanji.trim() || !kana.trim() || !meaning.trim()) {
        setFormError("Kanji/Kana, và Nghĩa không được để trống.")
        return
      }
      setFormError(null)
      handleWordFormSubmit({ kanji, kana, meaning, notes })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="word-kanji">Từ (Kanji)</Label>
          <Input id="word-kanji" value={kanji} onChange={(e) => setKanji(e.target.value)} placeholder="例 (Ví dụ)" required disabled={wordFormLoading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="word-kana">Cách đọc (Kana/Furigana)</Label>
          <Input id="word-kana" value={kana} onChange={(e) => setKana(e.target.value)} placeholder="れい (rei)" required disabled={wordFormLoading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="word-meaning">Nghĩa tiếng Việt</Label>
          <Input id="word-meaning" value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="Ví dụ" required disabled={wordFormLoading} />
        </div>
        {/* Giữ lại trường Ghi chú cho nhập tay */}
        <div className="space-y-2">
          <Label htmlFor="word-notes">Ghi chú / Ví dụ</Label>
          <Textarea 
            id="word-notes" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Ghi chú về ngữ cảnh hoặc ví dụ..." 
            rows={2}
            disabled={wordFormLoading}
          />
        </div>
        
        {formError && <p className="text-red-500 text-sm">{formError}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <Button type="submit" className="w-full" disabled={wordFormLoading}>
          {wordFormLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : editingWord ? 'Cập nhật Từ vựng' : 'Thêm Từ vựng'}
        </Button>
      </form>
    )
  }
  
  // ----------------------------------------------------
  // COMPONENTS NỘI BỘ: BULK WORD FORM (ĐÃ CHỈNH SỬA)
  // ----------------------------------------------------
  
  const BulkWordForm = () => {
    const [bulkText, setBulkText] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const parsedWordsCount = parseBulkText(bulkText).length;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (parsedWordsCount === 0) {
            setFormError("Vui lòng dán danh sách từ vựng hợp lệ.");
            return;
        }
        
        await handleBulkImport(bulkText);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="space-y-2">
                <Label htmlFor="bulk-import-area">Dán danh sách từ vựng</Label>
                <Textarea
                    id="bulk-import-area"
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    // ✅ CẬP NHẬT PLACEHOLDER
                    placeholder="Ví dụ:\n\n本 ほん Sách\n食べる たべる Ăn" 
                    rows={8}
                    required
                    disabled={wordFormLoading}
                />
            </div>
            
            {/* ✅ CẬP NHẬT MÔ TẢ ĐỊNH DẠNG */}
            <p className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                **Định dạng bắt buộc**: Mỗi từ một dòng. Các trường phân tách bằng **dấu cách**.<br/>
                `[Kanji/Từ] [Kana/Đọc] [Nghĩa TV]` (Chỉ chấp nhận tối đa 3 trường)
            </p>

            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <Button type="submit" className="w-full" disabled={wordFormLoading || parsedWordsCount === 0}>
                {wordFormLoading 
                    ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
                    : `Nhập ${parsedWordsCount} Từ vựng`
                }
            </Button>
        </form>
    );
  };
  
  // ----------------------------------------------------
  // RENDER CHÍNH (Giữ nguyên)
  // ----------------------------------------------------

  if (!user) {
    return (
      <div className="flex justify-center items-center h-96">
        <Card className="text-center p-8 shadow-lg">
          <CardTitle>Truy cập bị từ chối</CardTitle>
          <CardDescription className="mt-2">Vui lòng đăng nhập để quản lý từ vựng của bạn.</CardDescription>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <BookOpen className="h-7 w-7 mr-3 text-primary" />
        Quản lý Từ vựng
      </h1>
      
      {isLoading && (
        <div className="flex items-center text-primary mb-4">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Đang tải dữ liệu...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Lỗi</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1: Danh sách Bộ từ */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bộ từ của tôi</CardTitle>
              <Dialog open={isSetDialogOpen} onOpenChange={(open) => {
                setIsSetDialogOpen(open)
                if (!open) setEditingSet(null)
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => setEditingSet(null)}>
                    <Plus className="h-4 w-4 mr-2" /> Thêm Bộ từ
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingSet ? 'Chỉnh sửa Bộ từ' : 'Tạo Bộ từ mới'}</DialogTitle>
                  </DialogHeader>
                  <SetForm />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                {sets.length === 0 && !isLoading ? (
                  <p className="text-gray-500 text-center py-4">Chưa có bộ từ nào.</p>
                ) : (
                  sets.map((set) => (
                    <div
                      key={set.id}
                      className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors border ${
                        selectedSet?.id === set.id 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-white dark:bg-gray-800 hover:bg-accent dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => handleSetSelect(set)}
                    >
                      <div>
                        <p className="font-semibold text-sm truncate">{set.name}</p>
                        <div className={`flex items-center text-xs ${selectedSet?.id === set.id ? 'text-primary-foreground/80' : 'text-gray-500 dark:text-gray-400'}`}>
                            <Hash className="h-3 w-3 mr-1" /> {set.wordCount || 0} từ
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingSet(set)
                            setIsSetDialogOpen(true)
                          }}
                          className={`${selectedSet?.id === set.id ? 'hover:bg-primary-foreground/20' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSet(set.id)
                          }}
                          className={`${selectedSet?.id === set.id ? 'text-red-200 hover:bg-red-500/50' : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50'}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột 2 & 3: Chi tiết từ vựng */}
        <div className="lg:col-span-2 space-y-4">
          {selectedSet ? (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="truncate">Từ vựng trong: {selectedSet.name}</CardTitle>
                
                {/* DIALOG MỚI VỚI TABS */}
                <Dialog open={isWordDialogOpen} onOpenChange={(open) => {
                  setIsWordDialogOpen(open)
                  if (!open) setEditingWord(null)
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={wordFormLoading}>
                      <Plus className="h-4 w-4 mr-2" /> Thêm Từ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px] p-0"> 
                    <Tabs defaultValue="single">
                      <DialogHeader className='p-6 pb-0'>
                        <DialogTitle>
                          {editingWord ? 'Chỉnh sửa Từ vựng' : 'Thêm Từ vựng mới'}
                        </DialogTitle>
                      </DialogHeader>
                      <TabsList className="grid w-full grid-cols-2 h-10 px-4">
                        <TabsTrigger value="single" disabled={!!editingWord}>Thêm từng từ</TabsTrigger>
                        <TabsTrigger value="bulk" disabled={!!editingWord}>Nhập danh sách</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="single">
                        <WordForm />
                      </TabsContent>
                      
                      <TabsContent value="bulk">
                        <BulkWordForm />
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{selectedSet.description || 'Không có mô tả.'}</p>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                    
                  {words.length === 0 ? (
                    <div className="text-center py-8">
                       <List className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                       <p className="text-gray-500">Bộ từ này chưa có từ vựng nào.</p>
                       <p className="text-gray-500 text-sm">Hãy thêm từ đầu tiên của bạn!</p>
                    </div>
                  ) : (
                    words.map((word) => (
                      <Card key={word.id} className="bg-gray-50 dark:bg-gray-800 border-0">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xl font-bold truncate">{word.kanji}</span>
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">{word.kana}</Badge>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{word.meaning}</p>
                            {word.notes && (
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    <span className="truncate">{word.notes}</span>
                                </div>
                            )}
                          </div>
                          <div className="flex space-x-1 ml-4 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingWord(word)
                                setIsWordDialogOpen(true)
                              }}
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
        **LƯU Ý**: Chức năng **Nhập danh sách** sẽ không khả dụng khi bạn đang **Chỉnh sửa** một từ vựng có sẵn.
      </p>
    </div>
  )
}