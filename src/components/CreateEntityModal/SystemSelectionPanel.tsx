import { Button, Group, Menu, Stack, Text } from '@mantine/core'
import type { SystemSelectionPanelProps } from './types'

export function SystemSelectionPanel({
  categories,
  systems,
  selectedSystem,
  selectedSystemConfig,
  onSystemSelect,
  resolveIcon,
  fallbackCategoryIcon,
  fallbackSystemIcon,
  prefixIcon: PrefixIcon,
}: SystemSelectionPanelProps) {
  const selectedSystemLabel = selectedSystem ? systems[selectedSystem]?.label ?? selectedSystem : null

  return (
    <Group align='flex-start' justify='space-between' gap='xl' wrap='nowrap'>
      <Stack gap='xs' style={{ flex: 1 }}>
        <Text size='sm' c='dimmed'>
          {selectedSystemConfig ? selectedSystemConfig.description : 'בחר מערכת כדי להמשיך'}
        </Text>
      </Stack>

      <Stack gap='md' w={240}>
        <Stack gap='xs'>
          {categories.map((category) => {
            const CategoryIcon = resolveIcon(category.icon) ?? fallbackCategoryIcon

            const renderSystemItem = (systemId: string) => {
              const system = systems[systemId]
              if (!system) {
                return null
              }
              const SystemIcon = resolveIcon(system.icon) ?? fallbackSystemIcon
              return (
                <Menu.Item
                  key={systemId}
                  onClick={() => onSystemSelect(systemId)}
                  leftSection={<SystemIcon size={16} />}
                >
                  {system.label}
                </Menu.Item>
              )
            }

            return (
              <Menu key={category.id} trigger='hover' position='left-start' withinPortal offset={8}>
                <Menu.Target>
                  <Button
                    variant='outline'
                    color='black'
                    radius='md'
                    leftSection={<PrefixIcon size={16} />}
                    styles={(theme) => ({
                      root: {
                        borderColor: theme.colors.blue[3],
                        fontWeight: 500,
                        gap: theme.spacing.md,
                      },
                      section: {
                        alignItems: 'center',
                      },
                      label: {
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                      },
                    })}
                  >
                    <Text component='span'>{category.label}</Text>
                    <CategoryIcon size={18} />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {category.systemIds.map((systemId) => renderSystemItem(systemId))}
                  {category.subMenus?.map((submenu) => (
                    <Menu
                      key={`${category.id}-${submenu.label}`}
                      trigger='hover'
                      position='left-start'
                      withinPortal
                      offset={4}
                    >
                      <Menu.Target>
                        <Menu.Item leftSection={<PrefixIcon size={14} />}>{submenu.label}</Menu.Item>
                      </Menu.Target>
                      <Menu.Dropdown>{submenu.systemIds.map((systemId) => renderSystemItem(systemId))}</Menu.Dropdown>
                    </Menu>
                  ))}
                </Menu.Dropdown>
              </Menu>
            )
          })}
        </Stack>

        {selectedSystemLabel && (
          <Text size='sm' fw={600} c='blue.7'>
            Selected entity: {selectedSystemLabel}
          </Text>
        )}
      </Stack>
    </Group>
  )
}
