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
import { FormProvider } from 'react-hook-form'
import { Space } from 'antd'
import { GenericButton } from '../GenericButton'
import { FormStepper } from './components/FormStepper'
import { useEntityForm, type EntityFormData } from './hooks/useEntityForm'
import { ResultSummary } from './components/ResultSummary'
import { STEPS, type StepRenderProps } from './stepDefinitions'
import { FlowSelector } from './steps/Step1_Details/FlowSelector'

interface EntityFormProps {
  onSave?: (data: EntityFormData) => void
  onClose?: () => void
}

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

  // Display flow is single-step (no step 2)
  const isDisplayFlow = flow === 'display'

  // Props passed to step render functions
  const stepProps: StepRenderProps = {
    flow,
    flowOptions,
    systemId,
    categoryId,
    categories,
    systems,
    showSystemSelector,
    showGeneralSection,
    showMonitorSection,
    showIconSelector: showIconMenu,
    onFlowChange: handleFlowChange,
    onCategoryChange: handleCategoryChange,
    onSystemChange: handleSystemSelect,
  }

  // Find current step and render its content
  const currentStepDef = STEPS.find((step) => step.value === currentStep)

  return (
    <FormProvider {...form}>
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Fixed Header - Flow Selector and Stepper */}
        <div style={{ padding: '8px 16px 0' }}>
          {/* Flow Selector - Always visible */}
          <div style={{ marginBottom: 16 }}>
            <FlowSelector
              flow={flow}
              flowOptions={flowOptions}
              onFlowChange={(value) => handleFlowChange(value as 'monitor' | 'display')}
            />
          </div>

          {/* Stepper (hidden for display flow) */}
          {!isDisplayFlow && <FormStepper currentStep={currentStep} steps={STEPS} />}
        </div>
        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <Space orientation='vertical' size='middle' style={{ width: '100%' }}>
            {currentStepDef?.render(stepProps)}
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
          {/* Display flow: single step with save button */}
          {isDisplayFlow ?
            <GenericButton variant='filled' buttonType='textOnly' text='יצירת יישות' onClick={handleSave} />
          : /* Monitor flow: multi-step with next/back */
          currentStep === 1 ?
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
