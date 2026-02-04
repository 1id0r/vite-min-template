/**
 * MonitorSection - Dynamic Monitor Configuration (פרטי היישות)
 *
 * Renders system-specific monitor fields based on the selected system.
 * Includes validation button that calls the backend API to validate entity details.
 */

import { memo, useMemo, useState, useCallback } from 'react'
import { useFormContext } from 'react-hook-form'
import { Typography, Button, Alert } from 'antd'
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { getMonitorFieldConfig } from '../../../../schemas/fieldConfigs'
import { validateEntity, hasValidationSupport } from '../../../../api/entityValidation'
import type { EntityFormData } from '../../hooks/useEntityForm'
import { GenericFormField } from '../../shared'

const { Text } = Typography

interface MonitorSectionProps {
  systemId: string
  onValidationChange?: (isValid: boolean) => void
}

export const MonitorSection = memo(function MonitorSection({ systemId, onValidationChange }: MonitorSectionProps) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<EntityFormData>()

  // Validation state
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    error: string
  } | null>(null)

  // Get field config for this system
  const fieldConfig = useMemo(() => getMonitorFieldConfig(systemId), [systemId])

  // Watch all monitor fields by their full paths for proper reactivity
  const watchPaths = useMemo(() => {
    if (!fieldConfig) return []
    return fieldConfig.fields.map((f) => `monitor.${f.name}` as const)
  }, [fieldConfig])

  // Watch all monitor fields - this returns an array of values
  const watchedValues = watch(watchPaths)

  // Build monitor data object from watched values
  const monitorData = useMemo(() => {
    if (!fieldConfig) return {}
    const data: Record<string, unknown> = {}
    fieldConfig.fields.forEach((field, index) => {
      data[field.name] = watchedValues[index]
    })
    return data
  }, [fieldConfig, watchedValues])

  // Check if this entity supports validation
  const supportsValidation = useMemo(() => hasValidationSupport(systemId), [systemId])

  // Check if all required fields are filled
  const areRequiredFieldsFilled = useMemo(() => {
    if (!fieldConfig) return false
    const requiredFields = fieldConfig.fields.filter((f) => f.required)
    return requiredFields.every((field) => {
      const value = monitorData[field.name]
      return value !== undefined && value !== null && value !== ''
    })
  }, [fieldConfig, monitorData])

  const handleValidate = useCallback(async () => {
    setIsValidating(true)
    setValidationResult(null)

    try {
      const result = await validateEntity(systemId, monitorData as Record<string, unknown>)
      setValidationResult(result)
      onValidationChange?.(result.isValid)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed'
      setValidationResult({ isValid: false, error: errorMessage })
      onValidationChange?.(false)
    } finally {
      setIsValidating(false)
    }
  }, [systemId, monitorData, onValidationChange])

  if (!fieldConfig || fieldConfig.fields.length === 0) {
    return null
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

        {/* Validation Feedback */}
        {validationResult && (
          <Alert
            type={validationResult.isValid ? 'success' : 'error'}
            message={validationResult.isValid ? 'הישות תקינה!' : 'שגיאת ולידציה'}
            description={validationResult.isValid ? undefined : validationResult.error}
            showIcon
            style={{ marginTop: 16, marginBottom: 8 }}
          />
        )}

        {/* Validate Button */}
        {supportsValidation && (
          <Button
            onClick={handleValidate}
            disabled={!areRequiredFieldsFilled || isValidating}
            icon={
              isValidating ? <LoadingOutlined spin />
              : validationResult?.isValid ?
                <CheckCircleOutlined />
              : undefined
            }
            type={validationResult?.isValid ? 'primary' : 'default'}
            style={{ marginTop: 8 }}
          >
            {isValidating ?
              'בודק...'
            : validationResult?.isValid ?
              'נבדק בהצלחה'
            : 'בדוק ולידציה'}
          </Button>
        )}
      </div>
    </div>
  )
})
