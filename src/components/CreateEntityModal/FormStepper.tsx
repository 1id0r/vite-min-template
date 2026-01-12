/**
 * FormStepper - Step indicator for 2-step entity creation flow
 *
 * Displays current step in the flow:
 * 1. פרטי ישות (Entity Details)
 * 2. הצמדות וחוקים (Bindings & Rules)
 */

import { memo } from 'react'
import { Steps } from 'antd'

interface Step {
  label: string
  value: number
}

interface FormStepperProps {
  currentStep: number
  steps: Step[]
}

export const FormStepper = memo(function FormStepper({ currentStep, steps }: FormStepperProps) {
  return (
    <div
      style={{
        padding: '12px 18px',
      }}
    >
      <Steps
        current={currentStep - 1}
        direction='horizontal'
        size='default'
        style={{ direction: 'rtl' }}
        items={steps.map((step) => ({
          title: <span style={{ fontSize: '15px', fontWeight: 500 }}>{step.label}</span>,
        }))}
      />
    </div>
  )
})

FormStepper.displayName = 'FormStepper'
