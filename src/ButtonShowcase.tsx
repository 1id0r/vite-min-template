import { GenericButton } from './components/GenericButton'
import { IconCheck, IconX, IconUser, IconSettings } from '@tabler/icons-react'
import { Flex, Title, Stack } from '@mantine/core'

export function ButtonShowcase() {
  return (
    <Stack gap='md' style={{ padding: 20, border: '1px dashed #ccc', borderRadius: 8 }}>
      <Title order={4}>Button Showcase (Temporary)</Title>

      <Title order={5}>Filled (Primary)</Title>
      <Flex gap='md' wrap='wrap'>
        <GenericButton variant='filled' text='Primary Action' />
        <GenericButton variant='filled' text='With Icon' icon={IconCheck} />
        <GenericButton variant='filled' text='Right Icon' icon={IconCheck} iconPosition='right' />
        <GenericButton variant='filled' buttonType='iconOnly' icon={IconSettings} />
        <GenericButton variant='filled' text='Disabled' disabled />
      </Flex>

      <Title order={5}>Outlined (Default)</Title>
      <Flex gap='md' wrap='wrap'>
        <GenericButton variant='outlined' text='Secondary Action' />
        <GenericButton variant='outlined' text='With Icon' icon={IconUser} />
        <GenericButton variant='outlined' text='Right Icon' icon={IconUser} iconPosition='right' />
        <GenericButton variant='outlined' buttonType='iconOnly' icon={IconSettings} />
        <GenericButton variant='outlined' text='Disabled' disabled />
      </Flex>

      <Title order={5}>Link</Title>
      <Flex gap='md' wrap='wrap'>
        <GenericButton variant='link' text='Link Action' />
        <GenericButton variant='link' text='With Icon' icon={IconX} />
        <GenericButton variant='link' text='Disabled' disabled />
      </Flex>

      <Title order={5}>Danger (via Antd prop)</Title>
      <Flex gap='md' wrap='wrap'>
        <GenericButton variant='filled' text='Delete' danger />
        <GenericButton variant='outlined' text='Delete' danger icon={IconX} />
        <GenericButton variant='link' text='Delete' danger />
      </Flex>
    </Stack>
  )
}
