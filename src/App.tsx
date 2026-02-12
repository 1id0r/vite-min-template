import '@mantine/core/styles.css'
import { Container, MantineProvider, Stack, Title } from '@mantine/core'
import { ConfigProvider } from 'antd'
import { mantineTheme, antdTheme } from './theme'
import { CreateEntityModal } from './components/CreateEntityModal'
import { ButtonShowcase } from './ButtonShowcase'

export default function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <MantineProvider theme={mantineTheme}>
        <Container size='md' py='xl'>
          <Stack gap='lg' align='flex-start'>
            <Title order={2}>Monitoring dashboard</Title>
            <ButtonShowcase />
            <CreateEntityModal />
          </Stack>
        </Container>
      </MantineProvider>
    </ConfigProvider>
  )
}
