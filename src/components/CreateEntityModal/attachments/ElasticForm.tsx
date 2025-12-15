import { Group, Select, Stack, Text, TextInput, Textarea } from '@mantine/core'
import type { ElasticAttachment } from '../../../types/entity'
import { PillSelector } from './PillSelector'

interface ElasticFormProps {
  attachment: ElasticAttachment
  onUpdate: (id: string, field: string, value: any) => void
}

export function ElasticForm({ attachment, onUpdate }: ElasticFormProps) {
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
