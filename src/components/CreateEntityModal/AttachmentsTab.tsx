import { Button, Stack } from '@mantine/core'
import { useCallback } from 'react'
import { FaPlus } from 'react-icons/fa'
import type { Attachment, AttachmentList, UrlAttachment } from '../../types/entity'
import { AttachmentCard } from './attachments/AttachmentCard'

interface AttachmentsTabProps {
  attachments: AttachmentList
  onChange: (attachments: AttachmentList) => void
}

export function AttachmentsTab({ attachments = [], onChange }: AttachmentsTabProps) {
  const handleUpdate = useCallback(
    (id: string, field: keyof Attachment | string, value: any) => {
      const newAttachments = attachments.map((att) => {
        if (att.id === id) {
          return { ...att, [field]: value }
        }
        return att
      }) as AttachmentList
      onChange(newAttachments)
    },
    [attachments, onChange]
  )

  const handleDelete = useCallback(
    (id: string) => {
      onChange(attachments.filter((a) => a.id !== id))
    },
    [attachments, onChange]
  )

  const handleAdd = useCallback(() => {
    const newId = crypto.randomUUID()
    const newAttachment: UrlAttachment = {
      id: newId,
      type: 'url',
      name: '',
      url: '',
      timeout: 30,
    }
    onChange([...attachments, newAttachment])
  }, [attachments, onChange])

  return (
    <Stack gap='lg' p='md'>
      {attachments.map((att) => (
        <AttachmentCard key={att.id} attachment={att} onUpdate={handleUpdate} onDelete={handleDelete} />
      ))}

      <Button
        variant='outline'
        leftSection={<FaPlus />}
        onClick={handleAdd}
        fullWidth
        h={48}
        style={{ borderStyle: 'dashed' }}
      >
        הוסף שליפה חדשה
      </Button>
    </Stack>
  )
}
