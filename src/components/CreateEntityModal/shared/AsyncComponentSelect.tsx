/**
 * AsyncComponentSelect - Searchable select for component selection
 *
 * Fetches components from API or uses mock data in dev mode.
 * Used by the custom rule's "שם רכיב" static mode.
 */

import { Select } from 'antd'
import { useState, useEffect } from 'react'
import { fetchComponents } from '../../../api/client'

interface AsyncComponentSelectProps {
  value?: string
  onChange?: (value: string) => void
}

export const AsyncComponentSelect = ({ value, onChange }: AsyncComponentSelectProps) => {
  const [components, setComponents] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadComponents()
  }, [])

  const loadComponents = async () => {
    setLoading(true)
    try {
      const data = await fetchComponents()
      setComponents(data)
    } catch (error) {
      console.error('Failed to load components:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select
      showSearch
      value={value}
      onChange={onChange}
      placeholder='בחר רכיב'
      loading={loading}
      options={components.map((c) => ({ label: c, value: c }))}
      filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
      style={{ width: '100%' }}
    />
  )
}
