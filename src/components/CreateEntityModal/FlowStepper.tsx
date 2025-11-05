import { Stepper } from '@mantine/core'
import type { StepDefinition, StepKey } from '../../types/entity'

interface FlowStepperProps {
  stepKeys: StepKey[]
  activeStep: number
  definitions?: Record<StepKey, StepDefinition>
}

export function FlowStepper({ stepKeys, activeStep, definitions }: FlowStepperProps) {
  return (
    <Stepper
      active={activeStep}
      allowNextStepsSelect={false}
      styles={(theme) => ({
        step: {
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        },
        stepBody: {
          marginLeft: 0,
          marginTop: theme.spacing.xs,
        },
        stepLabel: {
          fontSize: theme.fontSizes.sm,
          fontWeight: 500,
        },
      })}
    >
      {stepKeys.map((key) => {
        const definition = definitions?.[key]
        return <Stepper.Step key={key} label={definition?.label ?? key} />
      })}
      <Stepper.Completed>{null}</Stepper.Completed>
    </Stepper>
  )
}
