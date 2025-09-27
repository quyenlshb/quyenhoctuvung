import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import type { VocabularySet } from '../lib/firebase'

export function EditSetForm({ set, onUpdate }: { set: VocabularySet, onUpdate: (id: string, name: string, description: string) => void }) {
  const [name, setName] = useState(set.name)
  const [description, setDescription] = useState(set.description)

  return (
    <form onSubmit={(e) => { e.preventDefault(); onUpdate(set.id, name, description) }} className="space-y-4">
      <div>
        <Label htmlFor="editName">Tên bộ từ</Label>
        <Input id="editName" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="editDescription">Mô tả</Label>
        <Textarea id="editDescription" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <Button type="submit">Lưu thay đổi</Button>
    </form>
  )
}
