/**
 * LinksSection - Dynamic Links Input
 *
 * Allows users to add multiple links with URL and display name.
 * Each link has: לינק (URL) and שם תצוגה (Display Name)
 */

import { memo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Input, Button, Typography } from 'antd'
import { IconPlus, IconX } from '@tabler/icons-react'
import { GenericButton } from '../../../GenericButton'
import type { EntityFormData } from '../../hooks/useEntityForm'

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

  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

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
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {links.map((link, index) => {
          const urlKey = `url-${index}`
          const isUrlTouched = touchedFields[urlKey] || false
          const isUrlFocused = focusedField === urlKey
          const isInvalidUrl = link.url && !URL_REGEX.test(link.url)
          // Hide error while typing, wait for blur
          const showUrlError = isUrlTouched && !isUrlFocused && isInvalidUrl

          const labelKey = `label-${index}`
          const isLabelFocused = focusedField === labelKey
          const rhfLabelError = errors.links?.[index]?.label
          const showLabelError = !isLabelFocused && !!rhfLabelError

          return (
            <div key={index} style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: 400, width: 90, marginLeft: 12, marginTop: 6 }}>לינק</Text>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 40 }}>
                  <Input
                    placeholder='הזן לינק'
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    onFocus={() => setFocusedField(urlKey)}
                    onBlur={() => {
                      setFocusedField(null)
                      setTouchedFields((prev) => ({ ...prev, [urlKey]: true }))
                    }}
                    status={showUrlError ? 'error' : undefined}
                    style={{ direction: 'rtl' }}
                  />
                  {showUrlError && (
                    <Text type='danger' style={{ fontSize: 12, marginTop: 4 }}>
                      כתובת לא תקינה (למשל חסר .com)
                    </Text>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: 400, width: 90, marginLeft: 12 }}>שם תצוגה</Text>
                <Input
                  placeholder='הזן שם תצוגה ללינק'
                  value={link.label}
                  onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                  onFocus={() => setFocusedField(labelKey)}
                  onBlur={() => setFocusedField(null)}
                  status={showLabelError ? 'error' : undefined}
                  style={{ flex: 1, direction: 'rtl', marginLeft: 40 }}
                />
              </div>
              {/* Delete Button - Centered vertically relative to the entire item */}
              {index > 0 && (
                <Button
                  type='text'
                  icon={<IconX size={14} />}
                  onClick={() => handleRemoveLink(index)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    transform: 'translateY(-50%)',
                    color: '#6B7280',
                  }}
                />
              )}
            </div>
          )
        })}

        {/* Add Link Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <GenericButton
            style={{ marginRight: -20 }}
            variant='link'
            buttonType='textWithIcon'
            text='הוסף לינק'
            icon={IconPlus}
            iconSize={14}
            onClick={handleAddLink}
          />
        </div>
      </div>
    </div>
  )
})
