import { Alert, Box, Button, Group, Stack, Text, Title } from '@mantine/core'
import type { AggregatedResult } from './types'

interface ResultSummaryProps {
  result: AggregatedResult | null
  onClose: () => void
}

function renderData(data: unknown) {
    if (!data) {
        return <Text>No data</Text>;
    }

    if (typeof data === 'object' && data !== null && 'selectedNode' in data) {
        const { selectedNode } = data as { selectedNode: string };
        return <Text>Selected Node: {selectedNode}</Text>;
    }
    
    return <Box component='pre' bg='gray.0' p='sm' style={{ overflowX: 'auto' }}>
          {JSON.stringify(data, null, 2)}
        </Box>
}

export function ResultSummary({ result, onClose }: ResultSummaryProps) {
    if (!result) {
        return null;
    }
  return (
    <Stack>
      <Alert color='green' title='Entity ready to create'>
        The configuration is assembled from API definitions. Submit it to your API or persist it as needed.
      </Alert>
      {result && (
        <Stack>
            <Title order={4}>Summary</Title>
            <Text>Flow: {result.flow}</Text>
            <Text>System ID: {result.systemId}</Text>
            {Object.entries(result.formData).map(([key, value]) => (
                <Stack key={key}>
                    <Title order={5}>{key}</Title>
                    {renderData(value)}
                </Stack>
            ))}
        </Stack>
      )}
      <Group justify='flex-end'>
        <Button onClick={onClose}>Close</Button>
      </Group>
    </Stack>
  )
}
