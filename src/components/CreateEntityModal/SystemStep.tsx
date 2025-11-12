import type { CategoryDefinition, SystemDefinition } from '../../types/entity'
import { DisplayIconMenu } from './DisplayIconMenu'
import { SystemSelectionPanel } from './SystemSelectionPanel'
import { DISPLAY_FLOW_ID, DISPLAY_FLOW_SYSTEM_IDS, categoryPrefixIcon, fallbackCategoryIcon, fallbackSystemIcon, resolveIcon } from './iconRegistry'
import type { FlowId, FlowOption } from './types'

interface SystemStepProps {
  flow: FlowId
  flowOptions: FlowOption[]
  onFlowChange: (value: string) => void
  flowDescription?: string
  categories: CategoryDefinition[]
  systems: Record<string, SystemDefinition>
  selectedSystem: string | null
  selectedSystemConfig: SystemDefinition | null
  onSystemSelect: (systemId: string) => void
  onIconAnnotate: (systemId: string, iconName?: string) => void
}

export function SystemStep({
  flow,
  flowOptions,
  onFlowChange,
  flowDescription,
  categories,
  systems,
  selectedSystem,
  selectedSystemConfig,
  onSystemSelect,
  onIconAnnotate,
}: SystemStepProps) {
  if (flow === DISPLAY_FLOW_ID) {
    return (
      <DisplayIconMenu
        systems={systems}
        allowedSystemIds={DISPLAY_FLOW_SYSTEM_IDS}
        selectedSystem={selectedSystem}
        onSystemSelect={onSystemSelect}
        onIconSelect={(systemId, iconName) => {
          onIconAnnotate(systemId, iconName)
          onSystemSelect(systemId)
        }}
        flowOptions={flowOptions}
        activeFlow={flow}
        onFlowChange={onFlowChange}
        flowDescription={flowDescription}
        fallbackSystemIcon={fallbackSystemIcon}
      />
    )
  }

  return (
    <SystemSelectionPanel
      categories={categories}
      systems={systems}
      selectedSystem={selectedSystem}
      selectedSystemConfig={selectedSystemConfig ?? null}
      flowOptions={flowOptions}
      activeFlow={flow}
      onFlowChange={onFlowChange}
      flowDescription={flowDescription}
      onSystemSelect={onSystemSelect}
      resolveIcon={resolveIcon}
      fallbackCategoryIcon={fallbackCategoryIcon}
      fallbackSystemIcon={fallbackSystemIcon}
      prefixIcon={categoryPrefixIcon}
    />
  )
}
