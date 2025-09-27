import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Badge } from './ui/badge'
import { useVocabularyManager } from '../hooks/useVocabularyManager'
import { CreateSetDialog } from './CreateSetDialog'
import { AddWordForm } from './AddWordForm'
import { BulkImportDialog } from './BulkImportDialog'
import { VocabularyList } from './VocabularyList'
import { EditSetForm } from './EditSetForm'

export default function VocabularyManager() {
  const { vocabularySets, selectedSet, setSelectedSet, vocabularyWords, isLoading } = useVocabularyManager()
  const [isCreateSetOpen, setIsCreateSetOpen] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [isEditWordOpen, setIsEditWordOpen] = useState(false)
  const [editingWord, setEditingWord] = useState(null)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Từ vựng</CardTitle>
          <CardDescription>Tạo và quản lý bộ từ vựng của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <Tabs value={selectedSet?.id || ''} onValueChange={(val) => {}}>
            <TabsList>
              {vocabularySets.map(set => (
                <TabsTrigger key={set.id} value={set.id}>
                  {set.name} <Badge variant="secondary" className="ml-2">{set.totalWords || 0}</Badge>
                </TabsTrigger>
              ))}
              <CreateSetDialog isOpen={isCreateSetOpen} setIsOpen={setIsCreateSetOpen} onCreate={() => {}} isLoading={isLoading} />
            </TabsList>

            {vocabularySets.map(set => (
              <TabsContent key={set.id} value={set.id}>
                <div className="flex justify-between items-center">
                  <div><h2>{set.name}</h2><p>{set.description}</p></div>
                  <EditSetForm set={set} onUpdate={() => {}} />
                </div>

                <AddWordForm kanji="" kana="" meaning="" notes="" setKanji={() => {}} setKana={() => {}} setMeaning={() => {}} setNotes={() => {}} onSubmit={() => {}} isLoading={isLoading} />
                <BulkImportDialog isOpen={isBulkImportOpen} setIsOpen={setIsBulkImportOpen} onImport={() => {}} isLoading={isLoading} />
                <VocabularyList words={vocabularyWords} onEdit={() => {}} onDelete={() => {}} isEditOpen={isEditWordOpen} setEditOpen={setIsEditWordOpen} editingWord={editingWord} isLoading={isLoading} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
