import type { RJSFSchema, UiSchema } from "@rjsf/utils";

export type StepKey = "system" | "general" | "monitor";

export interface StepDefinition {
  label: string;
  description?: string;
}

export interface FormDefinition {
  schema: RJSFSchema;
  uiSchema?: UiSchema;
  initialData?: Record<string, unknown>;
}

export interface SystemDefinition {
  id: string;
  label: string;
  category: string;
  icon?: string;
  description?: string;
  forms: Partial<Record<StepKey, FormDefinition>>;
}

export interface CategoryDefinition {
  id: string;
  label: string;
  icon?: string;
  systemIds: string[];
}

export interface FlowDefinition {
  id: string;
  label: string;
  steps: StepKey[];
  description?: string;
}

export interface EntityConfig {
  steps: Record<StepKey, StepDefinition>;
  flows: Record<string, FlowDefinition>;
  categories: CategoryDefinition[];
  systems: Record<string, SystemDefinition>;
}
