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
import { Input, Typography, Space, Tabs } from 'antd'
import { GenericButton } from '../GenericButton'
import { FlowSelector } from './FlowSelector'
import { MonitorSection, CategorySystemSelector, LinksSection } from './sections'
import { RulesTab } from './sections/RulesTab'
import { BindingsTab } from './sections/BindingsTab'
import { FormStepper } from './FormStepper'
import { useEntityForm, type EntityFormData } from './hooks/useEntityForm'
import { ResultSummary } from './ResultSummary'

const { Text } = Typography
const { TextArea } = Input

interface EntityFormProps {
  onSave?: (data: EntityFormData) => void
  onClose?: () => void
}

// Mapping from systemId (staticConfig) to rule entity type (ruleSchemas)
const RULE_ENTITY_MAPPING: Record<string, string> = {
  vm_linux: 'linux',
  vm_windows: 'windows',
  mongo_k: 'mongok',
  s3_db: 's3',
  hadoop_hdfs: 'hdfs',
  // Add other mappings as needed, defaulting to exact match if not found
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
    showMonitorSection,
    handleFlowChange,
    handleCategoryChange,
    handleSystemSelect,
    handleSave,
  } = useEntityForm(handleSaveWithResult)

  // If we have submitted data, show the result summary
  if (submittedData) {
    return <ResultSummary result={submittedData} onClose={() => setSubmittedData(null)} />
  }

  // Flow options for selector
  const flowOptions = [
    { value: 'monitor', label: 'יישות ניטור' },
    { value: 'display', label: 'יישות תצוגה' },
  ]

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
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
        {/* Fixed Header - Stepper */}
        <div style={{ padding: '8px 12px 0' }}>
          <FormStepper currentStep={currentStep} steps={STEPS} />
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <Space direction='vertical' size='middle' style={{ width: '100%' }}>
            {/* Step 1: Entity Details */}
            {currentStep === 1 && (
              <>
                {/* Flow Selector - Only visible on Step 1, below stepper */}
                <FlowSelector
                  flow={flow}
                  flowOptions={flowOptions}
                  onFlowChange={(value) => handleFlowChange(value as 'monitor' | 'display')}
                />

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
            )}

            {/* Step 2: Rules & Bindings */}
            {currentStep === 2 && (
              <Tabs
                defaultActiveKey='rules'
                type='card'
                items={[
                  {
                    key: 'rules',
                    label: 'חוקים על יישות',
                    children: (
                      <div style={{ padding: '16px 0' }}>
                        <RulesTab
                          entityType={
                            RULE_ENTITY_MAPPING[form.getValues('systemId')] || form.getValues('systemId') || 'linux'
                          }
                        />
                      </div>
                    ),
                  },
                  {
                    key: 'bindings',
                    label: 'הצמדות וחוקים',
                    children: (
                      <div style={{ padding: '16px 0' }}>
                        <BindingsTab />
                      </div>
                    ),
                  },
                ]}
                style={{ direction: 'rtl', width: '100%' }}
                tabBarStyle={{ marginBottom: 24 }}
              />
            )}
          </Space>
        </div>

        {/* Footer with Next/Save Button */}
        <div
          style={{
            padding: 16,
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          {currentStep === 1 ?
            <GenericButton
              variant='filled'
              buttonType='textOnly'
              text='הבא'
              onClick={handleNext}
              disabled={isNextDisabled}
            />
          : <>
              <GenericButton variant='outlined' buttonType='textOnly' text='חזור' onClick={handleBack} />
              <GenericButton variant='filled' buttonType='textOnly' text='יצירת יישות' onClick={handleSave} />
            </>
          }
        </div>
      </div>
    </FormProvider>
  )
})

EntityForm.displayName = 'EntityForm'
