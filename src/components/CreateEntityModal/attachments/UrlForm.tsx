import { NumberInput, Stack, Text, TextInput } from '@mantine/core'
import type { UrlAttachment } from '../../../types/entity'

interface UrlFormProps {
  attachment: UrlAttachment
  onUpdate: (id: string, field: string, value: any) => void
}

export function UrlForm({ attachment, onUpdate }: UrlFormProps) {
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
