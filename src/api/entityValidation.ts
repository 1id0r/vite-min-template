/**
 * Entity Validation API
 *
 * Validates entity details against the backend API before allowing
 * users to proceed to step 2 of entity creation.
 *
 * API: GET http://localhost:8100/eav/isexist/{Entity}
 * Headers: Entity-specific parameters
 * Response: { isValid: boolean, error: string }
 */

import { getMonitorFieldConfig, type ValidationConfig } from '../schemas/fieldConfigs'

const VALIDATION_API_BASE = 'http://localhost:8100/eav/isexist'

/** Validation API response shape */
export interface ValidationResponse {
  isValid: boolean
  error: string
}

/**
 * Get validation config for a system ID.
 * Returns undefined if the system doesn't support validation.
 */
function getValidationConfig(systemId: string): ValidationConfig | undefined {
  const fieldConfig = getMonitorFieldConfig(systemId)
  return fieldConfig.validation
}

/**
 * Validate entity details against the backend API.
 *
 * @param systemId - The system/entity type ID from the form
 * @param monitorData - The monitor field data from the form (e.g., { cluster: 'xyz', consumer_group: 'abc' })
 * @returns Promise<ValidationResponse> - The validation result
 */
export async function validateEntity(
  systemId: string,
  monitorData: Record<string, unknown>
): Promise<ValidationResponse> {
  const config = getValidationConfig(systemId)

  // If no validation config exists for this entity, assume it's valid
  if (!config) {
    console.warn(`No validation config for systemId: ${systemId}. Skipping validation.`)
    return { isValid: true, error: '' }
  }

  // Build headers from monitor data using field mappings
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  for (const [formField, headerName] of Object.entries(config.fieldMappings)) {
    const value = monitorData[formField]
    if (value !== undefined && value !== null && value !== '') {
      headers[headerName] = String(value)
    }
  }

  const url = `${VALIDATION_API_BASE}/${config.entityName}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      // Try to parse error message from response
      try {
        const errorBody = await response.json()
        return {
          isValid: false,
          error: errorBody.error || errorBody.detail || `Request failed with status ${response.status}`,
        }
      } catch {
        return {
          isValid: false,
          error: `Request failed with status ${response.status}`,
        }
      }
    }

    const data = (await response.json()) as ValidationResponse
    return data
  } catch (error) {
    // Network error or other failure
    console.error('Entity validation failed:', error)
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Validation request failed',
    }
  }
}

/**
 * Check if a systemId has validation support
 */
export function hasValidationSupport(systemId: string): boolean {
  const config = getValidationConfig(systemId)
  return config !== undefined
}
