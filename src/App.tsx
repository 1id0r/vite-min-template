import '@mantine/core/styles.css'
import { Container, MantineProvider, Stack, Title } from '@mantine/core'
import { theme } from './theme'
import { CreateEntityModal } from './components/CreateEntityModal'

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <Container size='md' py='xl'>
        <Stack gap='lg' align='flex-start'>
          <Title order={2}>Monitoring dashboard</Title>
          <CreateEntityModal />
        </Stack>
      </Container>
    </MantineProvider>
  )
}
