import { ActionIcon, Button, Group, Paper, Stack, Text, TextInput } from '@mantine/core'
import { FiPlus, FiTrash2 } from 'react-icons/fi'

interface Link {
  label?: string
  url?: string
}

interface LinksFieldProps {
  value: Link[]
  onChange: (value: Link[]) => void
  error?: string
}

export function LinksField({ value = [], onChange, error }: LinksFieldProps) {
  const handleAdd = () => {
    onChange([...value, { label: '', url: '' }])
  }

  const handleRemove = (index: number) => {
    const newValue = value.filter((_, i) => i !== index)
    onChange(newValue)
  }

  const handleChange = (index: number, field: 'label' | 'url', newValue: string) => {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: newValue }
    onChange(updated)
  }

  return (
    <Stack gap='sm'>
      {value.length > 0 && (
        <Stack gap='xs'>
          {value.map((link, index) => (
            <Paper key={index} p='sm' withBorder>
              <Group align='flex-start' gap='xs'>
                <TextInput
                  placeholder='שם תצוגה ללינק'
                  value={link.label ?? ''}
                  onChange={(e) => handleChange(index, 'label', e.currentTarget.value)}
                  style={{ flex: 1 }}
                />
                <TextInput
                  placeholder='לינק'
                  value={link.url ?? ''}
                  onChange={(e) => handleChange(index, 'url', e.currentTarget.value)}
                  style={{ flex: 1 }}
                  type='url'
                />
                <ActionIcon color='red' variant='subtle' onClick={() => handleRemove(index)} size='lg' mt={2}>
                  <FiTrash2 size={18} />
                </ActionIcon>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
      <Button
        variant='light'
        leftSection={<FiPlus size={16} />}
        onClick={handleAdd}
        size='sm'
        style={{ alignSelf: 'flex-start' }}
      >
        הוסף לינק
      </Button>
      {error && (
        <Text size='xs' c='red'>
          {error}
        </Text>
      )}
    </Stack>
  )
}
