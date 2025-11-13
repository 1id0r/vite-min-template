import { useEffect, useMemo, useState } from 'react'
import type { ErrorSchema } from '@rjsf/utils'
import { request } from '../api/client'

export type AsyncValidationStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncValidationFieldConfig {
  field: string
  validationRoute: string
  debounceMs?: number
  payloadBuilder?: (value: unknown, field: string) => Record<string, unknown>
  responseParser?: (response: unknown) => { valid: boolean; message?: string }
  messages?: {
    duplicate?: string
    server?: string
  }
}

interface FieldState {
  status: AsyncValidationStatus
  message?: string
  value?: unknown
}

interface DefaultValidationResponse {
  exists?: boolean
  valid?: boolean
  message?: string
}

const DEFAULT_DUPLICATE_MESSAGE = 'Value already exists'
const DEFAULT_SERVER_MESSAGE = 'Unable to validate right now'

export function useAsyncValidation(
  formData: Record<string, unknown> | undefined,
  configs: AsyncValidationFieldConfig[]
) {
  const [fieldState, setFieldState] = useState<Record<string, FieldState>>({})

  const configSignature = useMemo(
    () =>
      configs
        .map((config) => `${config.field}:${config.validationRoute}:${config.debounceMs ?? ''}`)
        .join('|'),
    [configs]
  )

  useEffect(() => {
    if (!configs.length) {
      return
    }

    const controllers: AbortController[] = []
    const timers: Array<ReturnType<typeof setTimeout>> = []

    configs.forEach((config) => {
      const value = formData?.[config.field]
      const fieldKey = config.field

      if (value === undefined || value === null || value === '') {
        setFieldState((prev) => {
          if (prev[fieldKey]?.status === 'idle' && !prev[fieldKey]?.message) {
            return prev
          }
          return {
            ...prev,
            [fieldKey]: {
              status: 'idle',
              message: undefined,
              value,
            },
          }
        })
        return
      }

      setFieldState((prev) => ({
        ...prev,
        [fieldKey]: {
          status: 'loading',
          message: undefined,
          value,
        },
      }))

      const controller = new AbortController()
      controllers.push(controller)

      const timer = setTimeout(async () => {
        try {
          const payload = config.payloadBuilder ? config.payloadBuilder(value, fieldKey) : { value }
          const response = await request<DefaultValidationResponse>(config.validationRoute, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          })
          const { valid, message } = config.responseParser
            ? config.responseParser(response)
            : {
                valid: response.valid !== false && response.exists !== true,
                message: response.message,
              }

          setFieldState((prev) => {
            const previous = prev[fieldKey]
            if (previous?.value !== value) {
              return prev
            }
            return {
              ...prev,
              [fieldKey]: {
                status: valid ? 'success' : 'error',
                message: valid
                  ? undefined
                  : message ?? config.messages?.duplicate ?? DEFAULT_DUPLICATE_MESSAGE,
                value,
              },
            }
          })
        } catch (error) {
          if ((error as Error).name === 'AbortError') {
            return
          }
          setFieldState((prev) => {
            const previous = prev[fieldKey]
            if (previous?.value !== value) {
              return prev
            }
            return {
              ...prev,
              [fieldKey]: {
                status: 'error',
                message: config.messages?.server ?? DEFAULT_SERVER_MESSAGE,
                value,
              },
            }
          })
        }
      }, config.debounceMs ?? 400)

      timers.push(timer)
    })

    return () => {
      controllers.forEach((controller) => controller.abort())
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [configSignature, formData, configs])

  const extraErrors = useMemo<ErrorSchema>(() => {
    const schema: ErrorSchema = {}
    Object.entries(fieldState).forEach(([field, meta]) => {
      if (meta.message) {
        schema[field] = {
          __errors: [meta.message],
        } as ErrorSchema
      }
    })
    return schema
  }, [fieldState])

  const statusMap = useMemo<Record<string, AsyncValidationStatus>>(() => {
    const result: Record<string, AsyncValidationStatus> = {}
    Object.entries(fieldState).forEach(([field, meta]) => {
      result[field] = meta.status
    })
    return result
  }, [fieldState])

  return { extraErrors, statusMap }
}
