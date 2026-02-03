/**
 * IconSelector - Icon Selection Dropdown for Display Entities
 *
 * Renders a dropdown with random Tabler icons for display entity creation.
 * Uses Ant Design Select with custom option rendering.
 */

import { memo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Select, Typography } from 'antd'
import {
  IconStar,
  IconHeart,
  IconBolt,
  IconFlame,
  IconRocket,
  IconCloud,
  IconDatabase,
  IconServer,
  IconCpu,
  IconChartBar,
  IconSettings,
  IconBell,
  IconLock,
  IconShield,
  IconWorld,
  IconCode,
  IconTerminal2,
  IconApi,
  IconBrandDocker,
  IconNetwork,
} from '@tabler/icons-react'
import type { EntityFormData } from '../../hooks/useEntityForm'

const { Text } = Typography

// Icon options with Tabler icons
const ICON_OPTIONS = [
  { value: 'star', label: 'כוכב', icon: IconStar },
  { value: 'heart', label: 'לב', icon: IconHeart },
  { value: 'bolt', label: 'ברק', icon: IconBolt },
  { value: 'flame', label: 'להבה', icon: IconFlame },
  { value: 'rocket', label: 'רקטה', icon: IconRocket },
  { value: 'cloud', label: 'ענן', icon: IconCloud },
  { value: 'database', label: 'מסד נתונים', icon: IconDatabase },
  { value: 'server', label: 'שרת', icon: IconServer },
  { value: 'cpu', label: 'מעבד', icon: IconCpu },
  { value: 'chart', label: 'תרשים', icon: IconChartBar },
  { value: 'settings', label: 'הגדרות', icon: IconSettings },
  { value: 'bell', label: 'פעמון', icon: IconBell },
  { value: 'lock', label: 'מנעול', icon: IconLock },
  { value: 'shield', label: 'מגן', icon: IconShield },
  { value: 'world', label: 'עולם', icon: IconWorld },
  { value: 'code', label: 'קוד', icon: IconCode },
  { value: 'terminal', label: 'טרמינל', icon: IconTerminal2 },
  { value: 'api', label: 'API', icon: IconApi },
  { value: 'docker', label: 'דוקר', icon: IconBrandDocker },
  { value: 'network', label: 'רשת', icon: IconNetwork },
]

export const IconSelector = memo(function IconSelector() {
  const form = useFormContext<EntityFormData>()

  return (
    <div
      style={{
        direction: 'rtl',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        padding: '24px',
        marginTop: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Text strong style={{ fontSize: 14, width: 100, marginLeft: 16, flexShrink: 0 }}>
          אייקון
        </Text>
        <div style={{ flex: 1 }}>
          <Controller
            name='icon'
            control={form.control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder='בחר אייקון'
                style={{ width: '100%' }}
                optionLabelProp='label'
                options={ICON_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <opt.icon size={18} />
                      <span>{opt.label}</span>
                    </div>
                  ),
                }))}
                optionRender={(option) => {
                  const iconOpt = ICON_OPTIONS.find((o) => o.value === option.value)
                  if (!iconOpt) return option.label
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <iconOpt.icon size={18} />
                      <span>{iconOpt.label}</span>
                    </div>
                  )
                }}
              />
            )}
          />
        </div>
      </div>
    </div>
  )
})
