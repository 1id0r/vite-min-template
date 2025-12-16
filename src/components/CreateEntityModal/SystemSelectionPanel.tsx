import { Box, Card, Grid, NavLink, ScrollArea, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core'
import { memo, useCallback, useMemo, useState } from 'react'
import type { SystemSelectionPanelProps } from './types'

export const SystemSelectionPanel = memo(function SystemSelectionPanel({
  categories,
  systems,
  selectedSystem,
  onSystemSelect,
  resolveIcon,
  fallbackCategoryIcon,
  fallbackSystemIcon,
  prefixIcon: PrefixIcon,
  showGeneralOption = false,
}: SystemSelectionPanelProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    showGeneralOption ? 'general' : categories[0]?.id ?? null
  )

  const handleCategorySelect = (id: string) => {
    setActiveCategoryId(id)
  }

  const activeCategory = useMemo(() => {
    if (activeCategoryId === 'general') return null
    return categories.find((c) => c.id === activeCategoryId)
  }, [activeCategoryId, categories])

  const renderSystemCard = useCallback(
    (systemId: string) => {
      const system = systems[systemId]
      if (!system) return null

      const SystemIcon = resolveIcon(system.icon) ?? fallbackSystemIcon
      const isSelected = selectedSystem === systemId

      return (
        <Card
          key={systemId}
          withBorder
          shadow='sm'
          padding='xs'
          radius='md'
          component='button'
          onClick={() => onSystemSelect(systemId)}
          style={{
            cursor: 'pointer',
            border: isSelected ? '2px solid #0B5FFF' : undefined,
            backgroundColor: isSelected ? 'rgba(11, 95, 255, 0.04)' : undefined,
            textAlign: 'center',
            aspectRatio: '1 / 1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 12px -3px rgba(0, 0, 0, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
        >
          <ThemeIcon size='md' radius='md' variant={isSelected ? 'filled' : 'light'} color='blue'>
            <SystemIcon size={18} />
          </ThemeIcon>

          <Text fw={500} size='xs' mt='xs' lineClamp={2}>
            {system.label}
          </Text>
        </Card>
      )
    },
    [systems, selectedSystem, onSystemSelect, resolveIcon, fallbackSystemIcon]
  )

  return (
    <Grid gutter='xl' style={{ height: 500 }}>
      {/* Sidebar - Categories */}
      <Grid.Col span={3} style={{ borderRight: '1px solid var(--mantine-color-gray-3)' }}>
        <Stack gap='xs' h='100%'>
          <ScrollArea type='auto' offsetScrollbars>
            <Stack gap={4}>
              {showGeneralOption && (
                <NavLink
                  label='כללי'
                  active={activeCategoryId === 'general'}
                  onClick={() => {
                    handleCategorySelect('general')
                    onSystemSelect('general')
                  }}
                  variant='light'
                  color='blue'
                  leftSection={<PrefixIcon size={16} />}
                  style={{ borderRadius: 8 }}
                />
              )}

              {categories.map((category) => {
                const CategoryIcon = resolveIcon(category.icon) ?? fallbackCategoryIcon
                return (
                  <NavLink
                    key={category.id}
                    label={category.label}
                    active={activeCategoryId === category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    variant='light'
                    color='blue'
                    leftSection={<CategoryIcon size={16} />}
                    style={{ borderRadius: 8, fontWeight: 500 }}
                  />
                )
              })}
            </Stack>
          </ScrollArea>
        </Stack>
      </Grid.Col>

      {/* Main Content - Grid */}
      <Grid.Col span={9}>
        <Stack h='100%'>
          <ScrollArea type='auto' flex={1} offsetScrollbars>
            {activeCategoryId === 'general' ? (
              <Text c='dimmed' fs='italic'>
                תצורה כללית נבחרה. לחץ על "הבא" להמשך.
              </Text>
            ) : (
              <Stack gap='xl'>
                {/* Direct Systems */}
                {activeCategory?.systemIds && activeCategory.systemIds.length > 0 && (
                  <SimpleGrid cols={{ base: 3, sm: 4, lg: 5 }} spacing='xs'>
                    {activeCategory.systemIds.map(renderSystemCard)}
                  </SimpleGrid>
                )}

                {/* Sub Menus */}
                {activeCategory?.subMenus?.map((submenu) => (
                  <Box key={submenu.label}>
                    <Text
                      fw={600}
                      size='sm'
                      c='dimmed'
                      mb='md'
                      style={{ borderBottom: '1px solid #eee', paddingBottom: 4 }}
                    >
                      {submenu.label}
                    </Text>
                    <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing='sm'>
                      {submenu.systemIds.map(renderSystemCard)}
                    </SimpleGrid>
                  </Box>
                ))}
              </Stack>
            )}
          </ScrollArea>
        </Stack>
      </Grid.Col>
    </Grid>
  )
})

SystemSelectionPanel.displayName = 'SystemSelectionPanel'
