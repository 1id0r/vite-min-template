/**
 * MonitorSection - Dynamic Monitor Configuration (פרטי היישות)
 *
 * Renders system-specific monitor fields based on the selected system.
 * Reuses the unified GenericFormField for consistency and less code.
 */

import { memo, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { Typography, Button } from 'antd'
import { getMonitorFieldConfig } from '../../../../schemas/fieldConfigs'
import type { EntityFormData } from '../../hooks/useEntityForm'
import { GenericFormField } from '../../shared'

const { Text } = Typography

interface MonitorSectionProps {
  systemId: string
}

export const MonitorSection = memo(function MonitorSection({ systemId }: MonitorSectionProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<EntityFormData>()

  // Get field config for this system
  const fieldConfig = useMemo(() => getMonitorFieldConfig(systemId), [systemId])

  if (!fieldConfig || fieldConfig.fields.length === 0) {
    return null
  }

  const handleValidate = () => {
    // Placeholder for future validation integration
    console.log('Validate button clicked - will connect to validation component later')
  }

  return (
    <div
      style={{
        direction: 'rtl',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        padding: '24px',
        marginTop: '24px',
      }}
    >
      <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 16, textAlign: 'right' }}>
        פרטי היישות
      </Text>
      <div>
        {/* Dynamic Fields using GenericFormField */}
        {fieldConfig.fields.map((field) => (
          <GenericFormField
            key={field.name}
            field={field}
            name={`monitor.${field.name}`}
            control={control}
            error={(errors.monitor as any)?.[field.name]?.message}
            layout='inline'
          />
        ))}

        {/* Validate Button */}
        <Button onClick={handleValidate} style={{ marginTop: 8 }}>
          בדוק ולידציה
        </Button>
      </div>
    </div>
  )
})

MonitorSection.displayName = 'MonitorSection'
