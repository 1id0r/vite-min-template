/**
 * CategorySystemSelector - Two-Select System Picker
 *
 * Replaces the grid-based category/system selection with two dropdowns:
 * 1. Category select
 * 2. Entity select (filtered by selected category)
 */

import { memo, useMemo } from 'react'
import { Select, Stack } from '@mantine/core'
import type { CategoryDefinition, SystemDefinition } from '../../../types/entity'

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
    <Stack gap='sm'>
      <Select
        label='עולם מוצרים'
        placeholder='בחר קטגוריה'
        data={categoryOptions}
        value={selectedCategory}
        onChange={handleCategoryChange}
        clearable
        dir='rtl'
        styles={{ label: { fontWeight: 600 } }}
      />
      <Select
        label='סוג מוצר'
        placeholder='בחר יישות'
        data={entityOptions}
        value={selectedSystem}
        onChange={onSystemChange}
        disabled={!selectedCategory}
        clearable
        dir='rtl'
        styles={{ label: { fontWeight: 600 } }}
      />
    </Stack>
  )
})

CategorySystemSelector.displayName = 'CategorySystemSelector'
