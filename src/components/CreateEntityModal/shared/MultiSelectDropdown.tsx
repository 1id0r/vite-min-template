import { useRef } from 'react'
import { Select, Checkbox } from 'antd'

interface MultiSelectDropdownProps {
  value: string[]
  onChange: (value: string[]) => void
  options: { label: string; value: string }[]
  placeholder?: string
  width?: string | number
}

/**
 * Reusable multi-select dropdown with checkbox indicators.
 * Refocuses the Select after onChange to prevent newly rendered
 * elements (e.g. form fields from useFieldArray) from stealing focus.
 */
export const MultiSelectDropdown = ({
  value,
  onChange,
  options,
  placeholder = 'בחר אפשרויות',
  width = '100%',
}: MultiSelectDropdownProps) => {
  const selectRef = useRef<any>(null)

  const handleChange = (selectedValues: string[]) => {
    onChange(selectedValues)
    // Refocus after form mutations to prevent new DOM elements from stealing focus
    requestAnimationFrame(() => {
      selectRef.current?.focus()
    })
  }

  return (
    <Select
      ref={selectRef}
      mode='multiple'
      placeholder={placeholder}
      style={{ width }}
      options={options}
      value={value}
      onChange={handleChange}
      showSearch
      filterOption={(input, opt) => (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())}
      maxTagCount='responsive'
      menuItemSelectedIcon={null}
      optionRender={(option) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Checkbox checked={value.includes(option.value as string)} />
          <span>{option.label}</span>
        </div>
      )}
    />
  )
}
