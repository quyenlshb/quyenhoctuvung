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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { useToast } from '../hooks/use-toast' 
import { 
  Plus, Edit2, Trash2, BookOpen, Hash, Loader2, List, MessageSquare, Import
} from 'lucide-react'

import { useAuth } from './AuthProvider' 

import { 
  getVocabularySets, addVocabularySet, updateVocabularySet, deleteVocabularySet, 
  getVocabularyWords, addVocabularyWord, updateVocabularyWord, deleteVocabularyWord,
  bulkAddVocabularyWords
} from '../lib/firebase' 

import type { VocabularySet, VocabularyWord } from '../lib/firebase'

export default function VocabularyManager() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [vocabularySets, setVocabularySets] = useState<VocabularySet[]>([])
  const [selectedSet, setSelectedSet] = useState<VocabularySet | null>(null)
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [isCreateSetOpen, setIsCreateSetOpen] = useState(false)
  
  const [newSetName, setNewSetName] = useState('')
  const [newSetDescription, setNewSetDescription] = useState('')

  const [newWordKanji, setNewWordKanji] = useState('')
  const [newWordKana, setNewWordKana] = useState('')
  const [newWordMeaning, setNewWordMeaning] = useState('')
  const [newWordNotes, setNewWordNotes] = useState('')
  
  const [isEditWordOpen, setIsEditWordOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null)
  const [editKanji, setEditKanji] = useState('')
  const [editKana, setEditKana] = useState('')
  const [editMeaning, setEditMeaning] = useState('')
  const [editNotes, setEditNotes] = useState('')

  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [bulkData, setBulkData] = useState('')
  const [bulkImportProgress, setBulkImportProgress] = useState<string | null>(null)

  // ----------------- Fetch Data -----------------
  const fetchSets = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const sets = await getVocabularySets(user.id)
      setVocabularySets(sets)
      if (!selectedSet && sets.length > 0) {
        setSelectedSet(sets[0])
      }
    } catch (error) {
      console.error('Error fetching vocabulary sets:', error)
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách bộ từ.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedSet, toast])

  const fetchWords = useCallback(async (setId: string) => {
    setIsLoading(true)
    try {
      const words = await getVocabularyWords(user!.id, setId)
      setVocabularyWords(words)
    } catch (error) {
      console.error('Error fetching vocabulary words:', error)
      toast({ title: 'Lỗi', description: 'Không thể tải từ vựng.', variant: 'destructive' })
      setVocabularyWords([])
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  useEffect(() => { fetchSets() }, [fetchSets]) 
  useEffect(() => {
    if (selectedSet) fetchWords(selectedSet.id)
    else setVocabularyWords([])
  }, [selectedSet, fetchWords])

  // ----------------- Create / Update / Delete Set -----------------
  const handleCreateSet = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSetName.trim() || !user) return

    setIsLoading(true)
    try {
      const newSet = await addVocabularySet(user.id, newSetName.trim(), newSetDescription.trim())
      setVocabularySets((prev) => [...prev, newSet])
      setSelectedSet(newSet) 
      setNewSetName(''); setNewSetDescription(''); setIsCreateSetOpen(false) 
      toast({ title: 'Thành công!', description: `Đã tạo bộ từ "${newSet.name}".` })
    } catch (error) {
      console.error('Error creating vocabulary set:', error)
      toast({ title: 'Lỗi', description: 'Không thể tạo bộ từ.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [user, newSetName, newSetDescription, toast])

  const handleDeleteSet = useCallback(async (setId: string, setName: string) => {
    if (!user || !confirm(`Bạn có chắc chắn muốn xóa bộ từ "${setName}"?`)) return
    setIsLoading(true)
    try {
      await deleteVocabularySet(user.id, setId)
      setVocabularySets(prev => prev.filter(set => set.id !== setId))
      if (selectedSet && selectedSet.id === setId) {
        setSelectedSet(null); setVocabularyWords([])
      }
      toast({ title: 'Thành công!', description: `Đã xóa bộ từ "${setName}".` })
    } catch (error) {
      console.error('Error deleting vocabulary set:', error)
      toast({ title: 'Lỗi', description: 'Không thể xóa bộ từ.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedSet, toast])

  const handleUpdateSet = useCallback(async (setId: string, newName: string, newDescription: string) => {
    if (!user) return
    setIsLoading(true)
    try {
      await updateVocabularySet(user.id, setId, newName, newDescription)
      setVocabularySets(prev => prev.map(set => set.id === setId ? { ...set, name: newName, description: newDescription } : set))
      if (selectedSet && selectedSet.id === setId) {
        setSelectedSet(prev => prev ? { ...prev, name: newName, description: newDescription } : null)
      }
      toast({ title: 'Thành công!', description: 'Đã cập nhật bộ từ.' })
    } catch (error) {
      console.error('Error updating vocabulary set:', error)
      toast({ title: 'Lỗi', description: 'Không thể cập nhật bộ từ.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedSet, toast])

  // ----------------- Add / Update / Delete Word -----------------
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
      const wordWithId = await addVocabularyWord(user.id, selectedSet.id, newWord)
      setVocabularyWords(prev => [wordWithId, ...prev])
      setSelectedSet(prev => prev ? { ...prev, totalWords: (prev.totalWords || 0) + 1 } : null)
      setVocabularySets(prev => prev.map(set => set.id === selectedSet.id ? { ...set, totalWords: (set.totalWords || 0) + 1 } : set))
      setNewWordKanji(''); setNewWordKana(''); setNewWordMeaning(''); setNewWordNotes('')
      toast({ title: 'Thành công!', description: `Đã thêm từ: ${wordWithId.kanji}` })
    } catch (error) {
      console.error('Error adding vocabulary word:', error)
      toast({ title: 'Lỗi', description: 'Không thể thêm từ vựng.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedSet, newWordKanji, newWordKana, newWordMeaning, newWordNotes, toast])

  const handleUpdateWord = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSet || !user || !editingWord) return
    setIsLoading(true)
    try {
      const updatedData = { kanji: editKanji.trim(), kana: editKana.trim(), meaning: editMeaning.trim(), notes: editNotes.trim() }
      await updateVocabularyWord(user.id, selectedSet.id, editingWord.id, updatedData)
      setVocabularyWords(prev => prev.map(word => word.id === editingWord.id ? { ...word, ...updatedData } as VocabularyWord : word))
      setIsEditWordOpen(false); setEditingWord(null)
      toast({ title: 'Thành công!', description: `Đã cập nhật từ: ${editKanji}` })
    } catch (error) {
      console.error('Error updating vocabulary word:', error)
      toast({ title: 'Lỗi', description: 'Không thể cập nhật từ vựng.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedSet, editingWord, editKanji, editKana, editMeaning, editNotes, toast])

  const handleDeleteWord = useCallback(async (setId: string, wordId: string) => {
    if (!user || !confirm('Bạn có chắc chắn muốn xóa từ vựng này?')) return
    setIsLoading(true)
    try {
      await deleteVocabularyWord(user.id, setId, wordId)
      setVocabularyWords(prev => prev.filter(word => word.id !== wordId))
      setSelectedSet(prev => prev ? { ...prev, totalWords: Math.max(0, (prev.totalWords || 0) - 1) } : null)
      setVocabularySets(prev => prev.map(set => set.id === setId ? { ...set, totalWords: Math.max(0, (set.totalWords || 0) - 1) } : set))
      toast({ title: 'Thành công!', description: 'Đã xóa từ vựng.' })
    } catch (error) {
      console.error('Error deleting vocabulary word:', error)
      toast({ title: 'Lỗi', description: 'Không thể xóa từ vựng.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedSet, toast])

  // ----------------- Bulk Import -----------------
  const handleBulkImport = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSet || !user || !bulkData.trim()) return

    const lines = bulkData.trim().split('\n').filter(line => line.trim() !== '')
    const newWords: Omit<VocabularyWord, 'id' | 'difficulty' | 'lastReviewed'>[] = []

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim())
      if (parts.length >= 3) {
        newWords.push({
          kanji: parts[0],
          kana: parts[1] || '',
          meaning: parts[2],
          notes: parts[3] || '',
        })
      }
    }

    if (newWords.length === 0) {
      toast({ title: 'Lỗi định dạng', description: 'Định dạng phải là Kanji,Kana,Nghĩa[,Ghi chú]', variant: 'destructive' })
      return
    }

    setBulkImportProgress(`Đang nhập ${newWords.length} từ...`)

    try {
      const addedWords = await bulkAddVocabularyWords(user.id, selectedSet.id, newWords)
      setVocabularyWords(prev => [...addedWords, ...prev])
      setSelectedSet(prev => prev ? { ...prev, totalWords: (prev.totalWords || 0) + addedWords.length } : null)
      setVocabularySets(prev => prev.map(set => set.id === selectedSet.id ? { ...set, totalWords: (set.totalWords || 0) + addedWords.length } : set))
      toast({ title: 'Thành công!', description: `Đã nhập ${addedWords.length} từ.` })
      setBulkData(''); setIsBulkImportOpen(false)
    } catch (error) {
      console.error('Error during bulk import:', error)
      toast({ title: 'Lỗi', description: 'Không thể nhập từ số lượng lớn.', variant: 'destructive' })
    } finally {
      setBulkImportProgress(null)
    }
  }, [user, selectedSet, bulkData, toast])
  // ----------------- Render -----------------
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Từ vựng</CardTitle>
          <CardDescription>Tạo và quản lý bộ từ vựng của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tabs cho danh sách bộ từ */}
          <Tabs value={selectedSet?.id || ''} onValueChange={(val) => {
            const set = vocabularySets.find(s => s.id === val)
            if (set) setSelectedSet(set)
          }}>
            <TabsList>
              {vocabularySets.map(set => (
                <TabsTrigger key={set.id} value={set.id}>
                  {set.name} <Badge variant="secondary" className="ml-2">{set.totalWords || 0}</Badge>
                </TabsTrigger>
              ))}
              <Dialog open={isCreateSetOpen} onOpenChange={setIsCreateSetOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="ml-2">
                    <Plus className="w-4 h-4 mr-1" /> Bộ từ mới
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tạo bộ từ mới</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateSet} className="space-y-4">
                    <div>
                      <Label htmlFor="setName">Tên bộ từ</Label>
                      <Input id="setName" value={newSetName} onChange={(e) => setNewSetName(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="setDescription">Mô tả</Label>
                      <Textarea id="setDescription" value={newSetDescription} onChange={(e) => setNewSetDescription(e.target.value)} />
                    </div>
                    <Button type="submit" disabled={isLoading}>Tạo</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsList>

            {/* Nội dung từng bộ từ */}
            {vocabularySets.map(set => (
              <TabsContent key={set.id} value={set.id} className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{set.name}</h2>
                    <p className="text-sm text-muted-foreground">{set.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm"><Edit2 className="w-4 h-4 mr-1" />Sửa</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Sửa bộ từ</DialogTitle></DialogHeader>
                        <EditSetForm set={set} onUpdate={handleUpdateSet} />
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteSet(set.id, set.name)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Xóa
                    </Button>
                  </div>
                </div>

                {/* Form thêm từ */}
                <form onSubmit={handleAddWord} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Input placeholder="Kanji" value={newWordKanji} onChange={(e) => setNewWordKanji(e.target.value)} />
                  <Input placeholder="Kana" value={newWordKana} onChange={(e) => setNewWordKana(e.target.value)} />
                  <Input placeholder="Nghĩa" value={newWordMeaning} onChange={(e) => setNewWordMeaning(e.target.value)} />
                  <Input placeholder="Ghi chú" value={newWordNotes} onChange={(e) => setNewWordNotes(e.target.value)} />
                  <Button type="submit" className="md:col-span-4" disabled={isLoading}>
                    <Plus className="w-4 h-4 mr-1" /> Thêm từ
                  </Button>
                </form>

                {/* Bulk Import */}
                <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <Import className="w-4 h-4 mr-1" /> Nhập nhiều từ
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nhập từ số lượng lớn</DialogTitle>
                      <DialogDescription>
                        Mỗi dòng: <code>Kanji,Kana,Nghĩa[,Ghi chú]</code>
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBulkImport} className="space-y-4">
                      <Textarea rows={10} value={bulkData} onChange={(e) => setBulkData(e.target.value)} />
                      {bulkImportProgress && <p className="text-sm text-muted-foreground">{bulkImportProgress}</p>}
                      <Button type="submit" disabled={isLoading}>Nhập</Button>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Danh sách từ */}
                <div className="grid gap-2">
                  {vocabularyWords.map(word => (
                    <Card key={word.id}>
                      <CardContent className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">{word.kanji} {word.kana && `(${word.kana})`}</p>
                          <p className="text-sm text-muted-foreground">{word.meaning}</p>
                          {word.notes && <p className="text-xs italic">{word.notes}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Dialog open={isEditWordOpen && editingWord?.id === word.id} onOpenChange={(open) => {
                            setIsEditWordOpen(open)
                            if (open) {
                              setEditingWord(word)
                              setEditKanji(word.kanji)
                              setEditKana(word.kana)
                              setEditMeaning(word.meaning)
                              setEditNotes(word.notes || '')
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline"><Edit2 className="w-4 h-4" /></Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Sửa từ</DialogTitle></DialogHeader>
                              <form onSubmit={handleUpdateWord} className="space-y-2">
                                <Input value={editKanji} onChange={(e) => setEditKanji(e.target.value)} placeholder="Kanji" />
                                <Input value={editKana} onChange={(e) => setEditKana(e.target.value)} placeholder="Kana" />
                                <Input value={editMeaning} onChange={(e) => setEditMeaning(e.target.value)} placeholder="Nghĩa" />
                                <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Ghi chú" />
                                <Button type="submit" disabled={isLoading}>Lưu</Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteWord(set.id, word.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// ----------------- Subcomponent: EditSetForm -----------------
function EditSetForm({ set, onUpdate }: { set: VocabularySet, onUpdate: (id: string, newName: string, newDescription: string) => void }) {
  const [name, setName] = useState(set.name)
  const [description, setDescription] = useState(set.description)

  return (
    <form onSubmit={(e) => { e.preventDefault(); onUpdate(set.id, name, description) }} className="space-y-4">
      <div>
        <Label htmlFor="editName">Tên bộ từ</Label>
        <Input id="editName" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="editDescription">Mô tả</Label>
        <Textarea id="editDescription" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <Button type="submit">Lưu thay đổi</Button>
    </form>
  )
}
