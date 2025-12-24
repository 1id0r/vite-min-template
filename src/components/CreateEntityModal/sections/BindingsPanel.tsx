/**
 * BindingsPanel - Collapsible Panel for Bindings
 *
 * Contains BindingsStep with tabs for "מדידות" (Measurements/Tree) and "הצמדות" (Attachments).
 * Collapsible for space management.
 */

import { memo, useState } from 'react'
import { Box, Collapse, Text, UnstyledButton, Group } from '@mantine/core'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import type { Attachment } from '../../../types/entity'
import type { TreeSelection } from '../../../types/tree'
import { BindingsStep } from '../BindingsStep/BindingsStep'

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
    <Box
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#FAFAFA',
      }}
    >
      {/* Collapsible Header */}
      <UnstyledButton
        onClick={toggleExpanded}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: '#FFFFFF',
          borderBottom: isExpanded ? '1px solid #E5E7EB' : 'none',
        }}
      >
        <Group justify='space-between'>
          <Text size='sm' fw={700} c='gray.8'>
            הצמדות
          </Text>
          {isExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
        </Group>
      </UnstyledButton>

      {/* Collapsible Content - BindingsStep with its own tabs */}
      <Collapse in={isExpanded}>
        <Box p='md'>
          <BindingsStep
            treeSelection={measurements}
            onTreeSelectionChange={onMeasurementsChange}
            attachments={attachments}
            onAttachmentsChange={onAttachmentsChange}
          />
        </Box>
      </Collapse>
    </Box>
  )
})

BindingsPanel.displayName = 'BindingsPanel'
