/**
 * ResultSummary - Dev Preview of Entity JSON
 *
 * Shows the complete EntityFormData as JSON for development/debugging.
 * This will be replaced with actual backend submission later.
 */

import { useState } from 'react'
import { Alert, Space, message } from 'antd'
import { IconCopy, IconCheck } from '@tabler/icons-react'
import { GenericButton } from '../../GenericButton'
import type { EntityFormData } from '../hooks/useEntityForm'

interface ResultSummaryProps {
  result: EntityFormData | null
  onClose: () => void
}

export function ResultSummary({ result, onClose }: ResultSummaryProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2))
      setCopied(true)
      message.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      message.error('Failed to copy')
    }
  }

  return (
    <Space orientation='vertical' style={{ width: '100%', padding: 16 }} size='middle'>
      <Alert
        type='success'
        title='Entity Data Ready'
        description='This is the complete form data that will be sent to the backend.'
        showIcon
      />

      {result && (
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
            <GenericButton
              variant='outlined'
              buttonType='iconOnly'
              icon={copied ? IconCheck : IconCopy}
              iconSize={16}
              onClick={handleCopy}
              style={{
                minWidth: 32,
                minHeight: 32,
                height: 32,
                backgroundColor: copied ? '#e6f7e6' : '#fff',
              }}
            />
          </div>
          <pre
            style={{
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              padding: '16px 16px 16px 56px',
              borderRadius: 8,
              overflowX: 'auto',
              fontSize: 12,
              fontFamily: 'Monaco, Consolas, monospace',
              maxHeight: 400,
              margin: 0,
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <GenericButton variant='outlined' buttonType='textOnly' text='Back to Edit' onClick={onClose} />
      </div>
    </Space>
  )
}
