/**
 * GeneralSection - Entity General Details
 *
 * Form section for entity name, description, contact info, and links.
 * Always visible after system selection.
 */

import { memo } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Input, Row, Col, Button, Space, Typography, Divider } from 'antd'
import { IconPlus, IconX } from '@tabler/icons-react'
import type { EntityFormData } from '../hooks/useEntityForm'

const { Text } = Typography
const { TextArea } = Input

interface GeneralSectionProps {
  /** Whether to show in compact mode */
  compact?: boolean
}

export const GeneralSection = memo(function GeneralSection({ compact }: GeneralSectionProps) {
  const {
    register,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useFormContext<EntityFormData>()

  const links = watch('links') || []

  const handleAddLink = () => {
    setValue('links', [...links, { label: '', url: '' }])
  }

  const handleRemoveLink = (index: number) => {
    setValue(
      'links',
      links.filter((_, i) => i !== index)
    )
  }

  const handleLinkChange = (index: number, field: 'url' | 'label', value: string) => {
    const newLinks = [...links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setValue('links', newLinks)
  }

  return (
    <div style={{ direction: 'rtl' }}>
      <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
        פרטים כלליים
      </Text>
      <Space direction='vertical' size={compact ? 'small' : 'middle'} style={{ width: '100%' }}>
        {/* Display Name and Entity Type - side by side */}
        <Row gutter={16}>
          <Col span={12}>
            <div>
              <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                שם תצוגה
              </Text>
              <Input
                placeholder='הזן שם תצוגה'
                status={errors.displayName ? 'error' : undefined}
                {...register('displayName')}
                style={{ direction: 'rtl' }}
              />
              {errors.displayName && (
                <Text type='danger' style={{ fontSize: 12 }}>
                  {errors.displayName.message}
                </Text>
              )}
            </div>
          </Col>
          <Col span={12}>
            <Controller
              name='entityType'
              control={control}
              render={({ field }) => (
                <div>
                  <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                    סוג יישות
                  </Text>
                  <Input disabled value={field.value || ''} style={{ direction: 'rtl' }} />
                </div>
              )}
            />
          </Col>
        </Row>

        {/* Description */}
        <div>
          <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
            תיאור
          </Text>
          <TextArea
            placeholder='הזן תיאור'
            rows={2}
            status={errors.description ? 'error' : undefined}
            {...register('description')}
            style={{ direction: 'rtl' }}
          />
          {errors.description && (
            <Text type='danger' style={{ fontSize: 12 }}>
              {errors.description.message}
            </Text>
          )}
        </div>

        {/* Contact Info and Responsible Party - side by side */}
        <Row gutter={16}>
          <Col span={12}>
            <div>
              <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                פרטי התקשרות
              </Text>
              <Input
                placeholder='מספר טלפון'
                status={errors.contactInfo ? 'error' : undefined}
                {...register('contactInfo')}
                style={{ direction: 'rtl' }}
              />
              {errors.contactInfo && (
                <Text type='danger' style={{ fontSize: 12 }}>
                  {errors.contactInfo.message}
                </Text>
              )}
            </div>
          </Col>
          <Col span={12}>
            <div>
              <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                גורם אחראי
              </Text>
              <Input
                placeholder='שם או תפקיד'
                status={errors.responsibleParty ? 'error' : undefined}
                {...register('responsibleParty')}
                style={{ direction: 'rtl' }}
              />
              {errors.responsibleParty && (
                <Text type='danger' style={{ fontSize: 12 }}>
                  {errors.responsibleParty.message}
                </Text>
              )}
            </div>
          </Col>
        </Row>

        {/* Links Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text strong style={{ fontSize: 14 }}>
              לינקים
            </Text>
            <Button type='link' icon={<IconPlus size={14} />} onClick={handleAddLink} size='small'>
              הוסף
            </Button>
          </div>

          <Space direction='vertical' size='small' style={{ width: '100%' }}>
            {links.map((link, index) => (
              <Space key={index} align='start' style={{ width: '100%' }}>
                <Input
                  placeholder='שם הלינק'
                  value={link.label}
                  onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                  status={errors.links?.[index]?.label ? 'error' : undefined}
                  style={{ flex: 1, direction: 'rtl', width: 150 }}
                />
                <Input
                  placeholder='כתובת URL'
                  value={link.url}
                  onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  status={errors.links?.[index]?.url ? 'error' : undefined}
                  style={{ flex: 2, direction: 'ltr', width: 250 }}
                />
                <Button type='text' danger icon={<IconX size={14} />} onClick={() => handleRemoveLink(index)} />
              </Space>
            ))}
          </Space>
        </div>
      </Space>
      <Divider />
    </div>
  )
})

GeneralSection.displayName = 'GeneralSection'
