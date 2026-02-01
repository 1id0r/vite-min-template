/**
 * Step1Content - Entity Details Step
 *
 * Contains the complete content for Step 1 of the entity creation wizard:
 * - Flow selector (monitor/display)
 * - Category and system selectors (monitor flow)
 * - Name and description fields
 * - Links section
 * - Monitor section with dynamic fields
 */

import { memo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Input, Typography } from 'antd'
import { FlowSelector } from './FlowSelector'
import { CategorySystemSelector } from './CategorySystemSelector'
import { LinksSection } from './LinksSection'
import { MonitorSection } from './MonitorSection'
import type { EntityFormData } from '../../hooks/useEntityForm'
import type { CategoryDefinition, SystemDefinition } from '../../../../types/entity'

const { Text } = Typography
const { TextArea } = Input

interface FlowOption {
  value: string
  label: string
}

export interface Step1ContentProps {
  flow: 'monitor' | 'display'
  flowOptions: FlowOption[]
  systemId: string | null
  categoryId: string | null
  categories: CategoryDefinition[]
  systems: Record<string, SystemDefinition>
  showSystemSelector: boolean
  showGeneralSection: boolean
  showMonitorSection: boolean
  onFlowChange: (value: 'monitor' | 'display') => void
  onCategoryChange: (categoryId: string | null) => void
  onSystemChange: (systemId: string | null) => void
}

export const Step1Content = memo(function Step1Content({
  flow,
  flowOptions,
  systemId,
  categories,
  categoryId,
  systems,
  showSystemSelector,
  showGeneralSection,
  showMonitorSection,
  onFlowChange,
  onCategoryChange,
  onSystemChange,
}: Step1ContentProps) {
  const form = useFormContext<EntityFormData>()

  return (
    <>
      {/* Flow Selector - Only visible on Step 1, below stepper */}
      <FlowSelector
        flow={flow}
        flowOptions={flowOptions}
        onFlowChange={(value) => onFlowChange(value as 'monitor' | 'display')}
      />

      {/* פרטים כלליים Section Header */}
      <Text strong style={{ fontSize: 16, display: 'block', textAlign: 'right', marginBottom: 20 }}>
        פרטים כלליים
      </Text>

      {/* Category and Entity Selectors - Only for monitor flow */}
      {showSystemSelector && (
        <CategorySystemSelector
          categories={categories}
          systems={systems}
          selectedCategory={categoryId}
          selectedSystem={systemId}
          onCategoryChange={onCategoryChange}
          onSystemChange={onSystemChange}
        />
      )}

      {/* Name and Description - Visible after system selection */}
      {showGeneralSection && (
        <div style={{ direction: 'rtl', marginTop: 8, marginBottom: 20 }}>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start' }}>
            <Text strong style={{ fontSize: 14, width: 100, marginLeft: 16, marginTop: 5 }}>
              שם יישות
            </Text>
            <div style={{ flex: 1 }}>
              <Controller
                name='displayName'
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder='הזן שם יישות'
                    status={form.formState.errors.displayName ? 'error' : undefined}
                    style={{ width: '100%', direction: 'rtl' }}
                  />
                )}
              />
              {form.formState.errors.displayName && (
                <Text type='danger' style={{ fontSize: 12, display: 'block' }}>
                  {form.formState.errors.displayName.message}
                </Text>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'start' }}>
            <Text strong style={{ fontSize: 14, width: 100, marginLeft: 16, marginTop: 5 }}>
              תיאור
            </Text>
            <div style={{ flex: 1 }}>
              <Controller
                name='description'
                control={form.control}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    placeholder='הזן תיאור ותפקיד היישות'
                    rows={3}
                    status={form.formState.errors.description ? 'error' : undefined}
                    style={{ direction: 'rtl', width: '100%' }}
                  />
                )}
              />
              {form.formState.errors.description && (
                <Text type='danger' style={{ fontSize: 12, display: 'block' }}>
                  {form.formState.errors.description.message}
                </Text>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Links Section */}
      {showGeneralSection && <LinksSection />}

      {/* Monitor Section - Dynamic fields per system */}
      {showMonitorSection && systemId && <MonitorSection systemId={systemId} />}
    </>
  )
})

Step1Content.displayName = 'Step1Content'
