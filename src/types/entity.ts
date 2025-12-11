import type { z } from 'zod'

export type StepKey = "system" | "general" | "monitor" | "tree";

export interface StepDefinition {
  label: string;
  description?: string;
}

export interface FormDefinition {
  schema: z.ZodObject<any>;
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
  subMenus?: {
    label: string;
    systemIds: string[];
  }[];
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

export type AttachmentType = 'url' | 'elastic'; // | 'mongo' | 'sql' | 'redis'

export interface UrlAttachment {
  type: 'url';
  id: string;
  name: string;
  address: string;
  timeout: string;
}

export interface ElasticAttachment {
  type: 'elastic';
  id: string;
  name: string;
  cluster: string;
  index: string;
  scheduleValue: number | "";
  scheduleUnit: 'minutes' | 'hours';
  timeout: '5s' | '15s' | '30s';
  query: string;
}

export type Attachment = UrlAttachment | ElasticAttachment;
