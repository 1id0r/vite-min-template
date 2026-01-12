import { Button, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
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
    <Space direction='vertical' size='large' style={{ width: '100%', direction: 'rtl' }}>
      {/* List of Cards */}
      <Space direction='vertical' size='middle' style={{ width: '100%' }}>
        {attachments.map((attachment) => (
          <BindingCard
            key={attachment.id}
            attachment={attachment}
            onChange={handleUpdate}
            onDelete={() => handleDelete(attachment.id)}
          />
        ))}
      </Space>

      {/* Add Button */}
      <Button onClick={handleAdd} icon={<PlusOutlined />} style={{ alignSelf: 'flex-end' }}>
        הצמדה חדשה
      </Button>
    </Space>
  )
}
