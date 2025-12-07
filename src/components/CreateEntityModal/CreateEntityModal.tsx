import { useCallback, useState } from 'react'
import { Button, Modal } from '@mantine/core'
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

  return (
    <>
      <Button onClick={handleOpen}>Create entity</Button>
      <Modal
        opened={opened}
        onClose={handleClose}
        title='Create new entity'
        size='xl'
        radius='md'
        styles={{
          content: {
            height: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            paddingTop: 0,
          },
          header: {
            paddingBottom: 0,
          },
        }}
      >
        <EntityFlowContent controller={controller} onClose={handleClose} />
      </Modal>
    </>
  )
}
