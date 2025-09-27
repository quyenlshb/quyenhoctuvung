import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'

export function CreateSetDialog({ isOpen, setIsOpen, onCreate, isLoading }: { isOpen: boolean, setIsOpen: (b: boolean) => void, onCreate: (name: string, desc: string) => void, isLoading: boolean }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(name, description)
    setName(''); setDescription('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">+ Bộ từ mới</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo bộ từ mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="setName">Tên bộ từ</Label>
            <Input id="setName" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="setDescription">Mô tả</Label>
            <Textarea id="setDescription" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <Button type="submit" disabled={isLoading}>Tạo</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
