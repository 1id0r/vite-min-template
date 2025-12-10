import { useEffect, useState } from 'react'
import { Loader, Select } from '@mantine/core'
import { request } from '../../api/client'

interface AsyncSelectFieldProps {
  value?: string
  onChange: (value: string | null) => void
  label: string
  error?: string
  required?: boolean
  asyncOptions?: {
    path: string
    placeholder?: string
  }
}

export function AsyncSelectField({ value, onChange, label, error, required, asyncOptions }: AsyncSelectFieldProps) {
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<string[]>([])

  useEffect(() => {
    if (!asyncOptions?.path) return

    const loadOptions = async () => {
      setLoading(true)
      try {
        const data = await request<string[]>(asyncOptions.path)
        setOptions(data)
      } catch (err) {
        console.error('Failed to load async options:', err)
        setOptions([])
      } finally {
        setLoading(false)
      }
    }

    loadOptions()
  }, [asyncOptions?.path])

  if (loading) {
    return (
      <Select
        label={label}
        placeholder='Loading...'
        disabled
        rightSection={<Loader size='xs' />}
        data={[]}
        withAsterisk={required}
      />
    )
  }

  return (
    <Select
      value={value ?? null}
      onChange={onChange}
      label={label}
      placeholder={asyncOptions?.placeholder ?? 'Select...'}
      error={error}
      data={options}
      searchable
      withAsterisk={required}
    />
  )
}
