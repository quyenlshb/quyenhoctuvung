import { useState, useCallback, useEffect } from 'react'
import { useToast } from '../hooks/use-toast'
import { useAuth } from '../components/AuthProvider'
import {
  getVocabularySets, addVocabularySet, updateVocabularySet, deleteVocabularySet,
  getVocabularyWords, addVocabularyWord, updateVocabularyWord, deleteVocabularyWord,
  bulkAddVocabularyWords
} from '../lib/firebase'
import type { VocabularySet, VocabularyWord } from '../lib/firebase'

export function useVocabularyManager() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [vocabularySets, setVocabularySets] = useState<VocabularySet[]>([])
  const [selectedSet, setSelectedSet] = useState<VocabularySet | null>(null)
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch sets
  const fetchSets = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const sets = await getVocabularySets(user.id)
      setVocabularySets(sets)
      if (!selectedSet && sets.length > 0) setSelectedSet(sets[0])
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách bộ từ.', variant: 'destructive' })
    } finally { setIsLoading(false) }
  }, [user, selectedSet, toast])

  // Fetch words
  const fetchWords = useCallback(async (setId: string) => {
    setIsLoading(true)
    try {
      const words = await getVocabularyWords(user!.id, setId)
      setVocabularyWords(words)
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể tải từ vựng.', variant: 'destructive' })
      setVocabularyWords([])
    } finally { setIsLoading(false) }
  }, [user, toast])

  useEffect(() => { fetchSets() }, [fetchSets])
  useEffect(() => {
    if (selectedSet) fetchWords(selectedSet.id)
    else setVocabularyWords([])
  }, [selectedSet, fetchWords])

  // CRUD sets
  const createSet = useCallback(async (name: string, description: string) => {
    if (!user || !name.trim()) return null
    setIsLoading(true)
    try {
      const newSet = await addVocabularySet(user.id, name.trim(), description.trim())
      setVocabularySets(prev => [...prev, newSet])
      setSelectedSet(newSet)
      toast({ title: 'Thành công!', description: `Đã tạo bộ từ "${newSet.name}".` })
      return newSet
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể tạo bộ từ.', variant: 'destructive' })
      return null
    } finally { setIsLoading(false) }
  }, [user, toast])

  const updateSet = useCallback(async (setId: string, name: string, description: string) => {
    if (!user) return
    setIsLoading(true)
    try {
      await updateVocabularySet(user.id, setId, name, description)
      setVocabularySets(prev => prev.map(s => s.id === setId ? { ...s, name, description } : s))
      if (selectedSet?.id === setId) setSelectedSet({ ...selectedSet, name, description })
      toast({ title: 'Thành công!', description: 'Đã cập nhật bộ từ.' })
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật bộ từ.', variant: 'destructive' })
    } finally { setIsLoading(false) }
  }, [user, selectedSet, toast])

  const deleteSet = useCallback(async (setId: string, setName: string) => {
    if (!user || !confirm(`Bạn có chắc chắn muốn xóa bộ từ "${setName}"?`)) return
    setIsLoading(true)
    try {
      await deleteVocabularySet(user.id, setId)
      setVocabularySets(prev => prev.filter(s => s.id !== setId))
      if (selectedSet?.id === setId) {
        setSelectedSet(null)
        setVocabularyWords([])
      }
      toast({ title: 'Thành công!', description: `Đã xóa bộ từ "${setName}".` })
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể xóa bộ từ.', variant: 'destructive' })
    } finally { setIsLoading(false) }
  }, [user, selectedSet, toast])

  // CRUD words
  const addWord = useCallback(async (kanji: string, kana: string, meaning: string, notes: string) => {
    if (!user || !selectedSet || !kanji.trim() || !meaning.trim()) return
    setIsLoading(true)
    try {
      const word: Omit<VocabularyWord, 'id' | 'difficulty'> = { kanji: kanji.trim(), kana: kana.trim(), meaning: meaning.trim(), notes: notes.trim() }
      const addedWord = await addVocabularyWord(user.id, selectedSet.id, word)
      setVocabularyWords(prev => [addedWord, ...prev])
      setVocabularySets(prev => prev.map(s => s.id === selectedSet.id ? { ...s, totalWords: (s.totalWords || 0) + 1 } : s))
      toast({ title: 'Thành công!', description: `Đã thêm từ: ${addedWord.kanji}` })
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể thêm từ vựng.', variant: 'destructive' })
    } finally { setIsLoading(false) }
  }, [user, selectedSet, toast])

  const updateWord = useCallback(async (wordId: string, data: Partial<VocabularyWord>) => {
    if (!user || !selectedSet) return
    setIsLoading(true)
    try {
      await updateVocabularyWord(user.id, selectedSet.id, wordId, data)
      setVocabularyWords(prev => prev.map(w => w.id === wordId ? { ...w, ...data } : w))
      toast({ title: 'Thành công!', description: `Đã cập nhật từ: ${data.kanji}` })
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật từ vựng.', variant: 'destructive' })
    } finally { setIsLoading(false) }
  }, [user, selectedSet, toast])

  const deleteWord = useCallback(async (wordId: string) => {
    if (!user || !selectedSet || !confirm('Bạn có chắc chắn muốn xóa từ vựng này?')) return
    setIsLoading(true)
    try {
      await deleteVocabularyWord(user.id, selectedSet.id, wordId)
      setVocabularyWords(prev => prev.filter(w => w.id !== wordId))
      setVocabularySets(prev => prev.map(s => s.id === selectedSet.id ? { ...s, totalWords: Math.max(0, (s.totalWords || 0) - 1) } : s))
      toast({ title: 'Thành công!', description: 'Đã xóa từ vựng.' })
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể xóa từ vựng.', variant: 'destructive' })
    } finally { setIsLoading(false) }
  }, [user, selectedSet, toast])

  const bulkImportWords = useCallback(async (bulkData: string) => {
    if (!user || !selectedSet || !bulkData.trim()) return
    const lines = bulkData.trim().split('\n').filter(l => l.trim() !== '')
    const newWords: Omit<VocabularyWord, 'id' | 'difficulty' | 'lastReviewed'>[] = lines.map(line => {
      const [kanji, kana, ...meaningParts] = line.trim().split(/\s+/)
      return { kanji, kana, meaning: meaningParts.join(' '), notes: '' }
    }).filter(w => w.kanji && w.kana && w.meaning)

    if (newWords.length === 0) {
      toast({ title: 'Lỗi định dạng', description: 'Định dạng phải là: Kanji Kana Nghĩa', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      const addedWords = await bulkAddVocabularyWords(user.id, selectedSet.id, newWords)
      setVocabularyWords(prev => [...addedWords, ...prev])
      setVocabularySets(prev => prev.map(s => s.id === selectedSet.id ? { ...s, totalWords: (s.totalWords || 0) + addedWords.length } : s))
      toast({ title: 'Thành công!', description: `Đã nhập ${addedWords.length} từ.` })
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể nhập từ số lượng lớn.', variant: 'destructive' })
    } finally { setIsLoading(false) }
  }, [user, selectedSet, toast])

  return {
    vocabularySets, selectedSet, setSelectedSet, vocabularyWords, isLoading,
    createSet, updateSet, deleteSet,
    addWord, updateWord, deleteWord, bulkImportWords
  }
}
