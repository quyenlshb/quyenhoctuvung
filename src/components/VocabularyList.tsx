import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { EditWordDialog } from './EditWordDialog'
import { Trash2 } from 'lucide-react'

export function VocabularyList({ words, onEdit, onDelete, isEditOpen, setEditOpen, editingWord, isLoading }: any) {
  return (
    <div className="grid gap-2">
      {words.map((word: any) => (
        <Card key={word.id}>
          <CardContent className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">{word.kanji} {word.kana && `(${word.kana})`}</p>
              <p className="text-sm text-muted-foreground">{word.meaning}</p>
              {word.notes && <p className="text-xs italic">{word.notes}</p>}
            </div>
            <div className="flex gap-2">
              <EditWordDialog word={word} isOpen={isEditOpen && editingWord?.id === word.id} onOpenChange={setEditOpen} onUpdate={onEdit} isLoading={isLoading} />
              <Button size="sm" variant="destructive" onClick={() => onDelete(word.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
