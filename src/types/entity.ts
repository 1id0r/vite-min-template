export interface SystemDefinition {
  id: string;
  label: string;
}

export interface CategoryDefinition {
  id: string;
  label: string;
  systemIds: string[];
  subMenus?: {
    label: string;
    systemIds: string[];
  }[];
}

export interface EntityConfig {
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
