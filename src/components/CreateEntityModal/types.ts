export type FlowId = 'monitor' | 'display' | 'general'

export type FormStatus = 'idle' | 'loading' | 'success' | 'error'

export interface FlowOption {
  label: string
  value: string
}

export interface AggregatedResult {
  flow: FlowId
  systemId: string
  formData: Record<string, unknown>
}
