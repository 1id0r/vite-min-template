/**
 * SelectionTags Component
 *
 * Displays selected tree items as removable tags.
 */

import { memo } from 'react'
import { Card, Space, Tag, Typography } from 'antd'
import type { TreeSelectionList } from '../../../../../types/tree'

const { Text } = Typography

interface SelectionTagsProps {
  selection: TreeSelectionList
  onRemove: (vid: string) => void
}

export const SelectionTags = memo(function SelectionTags({ selection, onRemove }: SelectionTagsProps) {
  return (
    <div>
      <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
        בחירות
      </Text>
      <Card size='small'>
        {selection.length === 0 ?
          <Text type='secondary' style={{ fontSize: 12 }}>
            הוסיפו פריטים באמצעות הסימן +
          </Text>
        : <Space size={4} wrap>
            {selection.map((item) => (
              <Tag key={item.vid} color='blue' closable onClose={() => onRemove(item.vid)}>
                {item.displayName}
              </Tag>
            ))}
          </Space>
        }
      </Card>
    </div>
  )
})
