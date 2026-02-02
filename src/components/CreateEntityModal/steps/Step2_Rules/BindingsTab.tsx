/**
 * BindingsTab - Schema-Driven Bindings Management
 *
 * Simplified bindings tab using:
 * - BINDING_DEFINITIONS for binding configurations
 * - BindingSection component for rendering each binding type
 * - Shared RuleInstanceGroup for consistent UI
 */

import { memo } from 'react'
import { Collapse, Typography, Space } from 'antd'
import { Controller, useFormContext } from 'react-hook-form'
import { TreeStep } from './TreeStep'
import { BindingSection } from '../../components/BindingSection'
import { BINDING_DEFINITIONS } from '../../../../schemas/fieldConfigs'

const { Text } = Typography
const { Panel } = Collapse

const panelStyle: React.CSSProperties = {
  border: '1px solid #e9ecef',
  borderRadius: 12,
  marginBottom: 8,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  overflow: 'hidden',
}

// ─────────────────────────────────────────────────────────────────────────────
// Main BindingsTab
// ─────────────────────────────────────────────────────────────────────────────

export const BindingsTab = memo(function BindingsTab() {
  return (
    <div style={{ direction: 'rtl' }}>
      <Space direction='vertical' size='small' style={{ width: '100%' }}>
        {/* Map over binding definitions instead of hardcoding */}
        {BINDING_DEFINITIONS.map((config) => (
          <BindingSection key={config.type} config={config} />
        ))}

        {/* Measurements section */}
        <div style={panelStyle}>
          <Collapse ghost expandIconPosition='end'>
            <Panel header={<Text strong>מדידות</Text>} key='measurements'>
              <MeasurementsSection />
            </Panel>
          </Collapse>
        </div>
      </Space>
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// Measurements Section
// ─────────────────────────────────────────────────────────────────────────────

const MeasurementsSection = () => {
  const { control } = useFormContext()
  return (
    <Controller
      name='measurements'
      control={control}
      render={({ field }) => <TreeStep selection={field.value || []} onSelectionChange={field.onChange} />}
    />
  )
}
