/**
 * useEntityValidation - Entity Existence Validation Hook
 * 
 * Manages validation state and API calls to check if an entity exists.
 * Provides hermetic validation: Next button only active after successful validation,
 * and validation resets when monitored fields change.
 * 
 * Uses validation config from monitorFieldConfigs.ts
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { getMonitorFieldConfig } from '../../../schemas/monitorFieldConfigs'

const API_BASE_URL = 'http://localhost:8100/eav/isExist'

export type ValidationStatus = 'idle' | 'loading' | 'valid' | 'invalid'

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export interface UseEntityValidationReturn {
  /** Current validation status */
  validationStatus: ValidationStatus
  /** Error message when validation fails */
  validationError: string | null
  /** Trigger validation API call */
  validate: (systemId: string, monitorData: Record<string, unknown>) => Promise<void>
  /** Reset validation to idle state */
  resetValidation: () => void
  /** Whether this system supports validation */
  supportsValidation: (systemId: string) => boolean
}

export function useEntityValidation(): UseEntityValidationReturn {
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle')
  const [validationError, setValidationError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const validate = useCallback(async (
    systemId: string, 
    monitorData: Record<string, unknown>
  ): Promise<void> => {
    const config = getMonitorFieldConfig(systemId)
    
    if (!config.validationEndpoint || !config.validationFieldMapping) {
      setValidationStatus('invalid')
      setValidationError('Validation not configured for this system')
      return
    }

    // Build URL: base/endpoint
    const url = `${API_BASE_URL}/${config.validationEndpoint}`
    
    // Build body from field mapping
    const body: Record<string, unknown> = {}
    for (const [formField, apiField] of Object.entries(config.validationFieldMapping)) {
      if (monitorData[formField] !== undefined) {
        body[apiField] = monitorData[formField]
      }
    }

    // Cancel any in-progress request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    setValidationStatus('loading')
    setValidationError(null)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const result: ValidationResult = await response.json()

      if (result.isValid) {
        setValidationStatus('valid')
        setValidationError(null)
      } else {
        setValidationStatus('invalid')
        setValidationError(result.error || 'Validation failed')
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't update state
        return
      }
      setValidationStatus('invalid')
      setValidationError(error instanceof Error ? error.message : 'Validation request failed')
    }
  }, [])

  const resetValidation = useCallback(() => {
    abortControllerRef.current?.abort()
    setValidationStatus('idle')
    setValidationError(null)
  }, [])

  const supportsValidation = useCallback((systemId: string): boolean => {
    const config = getMonitorFieldConfig(systemId)
    return !!config.validationEndpoint && !!config.validationFieldMapping
  }, [])

  return {
    validationStatus,
    validationError,
    validate,
    resetValidation,
    supportsValidation,
  }
}
