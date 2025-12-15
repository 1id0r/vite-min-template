import type { RJSFSchema, UiSchema } from "@rjsf/utils";

export type StepKey = "system" | "general" | "monitor" | "tree";

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

export type AttachmentType = 'url' | 'elastic' | 'mongo' | 'sql' | 'redis';

export interface BaseAttachment {
  id: string;
  type: AttachmentType;
  name: string; // שם שליפה / שם ערך נתונתי
}

export interface UrlAttachment extends BaseAttachment {
  type: 'url';
  url: string;
  timeout: number; // seconds
}

export interface ElasticAttachment extends BaseAttachment {
  type: 'elastic';
  cluster: string;
  index: string;
  timeField: string; // for "תזמון שליפה" or similar if needed, mock says min/hours but user said "min/hours" so maybe string or enum. User said "timout(5,15,30seconds)". 
  // User said: "for elastic will be cluster :dropdown(for now mock data), index(str), תזמון שליפה :min/hours, timeout(5,15,30seconds) json:json"
  // Let's interpret "תזמון שליפה" as fetchTiming or similar.
  fetchTiming: string; 
  timeout: number;
  jsonQuery: string;
}

// User only asked for URL and Elastic implementation for now.
export type Attachment = UrlAttachment | ElasticAttachment;

export type AttachmentList = Attachment[];
