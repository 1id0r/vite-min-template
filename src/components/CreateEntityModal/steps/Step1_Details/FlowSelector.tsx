/**
 * FlowSelector - Flow Type Selection Toggle
 *
 * A segmented button group for selecting the entity flow type (monitor/display/general).
 */

import { memo } from 'react'
import { Radio } from 'antd'
import type { FlowId, FlowOption } from '../../types/entityForm'

export interface FlowSelectorProps {
  flow: FlowId
  flowOptions: FlowOption[]
  onFlowChange: (value: string) => void
}

const FLOW_LABELS: Record<FlowId, string> = {
  monitor: 'יישות ניטור',
  display: 'יישות תצוגה',
}

export const FlowSelector = memo(function FlowSelector({ flow, flowOptions, onFlowChange }: FlowSelectorProps) {
  const options = flowOptions.map((option) => ({
    label: FLOW_LABELS[option.value as FlowId] ?? option.label,
    value: option.value,
  }))

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <Radio.Group
        value={flow}
        onChange={(e) => onFlowChange(e.target.value)}
        optionType='button'
        buttonStyle='outline'
        style={{ display: 'flex', direction: 'rtl' }}
      >
        {options.map((option, index) => (
          <Radio.Button
            key={option.value}
            value={option.value}
            style={{
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 16px',
              fontSize: '14px',
              borderTopRightRadius: index === 0 ? 12 : 0,
              borderBottomRightRadius: index === 0 ? 12 : 0,
              borderTopLeftRadius: index === options.length - 1 ? 12 : 0,
              borderBottomLeftRadius: index === options.length - 1 ? 12 : 0,
            }}
          >
            {option.label}
          </Radio.Button>
        ))}
      </Radio.Group>
    </div>
  )
})
