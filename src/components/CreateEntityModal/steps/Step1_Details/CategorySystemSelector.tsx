/**
 * CategorySystemSelector - Two-Select System Picker
 *
 * Replaces the grid-based category/system selection with two dropdowns:
 * 1. Category select (עולם מוצרים)
 * 2. Entity select (סוג מוצר) - filtered by selected category
 */

import { memo, useMemo } from 'react'
import { Select, Space, Typography } from 'antd'
import type { CategoryDefinition, SystemDefinition } from '../../../../types/entity'

const { Text } = Typography

interface CategorySystemSelectorProps {
  categories: CategoryDefinition[]
  systems: Record<string, SystemDefinition>
  selectedCategory: string | null
  selectedSystem: string | null
  onCategoryChange: (categoryId: string | null) => void
  onSystemChange: (systemId: string | null) => void
}

export const CategorySystemSelector = memo(function CategorySystemSelector({
  categories,
  systems,
  selectedCategory,
  selectedSystem,
  onCategoryChange,
  onSystemChange,
}: CategorySystemSelectorProps) {
  // Category options
  const categoryOptions = useMemo(() => {
    return categories.map((cat) => ({
      value: cat.id,
      label: cat.label,
    }))
  }, [categories])

  // Entity options filtered by selected category
  const entityOptions = useMemo(() => {
    if (!selectedCategory) return []

    const category = categories.find((c) => c.id === selectedCategory)
    if (!category) return []

    return category.systemIds
      .map((systemId) => {
        const system = systems[systemId]
        return system ? { value: system.id, label: system.label } : null
      })
      .filter(Boolean) as { value: string; label: string }[]
  }, [selectedCategory, categories, systems])

  const handleCategoryChange = (value: string | null) => {
    onCategoryChange(value)
    // Clear system when category changes
    onSystemChange(null)
  }

  return (
    <Space direction='vertical' style={{ width: '100%', direction: 'rtl' }} size='middle'>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Text strong style={{ fontSize: 14, width: 100, marginLeft: 16 }}>
          קטגוריה
        </Text>
        <Select
          placeholder='בחר קטגוריה'
          options={categoryOptions}
          value={selectedCategory}
          onChange={handleCategoryChange}
          allowClear
          style={{ flex: 1, direction: 'rtl' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Text strong style={{ fontSize: 14, width: 100, marginLeft: 16 }}>
          סוג יישות
        </Text>
        <Select
          placeholder='בחר יישות'
          options={entityOptions}
          value={selectedSystem}
          onChange={onSystemChange}
          disabled={!selectedCategory}
          allowClear
          style={{ flex: 1, direction: 'rtl' }}
        />
      </div>
    </Space>
  )
})

CategorySystemSelector.displayName = 'CategorySystemSelector'
