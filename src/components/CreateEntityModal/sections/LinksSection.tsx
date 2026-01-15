/**
 * LinksSection - Dynamic Links Input
 *
 * Allows users to add multiple links with URL and display name.
 * Each link has: לינק (URL) and שם תצוגה (Display Name)
 */

import { memo } from 'react'
import { useFormContext } from 'react-hook-form'
import { Input, Button, Space, Typography } from 'antd'
import { PlusOutlined, CloseOutlined } from '@ant-design/icons'
import type { EntityFormData } from '../hooks/useEntityForm'

const { Text } = Typography

export const LinksSection = memo(function LinksSection() {
  const {
    formState: { errors },
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
    <div
      style={{
        direction: 'rtl',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        padding: '24px',
      }}
    >
      <Space direction='vertical' style={{ width: '100%' }} size='middle'>
        {links.map((link, index) => (
          <div key={index} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <Text strong style={{ fontSize: 14, width: 90, marginLeft: 12 }}>
                לינק
              </Text>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <Input
                  placeholder='הזן שם לינק'
                  value={link.url}
                  onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  status={errors.links?.[index]?.url ? 'error' : undefined}
                  style={{ direction: 'rtl' }}
                />
                <Button
                  type='text'
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleRemoveLink(index)}
                  style={{ marginRight: 8 }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text strong style={{ fontSize: 14, width: 90, marginLeft: 12 }}>
                שם תצוגה
              </Text>
              <Input
                placeholder='הזן שם תצוגה ללינק'
                value={link.label}
                onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                status={errors.links?.[index]?.label ? 'error' : undefined}
                style={{ flex: 1, direction: 'rtl', marginLeft: 40 }}
              />
            </div>
          </div>
        ))}

        {/* Add Link Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button type='link' icon={<PlusOutlined />} onClick={handleAddLink} style={{ padding: 0, fontSize: '14px' }}>
            הוסף לינק
          </Button>
        </div>
      </Space>
    </div>
  )
})

LinksSection.displayName = 'LinksSection'
