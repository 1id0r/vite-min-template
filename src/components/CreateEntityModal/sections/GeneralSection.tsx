/**
 * GeneralSection - Entity General Details
 *
 * Form section for entity name, description, contact info, and links.
 * Always visible after system selection.
 */

import { memo } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Stack, TextInput, Textarea, Group, ActionIcon, Box, Text, Divider, Grid } from '@mantine/core'
import { IconPlus, IconX } from '@tabler/icons-react'
import type { EntityFormData } from '../hooks/useEntityForm'

interface GeneralSectionProps {
  /** Whether to show in compact mode */
  compact?: boolean
}

export const GeneralSection = memo(function GeneralSection({ compact }: GeneralSectionProps) {
  const {
    register,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useFormContext<EntityFormData>()

  const links = watch('links') || []

  const handleAddLink = () => {
    setValue('links', [...links, { label: '', url: '' }])
  }

  const handleRemoveLink = (index: number) => {
    setValue(
      'links',
      links.filter((_, i) => i !== index)
    )
  }

  return (
    <Box>
      <Text size='sm' fw={700} c='gray.8' mb='xs' dir='rtl'>
        פרטים כלליים
      </Text>
      <Stack gap={compact ? 'xs' : 'sm'}>
        {/* Display Name and Entity Type - side by side */}
        <Grid gutter='md'>
          <Grid.Col span={6}>
            <TextInput
              label='שם תצוגה'
              placeholder='הזן שם תצוגה'
              required
              dir='rtl'
              error={errors.displayName?.message}
              {...register('displayName')}
              styles={{ label: { fontWeight: 600 } }}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Controller
              name='entityType'
              control={control}
              render={({ field }) => (
                <TextInput
                  label='סוג יישות'
                  dir='rtl'
                  disabled
                  value={field.value || ''}
                  styles={{ label: { fontWeight: 600 } }}
                />
              )}
            />
          </Grid.Col>
        </Grid>

        {/* Description */}
        <Textarea
          label='תיאור'
          placeholder='הזן תיאור'
          required
          dir='rtl'
          minRows={2}
          error={errors.description?.message}
          {...register('description')}
          styles={{ label: { fontWeight: 600 } }}
        />

        {/* Contact Info and Responsible Party - side by side */}
        <Grid gutter='md'>
          <Grid.Col span={6}>
            <TextInput
              label='פרטי התקשרות'
              placeholder='מספר טלפון'
              dir='rtl'
              error={errors.contactInfo?.message}
              {...register('contactInfo')}
              styles={{ label: { fontWeight: 600 } }}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label='גורם אחראי'
              placeholder='שם או תפקיד'
              dir='rtl'
              error={errors.responsibleParty?.message}
              {...register('responsibleParty')}
              styles={{ label: { fontWeight: 600 } }}
            />
          </Grid.Col>
        </Grid>

        {/* Links Section */}
        <Box>
          <Group justify='space-between' mb='xs'>
            <Text size='sm' fw={600} c='gray.7'>
              לינקים
            </Text>
            <ActionIcon variant='light' color='blue' size='sm' onClick={handleAddLink}>
              <IconPlus size={14} />
            </ActionIcon>
          </Group>

          <Stack gap='xs'>
            {links.map((_, index) => (
              <Group key={index} gap='xs' align='flex-start'>
                <TextInput placeholder='שם הלינק' dir='rtl' style={{ flex: 1 }} {...register(`links.${index}.label`)} />
                <TextInput placeholder='כתובת URL' dir='ltr' style={{ flex: 2 }} {...register(`links.${index}.url`)} />
                <ActionIcon variant='subtle' color='red' onClick={() => handleRemoveLink(index)}>
                  <IconX size={14} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        </Box>
      </Stack>
      <Divider my='md' />
    </Box>
  )
})

GeneralSection.displayName = 'GeneralSection'
