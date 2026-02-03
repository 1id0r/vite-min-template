/**
 * BindingSection - Generic Collapsible Binding Section
 *
 * Renders a collapsible section for a specific binding type (URL, Elastic, etc.)
 * Driven by BindingMetadata configuration for maximum reusability.
 */

import { memo } from 'react'
import { Collapse, Typography, Space, Button, Modal } from 'antd'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { IconPlus } from '@tabler/icons-react'
import type { BindingMetadata } from '../../../../schemas/fieldConfigs'
import { BindingInstance } from './BindingInstance'

const { Text } = Typography
const { Panel } = Collapse

const panelStyle: React.CSSProperties = {
  border: '1px solid #e9ecef',
  borderRadius: 12,
  marginBottom: 8,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  overflow: 'hidden',
}

interface BindingSectionProps {
  config: BindingMetadata
}

export const BindingSection = memo(function BindingSection({ config }: BindingSectionProps) {
  const { control, getValues } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: config.fieldArrayName as any })

  const handleRemove = (index: number) => {
    // Get current values for this binding
    const values = getValues(`${config.fieldArrayName}.${index}`)

    // Check if binding has any content
    const hasContent =
      values &&
      Object.entries(values).some(([key, value]) => {
        // Ignore default/empty values
        if (key === 'timeout' || key === 'scheduleInterval' || key === 'scheduleUnit') return false
        return value && value !== ''
      })

    if (hasContent) {
      Modal.confirm({
        title: 'מחיקת הצמדה',
        content: `האם אתה בטוח שברצונך למחוק את ה-${config.title} הזה? פעולה זו תמחק גם את כל החוקים המשויכים.`,
        okText: 'מחק',
        cancelText: 'ביטול',
        okButtonProps: { danger: true },
        onOk: () => remove(index),
      })
    } else {
      // Empty binding - remove without confirmation
      remove(index)
    }
  }

  return (
    <div style={panelStyle}>
      <Collapse defaultActiveKey={config.defaultOpen ? [config.type] : []} ghost expandIconPlacement='end'>
        <Panel header={<Text strong>{config.title}</Text>} key={config.type}>
          <Space orientation='vertical' style={{ width: '100%' }}>
            {fields.map((field, index) => (
              <BindingInstance
                key={field.id}
                config={config}
                index={index}
                control={control}
                onRemove={() => handleRemove(index)}
                showDivider={index < fields.length - 1}
              />
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <Button type='dashed' icon={<IconPlus size={14} />} onClick={() => append(config.defaultValues)}>
                הוסף {config.title}
              </Button>
            </div>
          </Space>
        </Panel>
      </Collapse>
    </div>
  )
})
