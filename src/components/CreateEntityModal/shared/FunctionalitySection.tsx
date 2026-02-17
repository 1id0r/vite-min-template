/**
 * FunctionalitySection - Collapsible section for rule functionality settings
 *
 * Contains communication details and optional ServiceNow integration.
 * Renders as a collapsible Collapse panel since it has many fields.
 */

import { memo, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Collapse, Input, InputNumber, Typography, Button, Tag, Space } from 'antd'
import { IconPlus } from '@tabler/icons-react'
import { JsonEditor } from './JsonEditor'

const { Text } = Typography
const { TextArea } = Input

interface FunctionalitySectionProps {
  basePath: string // e.g., 'entityRules.0.data.functionality'
}

export const FunctionalitySection = memo(function FunctionalitySection({ basePath }: FunctionalitySectionProps) {
  const { control } = useFormContext()
  const [activeKey, setActiveKey] = useState<string[]>([])

  return (
    <Collapse
      ghost
      activeKey={activeKey}
      onChange={(keys) => setActiveKey(keys as string[])}
      style={{ marginBottom: 16, direction: 'rtl', border: '1px solid #e9ecef', borderRadius: 8 }}
      items={[
        {
          key: 'functionality',
          label: (
            <Text strong style={{ fontSize: 14 }}>
              פונקציונליות לחוק
            </Text>
          ),
          children: (
            <div style={{ padding: '8px 0' }}>
              {/* Interval field */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <Text strong style={{ fontSize: 14, width: 140, marginLeft: 12, flexShrink: 0 }}>
                  זמן בין שליחות חוזרות <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Controller
                    name={`${basePath}.interval`}
                    control={control}
                    render={({ field }) => <InputNumber {...field} min={1} style={{ width: 100 }} placeholder='1' />}
                  />
                  <Text type='secondary' style={{ whiteSpace: 'nowrap' }}>
                    דקות
                  </Text>
                </div>
              </div>

              {/* Email addresses field */}
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
                <Text strong style={{ fontSize: 14, width: 140, marginLeft: 12, flexShrink: 0, paddingTop: 4 }}>
                  כתובות מייל <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
                <div style={{ flex: 1 }}>
                  <Controller
                    name={`${basePath}.email_addresses`}
                    control={control}
                    render={({ field }) => (
                      <TagsInput
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder='הזן כתובת מייל ולחץ Enter'
                        direction='rtl'
                      />
                    )}
                  />
                </div>
              </div>

              {/* URL field */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <Text strong style={{ fontSize: 14, width: 140, marginLeft: 12, flexShrink: 0 }}>
                  קישור למערכת <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
                <div style={{ flex: 1 }}>
                  <Controller
                    name={`${basePath}.url`}
                    control={control}
                    render={({ field }) => <Input {...field} placeholder='https://' style={{ direction: 'ltr' }} />}
                  />
                </div>
              </div>

              {/* Text field */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <Text strong style={{ fontSize: 14, width: 140, marginLeft: 12, flexShrink: 0 }}>
                  טקסט <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
                <div style={{ flex: 1 }}>
                  <Controller
                    name={`${basePath}.text`}
                    control={control}
                    render={({ field }) => <Input {...field} style={{ direction: 'rtl' }} />}
                  />
                </div>
              </div>

              {/* Email description field */}
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
                <Text strong style={{ fontSize: 14, width: 140, marginLeft: 12, flexShrink: 0, paddingTop: 4 }}>
                  תיאור במייל <span style={{ color: '#ff4d4f' }}>*</span>
                </Text>
                <div style={{ flex: 1 }}>
                  <Controller
                    name={`${basePath}.email_description`}
                    control={control}
                    render={({ field }) => <TextArea {...field} rows={3} style={{ direction: 'rtl' }} />}
                  />
                </div>
              </div>

              {/* ServiceNow section (nested collapse) */}
              <Collapse
                ghost
                style={{ marginTop: 16, border: '1px solid #e9ecef', borderRadius: 8 }}
                items={[
                  {
                    key: 'servicenow',
                    label: <Text style={{ fontSize: 13 }}>תקלת Service Now (אופציונלי)</Text>,
                    children: (
                      <div style={{ padding: '8px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
                          <Text
                            strong
                            style={{ fontSize: 14, width: 140, marginLeft: 12, flexShrink: 0, paddingTop: 4 }}
                          >
                            Service Now JSON <span style={{ color: '#ff4d4f' }}>*</span>
                          </Text>
                          <div style={{ flex: 1 }}>
                            <Controller
                              name={`${basePath}.servicenow.json`}
                              control={control}
                              render={({ field }) => (
                                <JsonEditor
                                  value={
                                    typeof field.value === 'string' ?
                                      field.value
                                    : JSON.stringify(field.value || {}, null, 2)
                                  }
                                  onChange={(val) => {
                                    try {
                                      field.onChange(JSON.parse(val))
                                    } catch {
                                      field.onChange(val)
                                    }
                                  }}
                                  placeholder='{"key": "value"}'
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          ),
        },
      ]}
    />
  )
})

/**
 * TagsInput - Input for list of email addresses as tags
 */
const TagsInput = ({
  value = [],
  onChange,
  placeholder,
  direction = 'ltr',
}: {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  direction?: 'ltr' | 'rtl'
}) => {
  const [inputValue, setInputValue] = useState('')

  const handleInputConfirm = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInputValue('')
  }

  const handleRemove = (removedTag: string) => {
    onChange(value.filter((t) => t !== removedTag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleInputConfirm()
    }
  }

  return (
    <div>
      <Space size={[0, 8]} wrap style={{ marginBottom: value.length > 0 ? 8 : 0 }}>
        {value.map((tag) => (
          <Tag key={tag} closable onClose={() => handleRemove(tag)} style={{ direction: 'ltr' }}>
            {tag}
          </Tag>
        ))}
      </Space>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleInputConfirm}
        placeholder={placeholder}
        suffix={
          <Button
            type='text'
            size='small'
            icon={<IconPlus size={14} />}
            onClick={handleInputConfirm}
            disabled={!inputValue.trim()}
          />
        }
        style={{ direction, textAlign: direction === 'rtl' ? 'right' : 'left' }}
      />
    </div>
  )
}
