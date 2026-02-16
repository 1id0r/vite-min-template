import { useCallback, useState } from 'react'
import { Drawer, Button } from 'antd'
import { IconPlus, IconX } from '@tabler/icons-react'
import { GenericButton } from '../GenericButton'
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
      <GenericButton
        variant='filled'
        buttonType='textWithIcon'
        text='הוספת יישות'
        icon={IconPlus}
        iconPosition='right'
        onClick={handleOpen}
      />
      <Drawer
        open={opened}
        onClose={handleClose}
        title='הוספת יישות'
        placement='right'
        size={560}
        closeIcon={null}
        extra={<Button type='text' onClick={handleClose} icon={<IconX size={24} color='gray' />} />}
        styles={{
          header: { direction: 'rtl', borderBottom: 'none' },
          body: { height: 'calc(100% - 60px)', padding: 0 },
        }}
      >
        <EntityForm onSave={handleSave} onClose={handleClose} />
      </Drawer>
    </>
  )
}
