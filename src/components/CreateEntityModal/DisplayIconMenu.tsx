import { Box, ScrollArea, SegmentedControl, SimpleGrid, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core'
import type { IconType } from 'react-icons'
import type { SystemDefinition } from '../../types/entity'
import type { FlowId, FlowOption } from './types'
import { resolveIcon } from './iconRegistry'

interface DisplayIconMenuProps {
  systems: Record<string, SystemDefinition>
  allowedSystemIds: string[]
  selectedSystem: string | null
  onSystemSelect: (systemId: string) => void
  onIconSelect?: (systemId: string, iconName?: string) => void
  flowOptions: FlowOption[]
  activeFlow: FlowId
  onFlowChange: (value: string) => void
  flowDescription?: string
  fallbackSystemIcon: IconType
}

export function DisplayIconMenu({
  systems,
  allowedSystemIds,
  selectedSystem,
  onSystemSelect,
  onIconSelect,
  flowOptions,
  activeFlow,
  onFlowChange,
  flowDescription,
  fallbackSystemIcon,
}: DisplayIconMenuProps) {
  const visibleSystems = allowedSystemIds
    .map((id) => systems[id])
    .filter((system): system is SystemDefinition => Boolean(system))

  return (
    <Stack gap='md' style={{ flex: 1 }} align='flex-end'>
      <Stack gap={4} align='flex-end' w='100%'>
        <SegmentedControl
          value={activeFlow}
          onChange={onFlowChange}
          data={flowOptions}
          radius='md'
          styles={{
            root: {
              alignSelf: 'flex-end',
              padding: '3px',
              border: '1px solid #e5e7eb',
            },
            indicator: {
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            },
            label: {
              padding: '6px 14px',
              fontSize: '15px',
            },
          }}
        />
        {flowDescription && (
          <Text size='xs' c='dimmed' ta='right'>
            {flowDescription}
          </Text>
        )}
      </Stack>

      {visibleSystems.length === 0 ? (
        <Box w='100%' style={{ textAlign: 'right' }}>
          <Text size='sm' c='dimmed'>
            No display templates configured yet.
          </Text>
        </Box>
      ) : (
        <ScrollArea style={{ flex: 1, width: '100%' }}>
          <SimpleGrid
            cols={{ base: 3, sm: 4, md: 6 }}
            spacing={10}
            verticalSpacing={10}
            py='xs'
            style={{
              marginLeft: 'auto',
              width: 'min(100%, 520px)',
              justifyItems: 'center',
            }}
          >
            {visibleSystems.map((system) => {
              const Icon = resolveIcon(system.icon) ?? fallbackSystemIcon
              const isSelected = selectedSystem === system.id
              const iconName = system.icon

              return (
                <Tooltip
                  key={system.id}
                  label={system.label}
                  position='top'
                  transitionProps={{ duration: 150 }}
                  withArrow
                >
                  <UnstyledButton
                    aria-label={system.label}
                    onClick={() => {
                      if (onIconSelect) {
                        onIconSelect(system.id, iconName)
                      } else {
                        onSystemSelect(system.id)
                      }
                    }}
                    style={(theme) => ({
                      borderRadius: 8,
                      border: `1px solid ${isSelected ? theme.colors.blue[5] : theme.colors.gray[3]}`,
                      padding: theme.spacing.xs,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      maxWidth: 64,
                      minHeight: 64,
                      aspectRatio: '1 / 1',
                      margin: '0 auto',
                      transition: 'border-color 120ms ease, box-shadow 120ms ease',
                      boxShadow: isSelected ? `0 0 0 1px ${theme.colors.blue[1]}` : undefined,
                      backgroundColor: isSelected ? theme.colors.blue[0] : theme.white,
                    })}
                  >
                    <Icon size={22} />
                  </UnstyledButton>
                </Tooltip>
              )
            })}
          </SimpleGrid>
        </ScrollArea>
      )}
    </Stack>
  )
}
