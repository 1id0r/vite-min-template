/**
 * MonitorSection - Dynamic Monitor Configuration (פרטי היישות)
 *
 * Renders system-specific monitor fields based on the selected system.
 * Reuses the unified GenericFormField for consistency and less code.
 * Includes validation integration with hermetic flow.
 */

import { memo, useMemo, useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Typography, Button, Alert } from 'antd'
import { IconCheck, IconX } from '@tabler/icons-react'
import { getMonitorFieldConfig } from '../../../../schemas/fieldConfigs'
import type { EntityFormData } from '../../hooks/useEntityForm'
import type { ValidationStatus } from '../../hooks/useEntityValidation'
import { GenericFormField } from '../../shared'

const { Text } = Typography

interface MonitorSectionProps {
  systemId: string
  validationStatus: ValidationStatus
  validationError: string | null
  onValidate: () => void
  onResetValidation: () => void
}

export const MonitorSection = memo(function MonitorSection({
  systemId,
  validationStatus,
  validationError,
  onValidate,
  onResetValidation,
}: MonitorSectionProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<EntityFormData>()

  // Watch monitor fields to reset validation on change
  const monitorData = useWatch({ control, name: 'monitor' })
  const prevMonitorDataRef = useRef<typeof monitorData>(undefined)

  // Reset validation when monitor fields change (after initial render)
  useEffect(() => {
    if (prevMonitorDataRef.current !== undefined) {
      // Only reset if we had previous data and it changed
      const prevStr = JSON.stringify(prevMonitorDataRef.current)
      const currStr = JSON.stringify(monitorData)
      if (prevStr !== currStr && validationStatus !== 'idle' && validationStatus !== 'loading') {
        onResetValidation()
      }
    }
    prevMonitorDataRef.current = monitorData
  }, [monitorData, onResetValidation, validationStatus])

  // Get field config for this system
  const fieldConfig = useMemo(() => getMonitorFieldConfig(systemId), [systemId])

  if (!fieldConfig || fieldConfig.fields.length === 0) {
    return null
  }

  const isValidating = validationStatus === 'loading'
  const isValid = validationStatus === 'valid'
  const isInvalid = validationStatus === 'invalid'

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

        {/* Validation Button and Status */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            onClick={onValidate}
            loading={isValidating}
            disabled={isValidating}
            type={isValid ? 'default' : 'primary'}
            style={isValid ? { borderColor: '#52c41a', color: '#52c41a' } : undefined}
          >
            {isValid ?
              <>
                <IconCheck size={16} style={{ marginLeft: 4 }} />
                תקין
              </>
            : 'בדוק ולידציה'}
          </Button>

          {isValidating && <Text type='secondary'>בודק...</Text>}
        </div>

        {/* Validation Error */}
        {isInvalid && validationError && (
          <Alert type='error' message={validationError} showIcon icon={<IconX size={16} />} style={{ marginTop: 12 }} />
        )}
      </div>
    </div>
  )
})
