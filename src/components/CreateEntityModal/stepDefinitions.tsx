/**
 * Step Definitions
 *
 * Defines the wizard steps for the entity creation form.
 * Each step has a value, label, and render function.
 */

import type { ReactNode } from 'react'
import { Step1Content, type Step1ContentProps } from './steps/Step1_Details/Step1Content'
import { Step2Content } from './steps/Step2_Rules/Step2Content'

// Props needed to render step content - extends Step1ContentProps
export type StepRenderProps = Step1ContentProps

// Step definition with render function
export interface StepDefinition {
  value: number
  label: string
  render: (props: StepRenderProps) => ReactNode
}

// Step definitions with component render functions
export const STEPS: StepDefinition[] = [
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
        showIconSelector={props.showIconSelector}
        onFlowChange={props.onFlowChange}
        onCategoryChange={props.onCategoryChange}
        onSystemChange={props.onSystemChange}
        validationStatus={props.validationStatus}
        validationError={props.validationError}
        onValidate={props.onValidate}
        onResetValidation={props.onResetValidation}
      />
    ),
  },
  {
    value: 2,
    label: 'הצמדות וחוקים',
    render: (props) => <Step2Content systemId={props.systemId} />,
  },
]
