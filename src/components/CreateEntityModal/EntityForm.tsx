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

import { memo, useState, type ReactNode } from 'react'
import { FormProvider } from 'react-hook-form'
import { Space } from 'antd'
import { GenericButton } from '../GenericButton'
import { Step1Content, type Step1ContentProps } from './steps/Step1_Details/Step1Content'
import { Step2Content } from './steps/Step2_Rules/Step2Content'
import { FormStepper } from './components/FormStepper'
import { useEntityForm, type EntityFormData } from './hooks/useEntityForm'
import { ResultSummary } from './components/ResultSummary'

interface EntityFormProps {
  onSave?: (data: EntityFormData) => void
  onClose?: () => void
}

// Props needed to render step content - same as Step1ContentProps
type StepRenderProps = Step1ContentProps

// Step definition with render function
interface StepDefinition {
  value: number
  label: string
  render: (props: StepRenderProps) => ReactNode
}

// Step definitions with component render functions
const STEPS: StepDefinition[] = [
  {
    value: 1,
    label: 'פרטי ישות',
    render: (props) => (
      <Step1Content
        flow={props.flow}
        flowOptions={props.flowOptions}
        systemId={props.systemId}
        categoryId={props.categoryId}
        categories={props.categories}
        systems={props.systems}
        showSystemSelector={props.showSystemSelector}
        showGeneralSection={props.showGeneralSection}
        showMonitorSection={props.showMonitorSection}
        onFlowChange={props.onFlowChange}
        onCategoryChange={props.onCategoryChange}
        onSystemChange={props.onSystemChange}
      />
    ),
  },
  {
    value: 2,
    label: 'הצמדות וחוקים',
    render: (props) => <Step2Content systemId={props.systemId} />,
  },
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
        {/* Fixed Header - Stepper */}
        <div style={{ padding: '8px 12px 0' }}>
          <FormStepper currentStep={currentStep} steps={STEPS} />
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <Space direction='vertical' size='middle' style={{ width: '100%' }}>
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
