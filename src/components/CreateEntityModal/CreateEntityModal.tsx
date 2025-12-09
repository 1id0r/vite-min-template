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
      <Modal opened={opened} onClose={handleClose} title='יצירת יישות חדשה' size='xl' radius='md'>
        <EntityFlowContent controller={controller} onClose={handleClose} />
      </Modal>
    </>
  )
}
