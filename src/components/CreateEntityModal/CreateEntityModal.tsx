import { useCallback, useState } from 'react'
import { Button, Drawer } from '@mantine/core'
import { EntityForm } from './EntityForm'

export function CreateEntityModal() {
  const [opened, setOpened] = useState(false)

  const handleOpen = useCallback(() => setOpened(true), [])
  const handleClose = useCallback(() => {
    setOpened(false)
  }, [])

  const handleSave = useCallback((data: unknown) => {
    console.log('Entity saved:', data)
    // Don't close drawer - let ResultSummary show inside EntityForm
  }, [])

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
        styles={{
          header: { direction: 'rtl' },
          body: { height: 'calc(100% - 60px)', padding: 0 },
          content: { borderRadius: '16px' },
        }}
      >
        <EntityForm onSave={handleSave} onClose={handleClose} />
      </Drawer>
    </>
  )
}
