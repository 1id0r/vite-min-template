import { Alert, Button, Space } from 'antd'
import type { AggregatedResult } from './types'

interface ResultSummaryProps {
  result: AggregatedResult | null
  onClose: () => void
}

export function ResultSummary({ result, onClose }: ResultSummaryProps) {
  return (
    <Space direction='vertical' style={{ width: '100%', padding: 16 }} size='middle'>
      <Alert
        type='success'
        message='Entity ready to create'
        description='The configuration is assembled from API definitions. Submit it to your API or persist it as needed.'
        showIcon
      />
      {result && (
        <pre
          style={{
            backgroundColor: '#f5f5f5',
            padding: 12,
            borderRadius: 8,
            overflowX: 'auto',
            fontSize: 12,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>Close</Button>
      </div>
    </Space>
  )
}
