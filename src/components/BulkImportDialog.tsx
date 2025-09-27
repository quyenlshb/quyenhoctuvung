import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Import } from 'lucide-react'

export function BulkImportDialog({ isOpen, setIsOpen, onImport, isLoading }: any) {
  const [bulkData, setBulkData] = useState('')
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Import className="w-4 h-4 mr-1" /> Nhập nhiều từ
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nhập từ số lượng lớn</DialogTitle>
          <DialogDescription>Mỗi dòng: Kanji Kana Nghĩa[,Ghi chú]</DialogDescription>
        </DialogHeader>
        <form onSubmit={e => { e.preventDefault(); onImport(bulkData); setBulkData('') }} className="space-y-4">
          <Textarea rows={10} value={bulkData} onChange={e => setBulkData(e.target.value)} />
          <Button type="submit" disabled={isLoading}>Nhập</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
