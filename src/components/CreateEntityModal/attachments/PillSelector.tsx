import { Box } from '@mantine/core'

interface PillSelectorProps {
  value: string
  options: { label: string; value: string; disabled?: boolean }[]
  onChange: (val: string) => void
}

export function PillSelector({ value, options, onChange }: PillSelectorProps) {
  return (
    <Box
      dir='rtl'
      style={{
        display: 'flex',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        width: 'fit-content',
      }}
    >
      {options.map((option, index) => {
        const isActive = option.value === value
        const isLast = index === options.length - 1
        const isDisabled = option.disabled

        return (
          <button
            key={option.value}
            type='button'
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange(option.value)}
            style={{
              padding: '6px 16px',
              border: 'none',
              borderLeft: isLast ? 'none' : '1px solid #E5E7EB',
              backgroundColor: isActive ? '#0B5FFF' : isDisabled ? '#F3F4F6' : '#FFFFFF',
              color: isActive ? '#FFFFFF' : isDisabled ? '#9CA3AF' : '#111827',
              fontWeight: 500,
              fontSize: '14px',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {option.label}
          </button>
        )
      })}
    </Box>
  )
}
