import { Button, Group, Menu, Stack, Text } from '@mantine/core'
import { memo, useCallback, useEffect, useMemo } from 'react'
import type { SystemSelectionPanelProps } from './types'

export const SystemSelectionPanel = memo(function SystemSelectionPanel({
  categories,
  systems,
  selectedSystem,
  selectedSystemConfig,
  onSystemSelect,
  resolveIcon,
  fallbackCategoryIcon,
  fallbackSystemIcon,
  prefixIcon: PrefixIcon,
  showGeneralOption = false,
}: SystemSelectionPanelProps) {
  const menuItemHoverClass = useMemo(() => 'system-selection-panel__item', [])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const styleId = `${menuItemHoverClass}-styles`
    if (document.getElementById(styleId)) {
      return
    }

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .${menuItemHoverClass}[data-hovered] {
        background-color: rgba(11, 95, 255, 0.08);
      }
    `
    document.head.appendChild(style)
  }, [menuItemHoverClass])

  const selectedSystemLabel = useMemo(() => {
    if (!selectedSystem) {
      return null
    }
    return systems[selectedSystem]?.label ?? selectedSystem
  }, [selectedSystem, systems])

  const handleGeneralSelect = useCallback(() => onSystemSelect('general'), [onSystemSelect])

  const renderSystemItem = useCallback(
    (systemId: string) => {
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
          className={menuItemHoverClass}
        >
          {system.label}
        </Menu.Item>
      )
    },
    [fallbackSystemIcon, menuItemHoverClass, onSystemSelect, resolveIcon, systems]
  )

  return (
    <Group align='flex-start' justify='space-between' gap='xl' wrap='nowrap'>
      <Stack gap='xs' style={{ flex: 1 }}>
        <Text size='sm' c='dimmed'>
          {selectedSystemConfig ? selectedSystemConfig.description : 'בחר מערכת כדי להמשיך'}
        </Text>
      </Stack>

      <Stack gap='md' w={240}>
        <Stack gap='xs'>
          {showGeneralOption && (
            <Button
              variant='outline'
              color='black'
              radius='md'
              onClick={handleGeneralSelect}
              styles={(theme) => ({
                root: {
                  borderColor: 'rgba(11, 95, 255,0.5)',
                  fontWeight: 600,
                  gap: theme.spacing.md,
                  justifyContent: 'center',
                },
                section: { alignItems: 'center', marginInlineStart: 0 },
                label: {
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: theme.spacing.xs,
                },
              })}
            >
              <Text component='span'>כללי</Text>
            </Button>
          )}
          {categories.map((category) => {
            const CategoryIcon = resolveIcon(category.icon) ?? fallbackCategoryIcon
            return (
              <Menu key={category.id} trigger='hover' position='left-start' withinPortal offset={8}>
                <Menu.Target>
                  <Button
                    variant='outline'
                    color='black'
                    radius='md'
                    leftSection={<PrefixIcon size={16} color='rgb(11, 95, 255)' />}
                    styles={(theme) => ({
                      root: {
                        borderColor: 'rgba(11, 95, 255,0.5)',
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
                <Menu.Dropdown style={{ overflow: 'hidden' }}>
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
                        <Menu.Item
                          leftSection={<PrefixIcon size={14} color='rgb(11, 95, 255,0.5)' />}
                          className={menuItemHoverClass}
                        >
                          {submenu.label}
                        </Menu.Item>
                      </Menu.Target>
                      <Menu.Dropdown style={{ overflow: 'hidden' }}>
                        {submenu.systemIds.map((systemId) => renderSystemItem(systemId))}
                      </Menu.Dropdown>
                    </Menu>
                  ))}
                </Menu.Dropdown>
              </Menu>
            )
          })}
        </Stack>

        {selectedSystemLabel && (
          <Text size='sm' dir='rtl' fw={600} c='rgb(11, 95, 255)'>
            יישות נבחרת: {selectedSystemLabel}
          </Text>
        )}
      </Stack>
    </Group>
  )
})

SystemSelectionPanel.displayName = 'SystemSelectionPanel'
