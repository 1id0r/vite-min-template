import { ActionIcon, Box, Center, Group, Paper, Stack, Text, TextInput } from '@mantine/core'
import { FaTrash } from 'react-icons/fa'
import type { Attachment, AttachmentType, ElasticAttachment, UrlAttachment } from '../../../types/entity'
import { ElasticForm } from './ElasticForm'
import { PillSelector } from './PillSelector'
import { UrlForm } from './UrlForm'

interface AttachmentCardProps {
  attachment: Attachment
  onUpdate: (id: string, field: string, value: any) => void
  onDelete: (id: string) => void
}

const TYPE_OPTIONS: { label: string; value: AttachmentType; disabled?: boolean }[] = [
  { label: 'URL', value: 'url' },
  { label: 'Elastic', value: 'elastic' },
  { label: 'Mongo', value: 'mongo', disabled: true },
  { label: 'SQL', value: 'sql', disabled: true },
  { label: 'Redis', value: 'redis', disabled: true },
]

export function AttachmentCard({ attachment, onUpdate, onDelete }: AttachmentCardProps) {
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
