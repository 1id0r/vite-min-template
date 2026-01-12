import { Tabs } from 'antd'
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
  const [activeTab, setActiveTab] = useState<string>('measurements')

  const items = [
    {
      key: 'measurements',
      label: 'מדידות',
      children: <TreeStep selection={treeSelection} onSelectionChange={onTreeSelectionChange} />,
    },
    {
      key: 'bindings',
      label: 'הצמדות',
      children: <BindingsTab attachments={attachments} onChange={onAttachmentsChange} />,
    },
  ]

  return <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} style={{ direction: 'rtl' }} />
}
