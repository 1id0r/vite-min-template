/**
 * FormStepper - Step indicator for 2-step entity creation flow
 *
 * Displays current step in the flow:
 * 1. פרטי ישות (Entity Details)
 * 2. הצמדות וחוקים (Bindings & Rules)
 */

import { memo } from 'react'
import { Group, Text, Box } from '@mantine/core'

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
    <Group gap='xl' justify='center' py='md'>
      {steps.map((step, index) => {
        const isActive = step.value === currentStep
        const isCompleted = step.value < currentStep
        const isLast = index === steps.length - 1

        return (
          <Group key={step.value} gap='md' align='center'>
            {/* Step circle */}
            <Group gap='xs' align='center'>
              <Box
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isActive ? '#228BE6' : isCompleted ? '#228BE6' : '#E9ECEF',
                  color: isActive || isCompleted ? 'white' : '#868E96',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {step.value}
              </Box>
              <Text size='sm' fw={isActive ? 600 : 400} c={isActive ? 'dark' : 'dimmed'}>
                {step.label}
              </Text>
            </Group>

            {/* Connector line */}
            {!isLast && (
              <Box
                style={{
                  width: 60,
                  height: 2,
                  backgroundColor: isCompleted ? '#228BE6' : '#E9ECEF',
                }}
              />
            )}
          </Group>
        )
      })}
    </Group>
  )
})

FormStepper.displayName = 'FormStepper'
