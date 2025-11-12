import type React from 'react'
import { MantineProvider } from '@mantine/core'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SystemStep } from '../SystemStep'
import type { FlowId } from '../types'
import { DISPLAY_FLOW_ID } from '../iconRegistry'

const baseFlowOptions = [
  { label: 'Display', value: DISPLAY_FLOW_ID },
  { label: 'Monitor', value: 'monitor' as FlowId },
]

const systems = {
  sql_server: {
    id: 'sql_server',
    label: 'SQL Server',
    category: 'databases',
    icon: 'FiBox',
    forms: {},
  },
}

const categories = [
  {
    id: 'databases',
    label: 'Databases',
    icon: 'FiDatabase',
    systemIds: ['sql_server'],
  },
]

function renderSystemStep(props: Partial<React.ComponentProps<typeof SystemStep>> = {}) {
  return render(
    <MantineProvider>
      <SystemStep
        flow={DISPLAY_FLOW_ID}
        flowOptions={baseFlowOptions}
        onFlowChange={() => {}}
        categories={categories}
        systems={systems}
        selectedSystem={null}
        selectedSystemConfig={null}
        onSystemSelect={() => {}}
        onIconAnnotate={() => {}}
        {...props}
      />
    </MantineProvider>
  )
}

describe('SystemStep', () => {
  it('advances via icon selection in display flow', async () => {
    const user = userEvent.setup()
    const annotateSpy = vi.fn()
    const selectSpy = vi.fn()

    renderSystemStep({
      flow: DISPLAY_FLOW_ID,
      onIconAnnotate: annotateSpy,
      onSystemSelect: selectSpy,
    })

    const iconButton = await screen.findByLabelText('SQL Server')
    await user.click(iconButton)

    expect(annotateSpy).toHaveBeenCalledWith('sql_server', 'FiBox')
    expect(selectSpy).toHaveBeenCalledWith('sql_server')
  })

  it('renders category buttons for non-display flows', () => {
    renderSystemStep({
      flow: 'monitor',
    })

    expect(screen.getByRole('button', { name: /databases/i })).toBeInTheDocument()
  })
})
