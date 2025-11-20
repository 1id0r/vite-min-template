import { Box, ScrollArea, SimpleGrid, Stack, Text, UnstyledButton } from '@mantine/core'
import type { IconType } from 'react-icons'
import type { SystemDefinition } from '../../types/entity'
import { resolveIcon } from './iconRegistry'

interface DisplayIconMenuProps {
  systems: Record<string, SystemDefinition>
  allowedSystemIds: string[]
  selectedSystem: string | null
  selectedIconId?: string | null
  onSystemSelect?: (systemId: string) => void
  onIconSelect?: (systemId: string, iconName?: string) => void
  fallbackSystemIcon: IconType
}

export function DisplayIconMenu({
  systems,
  allowedSystemIds,
  selectedSystem,
  selectedIconId,
  onSystemSelect,
  onIconSelect,
  fallbackSystemIcon,
}: DisplayIconMenuProps) {
  const visibleSystems = allowedSystemIds
    .map((id) => systems[id])
    .filter((system): system is SystemDefinition => Boolean(system))

  return (
    <Stack gap='md' style={{ flex: 1 }} align='flex-end'>
      {visibleSystems.length === 0 ? (
        <Box w='100%' style={{ textAlign: 'right' }}>
          <Text size='sm' c='dimmed'>
            No display templates configured yet.
          </Text>
        </Box>
      ) : (
        <Box
          w='100%'
          style={{
            border: '1px solid rgb(11, 95, 255)',
            borderRadius: 16,
            padding: '12px 16px',
          }}
        >
          <ScrollArea style={{ width: '100%' }}>
            <SimpleGrid
              cols={{ base: 5, sm: 6, md: 7 }}
              spacing={12}
              verticalSpacing={12}
              style={{
                marginLeft: 'auto',
                borderColor: 'rgb(11, 95, 255)',
                // width: 'min(100%, 520px)',
                justifyItems: 'center',
              }}
            >
              {visibleSystems.map((system) => {
                const Icon = resolveIcon(system.icon) ?? fallbackSystemIcon
                const isSelected = (selectedIconId ?? selectedSystem) === system.id
                const iconName = system.icon

                return (
                  <UnstyledButton
                    key={system.id}
                    aria-label={system.label}
                    onClick={() => {
                      if (onIconSelect) {
                        onIconSelect(system.id, iconName)
                      } else {
                        onSystemSelect?.(system.id)
                      }
                    }}
                    title={system.label}
                    style={(theme) => ({
                      borderRadius: 8,
                      border: `1px solid ${isSelected ? 'rgba(11, 95, 255, 0.3)' : 'rgb(11, 95, 255,0.3)'}`,
                      padding: theme.spacing.xs,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      maxWidth: 64,
                      minHeight: 64,
                      aspectRatio: '1 / 1',
                      margin: '0 auto',

                      boxShadow: isSelected ? `0 0 0 1px rgba(11, 95, 255, 0.18)` : undefined,
                      backgroundColor: isSelected ? 'rgba(11, 95, 255, 0.08)' : theme.white,
                    })}
                  >
                    <Icon size={22} />
                  </UnstyledButton>
                )
              })}
            </SimpleGrid>
          </ScrollArea>
        </Box>
      )}
    </Stack>
  )
}
