import { useCallback, useMemo, useState } from 'react'
import { Button, Modal, Stack } from '@mantine/core'
import { EntityFlowContent } from './EntityFlowContent'
import { useEntityFlowState } from './hooks/useEntityFlowState'

export function CreateEntityModal() {
  const [opened, setOpened] = useState(false)
  const controller = useEntityFlowState()
  // Pass the controller object downstream to avoid prop drilling and keep hooks colocated
  const { resetFlowState } = controller

  const handleOpen = useCallback(() => setOpened(true), [])
  const handleClose = useCallback(() => {
    setOpened(false)
    resetFlowState()
  }, [resetFlowState])

  const modalBodyStyles = useMemo(
    () => ({
      body: {
        minHeight: 640,
        display: 'flex',
        flexDirection: 'column' as const,
      },
    }),
    []
  )

  return (
    <>
      <Button onClick={handleOpen}>Create entity</Button>
      <Modal
        opened={opened}
        onClose={handleClose}
        title='Create new entity'
        size='xl'
        radius='md'
        styles={modalBodyStyles}
      >
        <Stack style={{ flex: 1 }}>
          <EntityFlowContent controller={controller} onClose={handleClose} />
        </Stack>
      </Modal>
    </>
  )
}
