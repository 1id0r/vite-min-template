import { Box, Group, Stack, Text } from '@mantine/core'
import { FiCheck } from 'react-icons/fi'
import type { StepDefinition, StepKey } from '../../types/entity'

interface FlowStepperProps {
  stepKeys: StepKey[]
  activeStep: number
  definitions?: Record<StepKey, StepDefinition>
}

export function FlowStepper({ stepKeys, activeStep, definitions }: FlowStepperProps) {
  const orderedKeys = [...stepKeys].reverse()

  return (
    <Group
      dir='ltr'
      gap='lg'
      align='center'
      justify='center'
      style={{
        width: '100%',
        margin: '0 auto',
      }}
    >
      {orderedKeys.map((key, index) => {
        const originalIndex = stepKeys.length - 1 - index
        const label = key === 'tree' ? 'הצמדות' : definitions?.[key]?.label ?? key
        const state = getStepState(originalIndex, activeStep)
        const isLast = index === orderedKeys.length - 1
        const displayNumber = originalIndex + 1

        return (
          <Group key={key} gap='xs' align='right' style={{ minWidth: 80 }}>
            <Stack align='center' gap={6}>
              <StepCircle index={displayNumber} state={state} />
              <Text
                size='sm'
                fw={600}
                c={state === 'inactive' ? '#90A1C0' : '#0B5FFF'}
                style={{ whiteSpace: 'nowrap' }}
              >
                {label}
              </Text>
            </Stack>
            {!isLast && <Connector state={state} />}
          </Group>
        )
      })}
    </Group>
  )
}

type StepState = 'completed' | 'active' | 'inactive'

function getStepState(index: number, activeStep: number): StepState {
  if (index < activeStep) {
    return 'completed'
  }
  if (index === activeStep) {
    return 'active'
  }
  return 'inactive'
}

function StepCircle({ index, state }: { index: number; state: StepState }) {
  const background = state === 'active' ? '#0B5FFF' : state === 'completed' ? '#DDE7FF' : 'rgba(11,95,255,0.18)'
  const color = state === 'active' ? '#FFFFFF' : state === 'completed' ? '#0B5FFF' : '#5A6A85'

  return (
    <Box
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
      }}
    >
      {state === 'completed' ? <FiCheck size={16} /> : index}
    </Box>
  )
}

function Connector({ state }: { state: StepState }) {
  const color = state === 'completed' || state === 'active' ? '#0B5FFF' : 'rgba(11, 95, 255, 0.25)'
  return (
    <Box
      style={{
        height: 2,
        borderRadius: 2,
        backgroundColor: color,
        width: 'clamp(10px, 60px, 100px)',
        marginTop: 18,
      }}
    />
  )
}
