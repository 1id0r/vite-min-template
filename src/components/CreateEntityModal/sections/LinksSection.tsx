/**
 * LinksSection - Dynamic Links Input
 *
 * Allows users to add multiple links with URL and display name.
 * Each link has: לינק (URL) and שם תצוגה (Display Name)
 */

import { memo } from 'react'
import { useFormContext } from 'react-hook-form'
import { Input, Button, Space, Typography } from 'antd'
import { IconPlus, IconX } from '@tabler/icons-react'
import { GenericButton } from '../../GenericButton'
import type { EntityFormData } from '../hooks/useEntityForm'

const { Text } = Typography

// URL regex pattern
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i

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
      links.filter((_, i) => i !== index),
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
                  placeholder='הזן לינק'
                  value={link.url}
                  onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  status={link.url && !URL_REGEX.test(link.url) ? 'error' : undefined}
                  style={{ direction: 'rtl' }}
                />
                <Button
                  type='text'
                  icon={<IconX size={14} />}
                  onClick={() => handleRemoveLink(index)}
                  style={{ marginRight: 8, color: '#6B7280' }}
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
          <GenericButton
            variant='link'
            buttonType='textWithIcon'
            text='הוסף לינק'
            icon={IconPlus}
            iconSize={14}
            onClick={handleAddLink}
          />
        </div>
      </Space>
    </div>
  )
})

LinksSection.displayName = 'LinksSection'
