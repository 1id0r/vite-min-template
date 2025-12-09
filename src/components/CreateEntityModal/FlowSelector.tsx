/**
 * FlowSelector - Flow Type Selection Toggle
 *
 * A segmented button group for selecting the entity flow type (monitor/display/general).
 */

import { memo, useCallback } from 'react'
import { Box, Stack, Text } from '@mantine/core'
import type { FlowId, FlowOption } from './types'

export interface FlowSelectorProps {
  flow: FlowId
  flowOptions: FlowOption[]
  onFlowChange: (value: string) => void
  flowDescription?: string
}

const FLOW_LABELS: Partial<Record<FlowId, string>> = {
  monitor: 'יישות מנוטרת',
  display: 'יישות תצוגה',
  general: 'ישות כללית',
}

export const FlowSelector = memo(function FlowSelector({
  flow,
  flowOptions,
  onFlowChange,
  flowDescription,
}: FlowSelectorProps) {
  const getButtonHandler = useCallback((value: string) => () => onFlowChange(value), [onFlowChange])

  return (
    <Stack gap={4} align='flex-start'>
      <Box
        style={{
          display: 'flex',
          border: '1px solid #E5E7EB',
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
        {flowOptions.map((option, index) => {
          const isActive = option.value === flow
          const isLast = index === flowOptions.length - 1
          const translatedLabel = FLOW_LABELS[option.value as FlowId] ?? option.label
          const handleClick = getButtonHandler(option.value)

          return (
            <button
              key={option.value}
              type='button'
              onClick={handleClick}
              style={{
                padding: '6px 20px',
                border: 'none',
                borderLeft: isLast ? 'none' : '1px solid #E5E7EB',
                backgroundColor: isActive ? '#0B5FFF' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#111827',
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              {translatedLabel}
            </button>
          )
        })}
      </Box>
      {flowDescription && (
        <Text size='xs' c='dimmed'>
          {flowDescription}
        </Text>
      )}
    </Stack>
  )
})

FlowSelector.displayName = 'FlowSelector'
