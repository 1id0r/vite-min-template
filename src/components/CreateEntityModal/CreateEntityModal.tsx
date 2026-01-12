import { useCallback, useState } from 'react'
import { Button, Drawer } from 'antd'
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
      <Button type='primary' onClick={handleOpen}>
        הוספת יישות +
      </Button>
      <Drawer
        open={opened}
        onClose={handleClose}
        title='הוספת יישות'
        placement='right'
        size={600}
        styles={{
          header: { direction: 'rtl' },
          body: { height: 'calc(100% - 60px)', padding: 0 },
        }}
      >
        <EntityForm onSave={handleSave} onClose={handleClose} />
      </Drawer>
    </>
  )
}
