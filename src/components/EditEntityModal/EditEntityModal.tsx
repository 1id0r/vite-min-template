/**
 * EditEntityModal - Fully Schema-Driven Editing Modal
 */

import { useState, useMemo } from 'react'
import { Modal, Tabs, Space, Typography, Collapse } from 'antd'
import { GenericRuleForm } from '../GenericRuleForm'
import { GenericButton } from '../GenericButton'
import { GenericFormField, BindingForm } from '../CreateEntityModal/shared'
import { GeneralFieldConfig } from '../../schemas/fieldConfigs'
import { getEntityRules } from '../../schemas/ruleSchemas'

const { Text } = Typography
const { Panel } = Collapse

interface EditEntityModalProps {
  visible: boolean
  onClose: () => void
  onSave: (data: any) => void
  entityType: string // e.g., 'elastic', 'linux'
  initialData: any // Existing entity data
}

export const EditEntityModal = ({ visible, onClose, onSave, entityType, initialData }: EditEntityModalProps) => {
  const [activeTab, setActiveTab] = useState('general')
  const [formData, setFormData] = useState(initialData || {})

  const availableRules = useMemo(() => getEntityRules(entityType), [entityType])

  const handleFieldChange = (field: string, val: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: val }))
  }

  const handleRuleChange = (ruleKey: string, ruleData: any) => {
    setFormData((prev: any) => ({
      ...prev,
      rules: {
        ...prev.rules,
        [ruleKey]: ruleData,
      },
    }))
  }

  const handleBindingChange = (type: 'urls' | 'elastic', index: number, val: any) => {
    setFormData((prev: any) => {
      const newList = [...(prev[type] || [])]
      newList[index] = val
      return { ...prev, [type]: newList }
    })
  }

  const items = [
    {
      key: 'general',
      label: 'General Details',
      children: (
        <div style={{ direction: 'rtl', padding: 16 }}>
          {GeneralFieldConfig.fields.map((field) => (
            <GenericFormField
              key={field.name}
              field={field}
              value={formData[field.name]}
              onChange={(val: any) => handleFieldChange(field.name, val)}
              layout='stacked'
            />
          ))}
        </div>
      ),
    },
    {
      key: 'bindings',
      label: 'Bindings',
      children: (
        <div style={{ direction: 'rtl', padding: 16 }}>
          <Space direction='vertical' style={{ width: '100%' }} size='large'>
            {(formData.urls || []).length > 0 && (
              <Collapse defaultActiveKey={['urls']} ghost expandIconPosition='end'>
                <Panel header={<Text strong>URL Bindings</Text>} key='urls'>
                  {formData.urls.map((url: any, idx: number) => (
                    <div key={idx} style={{ padding: 16, border: '1px solid #eee', borderRadius: 8, marginBottom: 16 }}>
                      <BindingForm
                        bindingType='url'
                        value={url}
                        onChange={(val: any) => handleBindingChange('urls', idx, val)}
                      />
                    </div>
                  ))}
                </Panel>
              </Collapse>
            )}

            {(formData.elastic || []).length > 0 && (
              <Collapse defaultActiveKey={['elastic']} ghost expandIconPosition='end'>
                <Panel header={<Text strong>Elastic Bindings</Text>} key='elastic'>
                  {formData.elastic.map((es: any, idx: number) => (
                    <div key={idx} style={{ padding: 16, border: '1px solid #eee', borderRadius: 8, marginBottom: 16 }}>
                      <BindingForm
                        bindingType='elastic'
                        value={es}
                        onChange={(val: any) => handleBindingChange('elastic', idx, val)}
                      />
                    </div>
                  ))}
                </Panel>
              </Collapse>
            )}

            {!formData.urls?.length && !formData.elastic?.length && (
              <Text type='secondary'>No bindings configured for this entity.</Text>
            )}
          </Space>
        </div>
      ),
    },
    {
      key: 'rules',
      label: 'Entity Rules',
      children: (
        <div style={{ direction: 'rtl', padding: 16 }}>
          <Space direction='vertical' style={{ width: '100%' }} size='large'>
            {Object.entries(availableRules).map(([ruleKey, def]) => (
              <Collapse key={ruleKey} ghost expandIconPosition='end'>
                <Panel
                  header={<Text strong>{def.labelHe || def.label}</Text>}
                  key={ruleKey}
                  style={{ border: '1px solid #eee', borderRadius: 8, marginBottom: 8 }}
                >
                  <GenericRuleForm
                    entityType={entityType}
                    ruleKey={ruleKey}
                    initialData={formData?.rules?.[ruleKey]}
                    onChange={(data) => handleRuleChange(ruleKey, data)}
                  />
                </Panel>
              </Collapse>
            ))}
          </Space>
        </div>
      ),
    },
  ]

  return (
    <Modal
      title={`Edit ${entityType} Entity`}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <GenericButton key='cancel' variant='outlined' onClick={onClose} text='Cancel' />,
        <GenericButton key='save' variant='filled' onClick={() => onSave(formData)} text='Save Changes' />,
      ]}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </Modal>
  )
}
