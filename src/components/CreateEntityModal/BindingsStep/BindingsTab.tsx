import { Button, Stack } from '@mantine/core'
import { BsPlus } from 'react-icons/bs'
import type { Attachment, UrlAttachment } from '../../../types/entity'
import { BindingCard } from './BindingCard'

// Simple ID generator to avoid dependency
const generateId = () => Math.random().toString(36).substring(2, 9)

interface BindingsTabProps {
  attachments: Attachment[]
  onChange: (attachments: Attachment[]) => void
}

export function BindingsTab({ attachments, onChange }: BindingsTabProps) {
  const handleAdd = () => {
    const newAttachment: UrlAttachment = {
      type: 'url',
      id: generateId(),
      name: '',
      address: '',
      timeout: '30s',
    }
    onChange([...attachments, newAttachment])
  }

  const handleUpdate = (updated: Attachment) => {
    onChange(attachments.map((a) => (a.id === updated.id ? updated : a)))
  }

  const handleDelete = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id))
  }

  return (
    <Stack gap='lg' style={{ direction: 'rtl' }}>
      {/* List of Cards */}
      <Stack gap='md'>
        {attachments.map((attachment) => (
          <BindingCard
            key={attachment.id}
            attachment={attachment}
            onChange={handleUpdate}
            onDelete={() => handleDelete(attachment.id)}
          />
        ))}
      </Stack>

      {/* Add Button */}
      <Button
        variant='outline'
        onClick={handleAdd}
        rightSection={<BsPlus size={20} />}
        style={{ alignSelf: 'flex-end' }}
      >
        הצמדה חדשה{' '}
      </Button>
    </Stack>
  )
}
