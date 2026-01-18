import { useState, useMemo } from 'react'
import { getEntityRules } from '../../../schemas/ruleSchemas'

interface RuleInstance {
  ruleKey: string
  ruleLabel: string
}

interface UseRuleInstancesResult {
  // State
  selectedRules: string[]
  ruleInstances: RuleInstance[]
  ruleOptions: Array<{ value: string; label: string }>
  groupedInstances: Record<string, { label: string; indices: number[] }>
  
  // Actions
  handleSelectionChange: (selected: string[]) => void
  handleRemove: (idx: number) => void
  handleAddMore: (ruleKey: string) => void
  
  // Severity tracking
  instanceSeverities: Record<number, string>
  handleSeverityChange: (idx: number, severity: string) => void
}

/**
 * Reusable hook for managing rule instances
 * Handles: selection, removal, adding more, severity tracking
 */
export function useRuleInstances(entityType: string): UseRuleInstancesResult {
  const [selectedRules, setSelectedRules] = useState<string[]>([])
  const [ruleInstances, setRuleInstances] = useState<RuleInstance[]>([])
  const [instanceSeverities, setInstanceSeverities] = useState<Record<number, string>>({})

  const availableRules = useMemo(() => getEntityRules(entityType), [entityType])

  const ruleOptions = useMemo(
    () =>
      Object.entries(availableRules).map(([key, def]) => ({
        value: key,
        label: def.labelHe || def.label,
      })),
    [availableRules]
  )

  // Group instances by ruleKey for display
  const groupedInstances = useMemo(() => {
    const groups: Record<string, { label: string; indices: number[] }> = {}
    ruleInstances.forEach((inst, idx) => {
      if (!groups[inst.ruleKey]) {
        groups[inst.ruleKey] = { label: inst.ruleLabel, indices: [] }
      }
      groups[inst.ruleKey].indices.push(idx)
    })
    return groups
  }, [ruleInstances])

  const handleSelectionChange = (selected: string[]) => {
    // Add new rules
    selected.forEach((key) => {
      if (!selectedRules.includes(key)) {
        const ruleDef = availableRules[key]
        if (ruleDef) {
          setRuleInstances((prev) => [
            ...prev,
            { ruleKey: key, ruleLabel: ruleDef.labelHe || ruleDef.label },
          ])
        }
      }
    })
    // Remove deselected rules
    setRuleInstances((prev) => prev.filter((r) => selected.includes(r.ruleKey)))
    setSelectedRules(selected)
  }

  const handleRemove = (idx: number) => {
    const removed = ruleInstances[idx]
    setRuleInstances((prev) => prev.filter((_, i) => i !== idx))
    setSelectedRules((prev) => {
      const remaining = ruleInstances.filter((_, i) => i !== idx)
      if (!remaining.some((r) => r.ruleKey === removed.ruleKey)) {
        return prev.filter((k) => k !== removed.ruleKey)
      }
      return prev
    })
    // Clean up severity
    setInstanceSeverities((prev) => {
      const next = { ...prev }
      delete next[idx]
      return next
    })
  }

  const handleAddMore = (ruleKey: string) => {
    const ruleDef = availableRules[ruleKey]
    if (ruleDef) {
      setRuleInstances((prev) => [
        ...prev,
        { ruleKey, ruleLabel: ruleDef.labelHe || ruleDef.label },
      ])
    }
  }

  const handleSeverityChange = (idx: number, severity: string) => {
    setInstanceSeverities((prev) => ({ ...prev, [idx]: severity }))
  }

  return {
    selectedRules,
    ruleInstances,
    ruleOptions,
    groupedInstances,
    handleSelectionChange,
    handleRemove,
    handleAddMore,
    instanceSeverities,
    handleSeverityChange,
  }
}
