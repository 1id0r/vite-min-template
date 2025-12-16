import { useCallback, useState } from 'react'
import { Button, Drawer } from '@mantine/core'
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
      <Button onClick={handleOpen}>הוספת יישות +</Button>
      <Drawer
        opened={opened}
        onClose={handleClose}
        title='הוספת חטיף'
        position='left'
        size={700}
        overlayProps={{ backgroundOpacity: 0.3 }}
        padding='md'
        styles={{
          header: { direction: 'rtl' },
          body: { height: 'calc(100% - 60px)' },
          content: { borderRadius: '16px' },
        }}
      >
        <EntityFlowContent controller={controller} onClose={handleClose} />
      </Drawer>
    </>
  )
}
