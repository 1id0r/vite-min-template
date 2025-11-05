import { Alert, Box, Button, Group, Stack } from '@mantine/core'
import type { AggregatedResult } from './types'

interface ResultSummaryProps {
  result: AggregatedResult | null
  onClose: () => void
}

export function ResultSummary({ result, onClose }: ResultSummaryProps) {
  return (
    <Stack>
      <Alert color='green' title='Entity ready to create'>
        The configuration is assembled from API definitions. Submit it to your API or persist it as needed.
      </Alert>
      {result && (
        <Box component='pre' bg='gray.0' p='sm' style={{ overflowX: 'auto' }}>
          {JSON.stringify(result, null, 2)}
        </Box>
      )}
      <Group justify='flex-end'>
        <Button onClick={onClose}>Close</Button>
      </Group>
    </Stack>
  )
}
