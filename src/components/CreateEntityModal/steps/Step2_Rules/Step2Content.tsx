/**
 * Step2Content - Rules & Bindings Step
 *
 * Contains the complete content for Step 2 of the entity creation wizard:
 * - Tabs for Rules and Bindings
 */

import { memo } from 'react'
import { Tabs } from 'antd'
import { RulesTab } from './RulesTab'
import { BindingsTab } from './BindingsTab'

// Mapping from systemId (staticConfig) to rule entity type (ruleSchemas)
const RULE_ENTITY_MAPPING: Record<string, string> = {
  vm_linux: 'linux',
  vm_windows: 'windows',
  mongo_k: 'mongok',
  s3_db: 's3',
  hadoop_hdfs: 'hdfs',
  // Add other mappings as needed, defaulting to exact match if not found
}

export interface Step2ContentProps {
  systemId: string | null
}

export const Step2Content = memo(function Step2Content({ systemId }: Step2ContentProps) {
  const entityType = (systemId && RULE_ENTITY_MAPPING[systemId]) || systemId || 'linux'

  return (
    <Tabs
      defaultActiveKey='rules'
      items={[
        {
          key: 'rules',
          label: 'חוקים על יישות',
          children: (
            <div style={{ padding: '16px 0' }}>
              <RulesTab entityType={entityType} />
            </div>
          ),
        },
        {
          key: 'bindings',
          label: 'הצמדות וחוקים',
          children: (
            <div style={{ padding: '10px 0' }}>
              <BindingsTab />
            </div>
          ),
        },
      ]}
      style={{ direction: 'rtl', width: '100%' }}
      tabBarStyle={{ marginBottom: 12 }}
      tabBarGutter={32}
    />
  )
})
