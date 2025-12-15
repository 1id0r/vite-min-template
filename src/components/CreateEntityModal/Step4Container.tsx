import { useState } from 'react'
import { Tabs } from '@mantine/core'
import { TreeStep } from './TreeStep'
import { AttachmentsTab } from './AttachmentsTab'
import type { TreeSelectionList } from '../../types/tree'
import type { AttachmentList } from '../../types/entity'

interface Step4ContainerProps {
  treeSelection: TreeSelectionList
  onTreeSelectionChange: (selection: TreeSelectionList) => void
  attachments: AttachmentList
  onAttachmentsChange: (attachments: AttachmentList) => void
}

export function Step4Container({
  treeSelection,
  onTreeSelectionChange,
  attachments,
  onAttachmentsChange,
}: Step4ContainerProps) {
  const [activeTab, setActiveTab] = useState<string | null>('measurements')

  return (
    <Tabs value={activeTab} onChange={setActiveTab} variant='outline' keepMounted={false}>
      <Tabs.List grow>
        <Tabs.Tab value='measurements'>מדידות</Tabs.Tab>
        <Tabs.Tab value='attachments'>הצמדות</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value='measurements' pt='xs'>
        <TreeStep selection={treeSelection} onSelectionChange={onTreeSelectionChange} />
      </Tabs.Panel>

      <Tabs.Panel value='attachments' pt='xs'>
        <AttachmentsTab attachments={attachments} onChange={onAttachmentsChange} />
      </Tabs.Panel>
    </Tabs>
  )
}
