/**
 * BindingsPanel - Collapsible Panel for Bindings
 *
 * Contains BindingsStep with tabs for "מדידות" (Measurements/Tree) and "הצמדות" (Attachments).
 * Collapsible for space management.
 */

import { memo, useState } from 'react'
import { Typography, Button } from 'antd'
import { UpOutlined, DownOutlined } from '@ant-design/icons'
import type { Attachment } from '../../../types/entity'
import type { TreeSelection } from '../../../types/tree'
import { BindingsStep } from '../BindingsStep/BindingsStep'

const { Text } = Typography

interface BindingsPanelProps {
  measurements: TreeSelection[]
  onMeasurementsChange: (measurements: TreeSelection[]) => void
  attachments: Attachment[]
  onAttachmentsChange: (attachments: Attachment[]) => void
  defaultExpanded?: boolean
}

export const BindingsPanel = memo(function BindingsPanel({
  measurements,
  onMeasurementsChange,
  attachments,
  onAttachmentsChange,
  defaultExpanded = true,
}: BindingsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggleExpanded = () => setIsExpanded(!isExpanded)

  return (
    <div
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#FAFAFA',
      }}
    >
      {/* Collapsible Header */}
      <Button
        type='text'
        onClick={toggleExpanded}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: '#FFFFFF',
          borderBottom: isExpanded ? '1px solid #E5E7EB' : 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 'auto',
          borderRadius: 0,
        }}
      >
        <Text strong style={{ fontSize: 14 }}>
          הצמדות
        </Text>
        {isExpanded ? <UpOutlined /> : <DownOutlined />}
      </Button>

      {/* Collapsible Content - BindingsStep with its own tabs */}
      {isExpanded && (
        <div style={{ padding: 16 }}>
          <BindingsStep
            treeSelection={measurements}
            onTreeSelectionChange={onMeasurementsChange}
            attachments={attachments}
            onAttachmentsChange={onAttachmentsChange}
          />
        </div>
      )}
    </div>
  )
})

BindingsPanel.displayName = 'BindingsPanel'
