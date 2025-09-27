import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Edit2 } from 'lucide-react'

export function EditWordDialog({ word, isOpen, onOpenChange, onUpdate, isLoading }: any) {
  const [kanji, setKanji] = useState(word.kanji)
  const [kana, setKana] = useState(word.kana)
  const [meaning, setMeaning] = useState(word.meaning)
  const [notes, setNotes] = useState(word.notes || '')

  useEffect(() => {
    if (isOpen) {
      setKanji(word.kanji)
      setKana(word.kana)
      setMeaning(word.meaning)
      setNotes(word.notes || '')
    }
  }, [isOpen, word])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Edit2 className="w-4 h-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Sửa từ</DialogTitle></DialogHeader>
        <form onSubmit={e => { e.preventDefault(); onUpdate({ kanji, kana, meaning, notes }) }}>
          <Input value={kanji} onChange={e => setKanji(e.target.value)} placeholder="Kanji" />
          <Input value={kana} onChange={e => setKana(e.target.value)} placeholder="Kana" />
          <Input value={meaning} onChange={e => setMeaning(e.target.value)} placeholder="Nghĩa" />
          <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ghi chú" />
          <Button type="submit" disabled={isLoading}>Lưu</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
