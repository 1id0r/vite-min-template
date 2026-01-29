/**
 * AsyncClusterSelect - Searchable select for cluster selection
 *
 * Fetches clusters from API or uses mock data in dev mode.
 * Supports manual typing/searching.
 */

import { Select } from 'antd'
import { useState, useEffect } from 'react'
import { fetchClusters } from '../../../api/client'

interface AsyncClusterSelectProps {
  value?: string
  onChange?: (value: string) => void
}

export const AsyncClusterSelect = ({ value, onChange }: AsyncClusterSelectProps) => {
  const [clusters, setClusters] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadClusters()
  }, [])

  const loadClusters = async () => {
    setLoading(true)
    try {
      const data = await fetchClusters()
      setClusters(data)
    } catch (error) {
      console.error('Failed to load clusters:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select
      showSearch
      value={value}
      onChange={onChange}
      placeholder='Select or type cluster name'
      loading={loading}
      options={clusters.map((c) => ({ label: c, value: c }))}
      filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
      style={{ width: '100%' }}
    />
  )
}
