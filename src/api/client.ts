import type { EntityConfig, FormDefinition, StepKey } from "../types/entity";

const DEFAULT_BASE_URL = "http://127.0.0.1:8000";
const baseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  DEFAULT_BASE_URL;

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    try {
      const errorBody = await response.json();
      const detail =
        typeof errorBody?.detail === "string"
          ? errorBody.detail
          : undefined;
      throw new Error(detail ?? `Request failed with status ${response.status}`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Request failed with status ${response.status}`);
    }
  }

  return (await response.json()) as T;
}

export async function fetchEntityConfig(): Promise<EntityConfig> {
  return request<EntityConfig>("/config");
}

export async function fetchFormDefinition(
  systemId: string,
  stepKey: StepKey
): Promise<FormDefinition> {
  return request<FormDefinition>(`/systems/${systemId}/forms/${stepKey}`);
}

export async function fetchOwningTeams(): Promise<string[]> {
  return request<string[]>("/owning-teams");
}
