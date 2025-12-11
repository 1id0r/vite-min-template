import { Tabs } from '@mantine/core'
import { useState } from 'react'
import type { Attachment } from '../../../types/entity'
import type { TreeSelectionList } from '../../../types/tree'
import { BindingsTab } from './BindingsTab'
import { TreeStep } from '../TreeStep'

interface BindingsStepProps {
  treeSelection: TreeSelectionList
  onTreeSelectionChange: (selection: TreeSelectionList) => void
  attachments: Attachment[]
  onAttachmentsChange: (attachments: Attachment[]) => void
}

export function BindingsStep({
  treeSelection,
  onTreeSelectionChange,
  attachments,
  onAttachmentsChange,
}: BindingsStepProps) {
  const [activeTab, setActiveTab] = useState<string | null>('measurements')

  return (
    <Tabs value={activeTab} onChange={setActiveTab} variant='outline' radius='md'>
      <Tabs.List grow mb='md'>
        <Tabs.Tab value='measurements'>מדידות</Tabs.Tab>
        <Tabs.Tab value='bindings'>הצמדות</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value='measurements'>
        <TreeStep selection={treeSelection} onSelectionChange={onTreeSelectionChange} />
      </Tabs.Panel>

      <Tabs.Panel value='bindings'>
        <BindingsTab attachments={attachments} onChange={onAttachmentsChange} />
      </Tabs.Panel>
    </Tabs>
  )
}
