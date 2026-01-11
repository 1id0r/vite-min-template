/**
 * LinksSection - Dynamic Links Input
 *
 * Allows users to add multiple links with URL and display name.
 * Each link has: לינק (URL) and שם תצוגה (Display Name)
 */

import { memo } from 'react'
import { useFormContext } from 'react-hook-form'
import { Stack, TextInput, Group, ActionIcon, Box, Button } from '@mantine/core'
import { IconPlus, IconX } from '@tabler/icons-react'
import type { EntityFormData } from '../hooks/useEntityForm'

export const LinksSection = memo(function LinksSection() {
  const {
    register,
    formState: { errors },
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
      <Stack gap='xs'>
        {links.map((_, index) => (
          <Box key={index}>
            <Group gap='xs' align='flex-start' wrap='nowrap'>
              <TextInput
                placeholder='הזן שם לינק'
                label={index === 0 ? 'לינק' : undefined}
                dir='rtl'
                style={{ flex: 1 }}
                error={errors.links?.[index]?.url?.message}
                {...register(`links.${index}.url`)}
                styles={{ label: { fontWeight: 600 } }}
              />
              <ActionIcon
                variant='subtle'
                color='red'
                onClick={() => handleRemoveLink(index)}
                mt={index === 0 ? 24 : 0}
              >
                <IconX size={14} />
              </ActionIcon>
            </Group>
            <TextInput
              placeholder='הזן שם תצוגה ללינק'
              label='שם תצוגה'
              dir='rtl'
              mt='xs'
              error={errors.links?.[index]?.label?.message}
              {...register(`links.${index}.label`)}
              styles={{ label: { fontWeight: 600 } }}
            />
          </Box>
        ))}

        {/* Add Link Button */}
        <Button
          variant='subtle'
          color='blue'
          size='xs'
          leftSection={<IconPlus size={14} />}
          onClick={handleAddLink}
          style={{ alignSelf: 'flex-start' }}
        >
          הוסף לינק
        </Button>
      </Stack>
    </Box>
  )
})

LinksSection.displayName = 'LinksSection'
