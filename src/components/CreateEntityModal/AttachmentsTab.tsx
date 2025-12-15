import { useCallback } from 'react'
import {
  ActionIcon,
  Box,
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Paper,
  Center,
} from '@mantine/core'
import { FaTrash, FaPlus } from 'react-icons/fa'
import type { Attachment, AttachmentList, AttachmentType, ElasticAttachment, UrlAttachment } from '../../types/entity'

interface AttachmentsTabProps {
  attachments: AttachmentList
  onChange: (attachments: AttachmentList) => void
}

const TYPE_OPTIONS: { label: string; value: AttachmentType; disabled?: boolean }[] = [
  { label: 'URL', value: 'url' },
  { label: 'Elastic', value: 'elastic' },
  { label: 'Mongo', value: 'mongo', disabled: true },
  { label: 'SQL', value: 'sql', disabled: true },
  { label: 'Redis', value: 'redis', disabled: true },
]

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

interface AttachmentCardProps {
  attachment: Attachment
  onUpdate: (id: string, field: string, value: any) => void
  onDelete: (id: string) => void
}

function AttachmentCard({ attachment, onUpdate, onDelete }: AttachmentCardProps) {
  return (
    <Paper p='md' radius='lg' withBorder style={{ position: 'relative', overflow: 'hidden' }}>
      <Box style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
        <ActionIcon variant='subtle' color='gray' onClick={() => onDelete(attachment.id)}>
          <FaTrash size={14} />
        </ActionIcon>
      </Box>

      <Stack gap='md'>
        {/* Type Selector Pills */}
        <Group justify='flex-end'>
          <PillSelector
            value={attachment.type}
            options={TYPE_OPTIONS}
            onChange={(val) => onUpdate(attachment.id, 'type', val)}
          />
          <Text size='sm' fw={700} c='gray.7'>
            סוג שליפה{' '}
            <Text component='span' c='red'>
              *
            </Text>
          </Text>
        </Group>

        <TextInput
          label={
            <Text size='sm' fw={700} c='gray.7' mb={4}>
              שם שליפה{' '}
              <Text component='span' c='red'>
                *
              </Text>
            </Text>
          }
          placeholder='שם שליפה'
          value={attachment.name || ''}
          onChange={(e) => onUpdate(attachment.id, 'name', e.target.value)}
          dir='rtl'
        />

        {attachment.type === 'url' && <UrlForm attachment={attachment as UrlAttachment} onUpdate={onUpdate} />}

        {attachment.type === 'elastic' && (
          <ElasticForm attachment={attachment as ElasticAttachment} onUpdate={onUpdate} />
        )}

        {/* Placeholders */}
        {['mongo', 'sql', 'redis'].includes(attachment.type) && (
          <Center p='xl'>
            <Text c='dimmed'>Not implemented</Text>
          </Center>
        )}
      </Stack>
    </Paper>
  )
}

function UrlForm({ attachment, onUpdate }: { attachment: UrlAttachment; onUpdate: any }) {
  return (
    <Stack gap='md'>
      <TextInput
        label={
          <Text size='sm' fw={700} c='gray.7' mb={4}>
            כתובת URL{' '}
            <Text component='span' c='red'>
              *
            </Text>
          </Text>
        }
        placeholder='https://...'
        value={attachment.url || ''}
        onChange={(e) => onUpdate(attachment.id, 'url', e.target.value)}
        dir='rtl'
      />
      <NumberInput
        label={
          <Text size='sm' fw={700} c='gray.7' mb={4}>
            Timeout (seconds){' '}
            <Text component='span' c='red'>
              *
            </Text>
          </Text>
        }
        value={attachment.timeout}
        onChange={(val) => onUpdate(attachment.id, 'timeout', val)}
        dir='rtl'
      />
    </Stack>
  )
}

function ElasticForm({ attachment, onUpdate }: { attachment: ElasticAttachment; onUpdate: any }) {
  const timeoutOptions = [
    { label: '5 שניות', value: 5 },
    { label: '15 שניות', value: 15 },
    { label: '30 שניות', value: 30 },
  ]

  return (
    <Stack gap='md'>
      <Group grow align='flex-start'>
        <TextInput
          label={
            <Text size='sm' fw={700} c='gray.7' mb={4}>
              Index{' '}
              <Text component='span' c='red'>
                *
              </Text>
            </Text>
          }
          placeholder='Index'
          value={attachment.index || ''}
          onChange={(e) => onUpdate(attachment.id, 'index', e.target.value)}
          dir='rtl'
        />
        <Select
          label={
            <Text size='sm' fw={700} c='gray.7' mb={4}>
              Cluster{' '}
              <Text component='span' c='red'>
                *
              </Text>
            </Text>
          }
          placeholder='רשימה סגורה'
          data={['Cluster A', 'Cluster B', 'Mock Data']}
          value={attachment.cluster || ''}
          onChange={(val) => onUpdate(attachment.id, 'cluster', val)}
          dir='rtl'
        />
      </Group>

      <Group grow align='flex-start'>
        {/* Fetch Timing: Number input + Min/Hours toggle */}
        <Stack gap={0}>
          <Text size='sm' fw={700} c='gray.7' mb={4} ta='right'>
            תזמון שליפה{' '}
            <Text component='span' c='red'>
              *
            </Text>
          </Text>
          <Group gap='xs'>
            <PillSelector
              options={[
                { label: 'דקות', value: 'min' },
                { label: 'שעות', value: 'hours' },
              ]}
              value={(attachment as any).fetchTimingUnit || 'min'}
              onChange={(val) => onUpdate(attachment.id, 'fetchTimingUnit', val)}
            />
            <TextInput
              style={{ flex: 1 }}
              placeholder='3'
              value={(attachment as any).fetchTimingValue || ''}
              onChange={(e) => onUpdate(attachment.id, 'fetchTimingValue', e.target.value)}
            />
          </Group>
        </Stack>

        {/* Timeout Pills */}
        <Stack gap={0} align='flex-end'>
          <Text size='sm' fw={700} c='gray.7' mb={4}>
            Timeout{' '}
            <Text component='span' c='red'>
              *
            </Text>
          </Text>
          <PillSelector
            options={timeoutOptions.map((o) => ({ label: o.label, value: String(o.value) }))}
            value={String(attachment.timeout)}
            onChange={(val) => onUpdate(attachment.id, 'timeout', Number(val))}
          />
        </Stack>
      </Group>

      <Textarea
        label={
          <Text size='sm' fw={700} c='gray.7' mb={4}>
            JSON Query{' '}
            <Text component='span' c='red'>
              *
            </Text>
          </Text>
        }
        placeholder='{ ... }'
        minRows={4}
        value={attachment.jsonQuery || ''}
        onChange={(e) => onUpdate(attachment.id, 'jsonQuery', e.target.value)}
        dir='rtl'
      />
    </Stack>
  )
}

function PillSelector({
  value,
  options,
  onChange,
}: {
  value: string
  options: { label: string; value: string; disabled?: boolean }[]
  onChange: (val: string) => void
}) {
  return (
    <Box
      dir='rtl'
      style={{
        display: 'flex',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        width: 'fit-content',
      }}
    >
      {options.map((option, index) => {
        const isActive = option.value === value
        const isLast = index === options.length - 1
        const isDisabled = option.disabled

        return (
          <button
            key={option.value}
            type='button'
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange(option.value)}
            style={{
              padding: '6px 16px',
              border: 'none',
              borderLeft: isLast ? 'none' : '1px solid #E5E7EB',
              backgroundColor: isActive ? '#0B5FFF' : isDisabled ? '#F3F4F6' : '#FFFFFF',
              color: isActive ? '#FFFFFF' : isDisabled ? '#9CA3AF' : '#111827',
              fontWeight: 500,
              fontSize: '14px',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {option.label}
          </button>
        )
      })}
    </Box>
  )
}
