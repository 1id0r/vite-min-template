/**
 * GeneralSection - Schema-Driven Entity General Details
 *
 * Refactored to use GeneralFieldConfig from fieldConfigs.ts and
 * the unified GenericFormField component. Achieve zero hardcoding.
 */

import { memo } from 'react'
import { useFormContext } from 'react-hook-form'
import { Row, Col, Typography, Divider } from 'antd'
import type { EntityFormData } from '../../hooks/useEntityForm'
import { GenericFormField } from '../../shared'
import { GeneralFieldConfig } from '../../../../schemas/fieldConfigs'

const { Text } = Typography

interface GeneralSectionProps {
  /** Whether to show in compact mode */
  compact?: boolean
}

export const GeneralSection = memo(function GeneralSection({ compact }: GeneralSectionProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<EntityFormData>()

  return (
    <div style={{ direction: 'rtl' }}>
      <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
        {GeneralFieldConfig.title}
      </Text>

      <Row gutter={[16, 0]}>
        {GeneralFieldConfig.fields.map((field) => (
          <Col key={field.name} span={compact ? 12 : field.colSpan || 12}>
            <GenericFormField
              field={field}
              name={field.name}
              control={control}
              error={(errors as any)[field.name]?.message}
              layout='stacked' // Stacked layout looks better in the main entity details form
            />
          </Col>
        ))}
      </Row>

      {!compact && <Divider />}
    </div>
  )
})

GeneralSection.displayName = 'GeneralSection'
