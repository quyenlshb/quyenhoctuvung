import { Button } from './ui/button'
import { Input } from './ui/input'

export function AddWordForm({ kanji, kana, meaning, notes, setKanji, setKana, setMeaning, setNotes, onSubmit, isLoading }: any) {
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-2">
      <Input placeholder="Kanji" value={kanji} onChange={e => setKanji(e.target.value)} />
      <Input placeholder="Kana" value={kana} onChange={e => setKana(e.target.value)} />
      <Input placeholder="Nghĩa" value={meaning} onChange={e => setMeaning(e.target.value)} />
      <Input placeholder="Ghi chú" value={notes} onChange={e => setNotes(e.target.value)} />
      <Button type="submit" className="md:col-span-4" disabled={isLoading}>+ Thêm từ</Button>
    </form>
  )
}
