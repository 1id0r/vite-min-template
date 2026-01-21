/**
 * GenericFormField - Unified field renderer for all forms
 *
 * Supports two modes:
 * 1. React Hook Form: Pass 'name' and 'control'
 * 2. Controlled Component: Pass 'value' and 'onChange'
 */

import { memo } from 'react'
import { Controller } from 'react-hook-form'
import { Input, InputNumber, Checkbox, Select, Segmented, Typography, Space, Button } from 'antd'
import { IconPlus, IconX } from '@tabler/icons-react'
import type { FieldConfig } from '../../../schemas/fieldConfigs'
import { JsonEditor } from './JsonEditor'

const { Text } = Typography
const { TextArea } = Input

type AntdStatus = '' | 'error' | 'success' | 'warning' | 'validating' | undefined

interface GenericFormFieldProps {
  field: FieldConfig
  name?: string
  control?: any
  value?: any
  onChange?: (val: any) => void
  error?: string
  status?: AntdStatus
  layout?: 'inline' | 'stacked'
  labelWidth?: number
}

export const GenericFormField = memo(function GenericFormField({
  field,
  name,
  control,
  value,
  onChange,
  error,
  status,
  layout = 'inline',
  labelWidth = 100,
}: GenericFormFieldProps) {
  const isStacked = layout === 'stacked'
  const showLabel = field.label && field.label.length > 0

  const fieldStatus: AntdStatus = status || (error ? 'error' : undefined)

  const labelElement = showLabel && (
    <Text
      strong
      style={{
        fontSize: 14,
        width: isStacked ? '100%' : labelWidth,
        display: 'block',
        marginBottom: isStacked ? 8 : 0,
        marginLeft: isStacked ? 0 : 16,
        textAlign: 'right',
        flexShrink: 0,
      }}
    >
      {field.label}
    </Text>
  )

  const contentElement = (
    <div style={{ flex: 1 }}>
      {control && name ?
        <Controller
          name={name}
          control={control}
          render={({ field: rhfField }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <div style={{ flex: field.type === 'segmented' ? 'none' : 1 }}>
                {renderInput(field, rhfField.value, rhfField.onChange, fieldStatus)}
              </div>
              {field.suffix && (
                <Text type='secondary' style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {field.suffix}
                </Text>
              )}
            </div>
          )}
        />
      : <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
          <div style={{ flex: field.type === 'segmented' ? 'none' : 1 }}>
            {renderInput(field, value, onChange, fieldStatus)}
          </div>
          {field.suffix && (
            <Text type='secondary' style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
              {field.suffix}
            </Text>
          )}
        </div>
      }
      {error && (
        <Text type='danger' style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
          {error}
        </Text>
      )}
    </div>
  )

  return (
    <div
      style={{
        display: isStacked ? 'block' : 'flex',
        alignItems: isStacked ? 'flex-start' : 'center',
        marginBottom: 16,
      }}
    >
      {labelElement}
      {contentElement}
    </div>
  )
})

function renderInput(field: FieldConfig, value: any, onChange?: (val: any) => void, status?: AntdStatus) {
  const commonProps = {
    disabled: field.disabled,
    placeholder: field.placeholder,
    status,
    style: { width: '100%', direction: 'rtl' as const },
    onChange: (val: any) => {
      const valueToEmit =
        val?.target ?
          field.type === 'boolean' ?
            val.target.checked
          : val.target.value
        : val
      onChange?.(valueToEmit)
    },
  }

  switch (field.type) {
    case 'text':
      return <Input {...commonProps} value={value || ''} />

    case 'textarea':
      return <TextArea {...commonProps} value={value || ''} rows={field.name === 'description' ? 2 : 4} />

    case 'number':
      return <InputNumber {...commonProps} min={field.min} max={field.max} value={value} />

    case 'boolean':
      return <Checkbox checked={value || false} onChange={commonProps.onChange} disabled={field.disabled} />

    case 'select':
      return <Select {...commonProps} options={field.options} value={value || undefined} />

    case 'segmented':
      return (
        <Segmented
          value={value}
          onChange={commonProps.onChange}
          options={field.options || []}
          disabled={field.disabled}
        />
      )

    case 'async-select':
      return <Select {...commonProps} options={[]} showSearch value={value || undefined} />

    case 'links-array':
      return <LinksArrayField value={value} onChange={onChange} />

    case 'json':
      return (
        <JsonEditor
          value={value || ''}
          onChange={commonProps.onChange}
          placeholder={field.placeholder}
          error={status === 'error' ? 'JSON לא תקין' : undefined}
        />
      )

    default:
      return <Input {...commonProps} value={value || ''} />
  }
}

const LinksArrayField = ({ value, onChange }: { value: any; onChange?: (val: any) => void }) => {
  const links = value || []

  const updateLink = (index: number, key: string, val: string) => {
    const newLinks = [...links]
    newLinks[index] = { ...newLinks[index], [key]: val }
    onChange?.(newLinks)
  }

  const addLink = () => onChange?.([...links, { label: '', url: '' }])
  const removeLink = (index: number) => onChange?.(links.filter((_: any, i: number) => i !== index))

  return (
    <div style={{ width: '100%' }}>
      <Space direction='vertical' size='small' style={{ width: '100%' }}>
        {links.map((link: any, index: number) => (
          <Space key={index} align='start' style={{ width: '100%' }}>
            <Input
              placeholder='שם הלינק'
              value={link.label}
              onChange={(e) => updateLink(index, 'label', e.target.value)}
              style={{ width: 150, direction: 'rtl' }}
            />
            <Input
              placeholder='כתובת URL'
              value={link.url}
              onChange={(e) => updateLink(index, 'url', e.target.value)}
              style={{ width: 250, direction: 'ltr' }}
            />
            <Button type='text' danger icon={<IconX size={14} />} onClick={() => removeLink(index)} />
          </Space>
        ))}
        <Button type='link' icon={<IconPlus size={14} />} onClick={addLink} size='small' style={{ padding: 0 }}>
          הוסף לינק
        </Button>
      </Space>
    </div>
  )
}
