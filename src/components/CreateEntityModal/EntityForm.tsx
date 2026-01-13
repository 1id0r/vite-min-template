/**
 * EntityForm - Dynamic Entity Creation Form
 *
 * Main form component with 2-step wizard:
 * - Step 1: פרטי ישות (Entity Details) - name, description, links, entity-specific fields
 * - Step 2: הצמדות וחוקים (Bindings & Rules) - TBD
 *
 * For monitor flow: Shows category/entity selectors, then dynamic fields
 * For display flow: Shows general fields + icon selection
 */

import { memo, useState } from 'react'
import { FormProvider, Controller } from 'react-hook-form'
import { Button, Input, Typography, Space } from 'antd'
import { FlowSelector } from './FlowSelector'
import { DisplayIconMenu } from './DisplayIconMenu'
import { MonitorSection, CategorySystemSelector, LinksSection } from './sections'
import { FormStepper } from './FormStepper'
import { useEntityForm, type EntityFormData } from './hooks/useEntityForm'
import { DISPLAY_FLOW_SYSTEM_IDS, fallbackSystemIcon } from './iconRegistry'
import { ResultSummary } from './ResultSummary'

const { Text } = Typography
const { TextArea } = Input

interface EntityFormProps {
  onSave?: (data: EntityFormData) => void
  onClose?: () => void
}

// Step definitions
const STEPS = [
  { value: 1, label: 'פרטי ישות' },
  { value: 2, label: 'הצמדות וחוקים' },
]

export const EntityForm = memo(function EntityForm({ onSave }: EntityFormProps) {
  const [submittedData, setSubmittedData] = useState<EntityFormData | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  const handleSaveWithResult = (data: EntityFormData) => {
    setSubmittedData(data)
    onSave?.(data)
  }

  const {
    form,
    flow,
    systemId,
    categoryId,
    categories,
    systems,
    showSystemSelector,
    showGeneralSection,
    showIconMenu,
    showMonitorSection,
    handleFlowChange,
    handleCategoryChange,
    handleSystemSelect,
    handleIconSelect,
    handleSave,
  } = useEntityForm(handleSaveWithResult)

  // If we have submitted data, show the result summary
  if (submittedData) {
    return <ResultSummary result={submittedData as any} onClose={() => setSubmittedData(null)} />
  }

  // Flow options for selector
  const flowOptions = [
    { value: 'monitor', label: 'מוצר פעיל' },
    { value: 'display', label: 'מוצר תצוגה' },
  ]

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const isNextDisabled = flow === 'monitor' && !systemId

  return (
    <FormProvider {...form}>
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <Space direction='vertical' size='middle' style={{ width: '100%' }}>
            {/* Flow Selector - Always visible */}
            <FlowSelector
              flow={flow}
              flowOptions={flowOptions}
              onFlowChange={(value) => handleFlowChange(value as 'monitor' | 'display')}
            />

            {/* Stepper - Shows current step */}
            <FormStepper currentStep={currentStep} steps={STEPS} />

            {/* Step 1: Entity Details */}
            {currentStep === 1 && (
              <>
                {/* פרטים כלליים Section Header */}
                <Text strong style={{ fontSize: 16, display: 'block', textAlign: 'right', marginBottom: 16 }}>
                  פרטים כלליים
                </Text>

                {/* Category and Entity Selectors - Only for monitor flow */}
                {showSystemSelector && (
                  <CategorySystemSelector
                    categories={categories}
                    systems={systems}
                    selectedCategory={categoryId}
                    selectedSystem={systemId}
                    onCategoryChange={handleCategoryChange}
                    onSystemChange={handleSystemSelect}
                  />
                )}

                {/* Name and Description - Visible after system selection */}
                {showGeneralSection && (
                  <div style={{ direction: 'rtl' }}>
                    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start' }}>
                      <Text strong style={{ fontSize: 14, width: 100, marginLeft: 16, marginTop: 5 }}>
                        שם מוצר <span style={{ color: '#ff4d4f' }}>*</span>
                      </Text>
                      <div style={{ flex: 1 }}>
                        <Controller
                          name='displayName'
                          control={form.control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder='הזן שם מוצר'
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
                        תיאור <span style={{ color: '#ff4d4f' }}>*</span>
                      </Text>
                      <div style={{ flex: 1 }}>
                        <Controller
                          name='description'
                          control={form.control}
                          render={({ field }) => (
                            <TextArea
                              {...field}
                              placeholder='הזן תיאור ותפקיד המוצר'
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

                {/* Icon Menu - For display flow or monitor+general system */}
                {showIconMenu && (
                  <DisplayIconMenu
                    systems={systems}
                    allowedSystemIds={DISPLAY_FLOW_SYSTEM_IDS}
                    selectedSystem={systemId}
                    selectedIconId={form.watch('icon')}
                    onIconSelect={handleIconSelect}
                    fallbackSystemIcon={fallbackSystemIcon}
                  />
                )}
              </>
            )}

            {/* Step 2: Bindings & Rules - TBD */}
            {currentStep === 2 && (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <Text type='secondary'>הצמדות וחוקים - בקרוב</Text>
              </div>
            )}
          </Space>
        </div>

        {/* Footer with Next/Save Button */}
        <div
          style={{
            padding: 16,
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
          }}
        >
          {currentStep === 1 ? (
            <Button type='primary' block size='large' onClick={handleNext} disabled={isNextDisabled}>
              הבא
            </Button>
          ) : (
            <Button type='primary' block size='large' onClick={handleSave}>
              שמור
            </Button>
          )}
        </div>
      </div>
    </FormProvider>
  )
})

EntityForm.displayName = 'EntityForm'
