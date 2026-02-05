/**
 * Monitor Field Configurations
 * 
 * Defines form field layouts for monitoring forms per system type.
 * Each system has its own set of fields with labels, types, and layout options.
 * 
 * ADDING A NEW MONITOR FORM:
 * 1. Add entry to MonitorFieldConfigs with system ID as key
 * 2. System ID must match the one used in formSchemas.ts
 * 3. Field names must match schema properties
 */

import type { FormFieldsConfig } from './fieldConfigs'

// Monitor field configurations by system ID
export const MonitorFieldConfigs: Record<string, FormFieldsConfig> = {
  mongo_k: {
    title: 'Mongo monitoring',
    fields: [
      { name: 'cluster', type: 'text', label: 'Cluster', labelHe: 'אשכול', required: true, colSpan: 12 },
    ],
  },
  redis: {
    title: 'Redis',
    fields: [
      { name: 'cluster', type: 'text', label: 'Cluster', labelHe: 'אשכול', required: true, colSpan: 6 },
      { name: 'db_name', type: 'text', label: 'DB Name', labelHe: 'שם מסד נתונים', required: true, colSpan: 6 },
    ],
  },
  postgresql: {
    title: 'PostgreSQL monitoring',
    fields: [
      { name: 'host', type: 'text', label: 'Host', labelHe: 'שרת', required: true, colSpan: 12 },
    ],
  },
  elastic: {
    title: 'Elastic',
    fields: [
      { name: 'cluster', type: 'async-select', label: 'Cluster', labelHe: 'אשכול', required: true, colSpan: 4 },
      { name: 'node', type: 'text', label: 'Node', labelHe: 'צומת', required: true, colSpan: 4 },
      { name: 'buckets_names', type: 'textarea', label: 'Buckets Names', labelHe: 'שמות דליים', required: false, colSpan: 4, placeholder: 'bucket1, bucket2' },
      { name: 'query_id', type: 'text', label: 'Query ID', labelHe: 'מזהה שליפה', required: true, colSpan: 4 },
    ],
  },
  sql_server: {
    title: 'SQL Server monitoring',
    fields: [
      { name: 'database_name', type: 'text', label: 'Database Name', labelHe: 'שם מסד נתונים', required: true, colSpan: 6 },
      { name: 'hosts', type: 'textarea', label: 'Hosts', labelHe: 'שרתים', required: true, colSpan: 6, placeholder: 'host1, host2, host3' },
    ],
  },
  s3: {
    title: 'S3 monitoring',
    fields: [
      { name: 'account', type: 'text', label: 'Account', labelHe: 'חשבון', required: true, colSpan: 12 },
    ],
  },
  hdfs: {
    title: 'HDFS monitoring',
    fields: [
      { name: 'path', type: 'text', label: 'Path', labelHe: 'נתיב', required: true, colSpan: 6 },
      { name: 'hierarchy', type: 'text', label: 'Hierarchy', labelHe: 'היררכיה', required: true, colSpan: 6 },
    ],
  },
  kafka: {
    title: 'Kafka monitoring',
    fields: [
      { name: 'cluster', type: 'text', label: 'Cluster', labelHe: 'אשכול', required: true, colSpan: 4 },
      { name: 'consumer_group', type: 'text', label: 'Consumer Group', labelHe: 'קבוצת צרכנים', required: true, colSpan: 4 },
      { name: 'topic', type: 'text', label: 'Topic', labelHe: 'נושא', required: true, colSpan: 4 },
    ],
  },
  nifi: {
    title: 'NiFi monitoring',
    fields: [
      { name: 'environment', type: 'text', label: 'Environment', labelHe: 'סביבה', required: true, colSpan: 4 },
      { name: 'componentType', type: 'text', label: 'Component Type', labelHe: 'סוג רכיב', required: true, colSpan: 4 },
      { name: 'componentId', type: 'text', label: 'Component ID', labelHe: 'מזהה רכיב', required: true, colSpan: 4 },
    ],
  },
  pvc: {
    title: 'PVC monitoring',
    fields: [
      { name: 'environment', type: 'text', label: 'Environment', labelHe: 'סביבה', required: true, colSpan: 4 },
      { name: 'namespace', type: 'text', label: 'Namespace', labelHe: 'מרחב שמות', required: true, colSpan: 4 },
      { name: 'pvc', type: 'text', label: 'PVC', labelHe: 'PVC', required: true, colSpan: 4 },
    ],
  },
  linux: {
    title: 'Linux VM monitoring',
    fields: [
      { name: 'server_name', type: 'text', label: 'Server Name', labelHe: 'שם שרת', required: true, colSpan: 12 },
    ],
  },
  windows: {
    title: 'Windows VM monitoring',
    fields: [
      { name: 'server_name', type: 'text', label: 'Server Name', labelHe: 'שם שרת', required: true, colSpan: 12 },
    ],
  },
  openshift: {
    title: 'OpenShift',
    fields: [
      { name: 'environment', type: 'text', label: 'Environment', labelHe: 'סביבה', required: true, colSpan: 4 },
      { name: 'namespace', type: 'text', label: 'Namespace', labelHe: 'מרחב שמות', required: true, colSpan: 4 },
      { name: 'service', type: 'text', label: 'Service', labelHe: 'שירות', required: true, colSpan: 4 },
    ],
  },
  data: {
    title: 'Data',
    fields: [
      { name: 'beak_id', type: 'text', label: 'Beak ID', labelHe: 'מזהה ביק', required: true, colSpan: 12 },
    ],
  },
  share: {
    title: 'Share',
    fields: [
      { name: 'datacenter', type: 'text', label: 'Datacenter', labelHe: 'מרכז נתונים', required: true, colSpan: 4 },
      { name: 'svm', type: 'text', label: 'SVM', labelHe: 'SVM', required: true, colSpan: 4 },
      { name: 'volume', type: 'text', label: 'Volume', labelHe: 'כרך', required: true, colSpan: 4 },
    ],
  },
  anonymous: {
    title: 'Anonymous',
    fields: [
      { name: 'anonymous_rule_id', type: 'text', label: 'Anonymous Rule ID', labelHe: 'מזהה חוק אנונימי', required: true, colSpan: 6 },
      { name: 'anonymous_rule_name', type: 'text', label: 'Anonymous Rule Name', labelHe: 'שם חוק אנונימי', required: true, colSpan: 6 },
    ],
  },
  groove: {
    title: 'Groove',
    fields: [
      { name: 'cube_name', type: 'text', label: 'Cube Name', labelHe: 'שם קוביה', required: true, colSpan: 6 },
      { name: 'timed_package_id', type: 'text', label: 'Timed Package ID', labelHe: 'מזהה חבילה מתוזמנת', required: true, colSpan: 6 },
    ],
  },
  url_entity: {
    title: 'URL',
    fields: [
      { name: 'node', type: 'text', label: 'Node', labelHe: 'צומת', required: true, colSpan: 4 },
      { name: 'route', type: 'text', label: 'Route', labelHe: 'נתיב', required: true, colSpan: 4 },
      { name: 'job_id', type: 'text', label: 'Job ID', labelHe: 'מזהה משימה', required: true, colSpan: 4 },
    ],
  },
}

// Default basic monitor fields (for systems not in the registry)
export const BasicMonitorFieldConfig: FormFieldsConfig = {
  title: 'Monitoring',
  fields: [],
}

// Helper to get monitor field config by system ID
export function getMonitorFieldConfig(systemId: string): FormFieldsConfig {
  return MonitorFieldConfigs[systemId] ?? BasicMonitorFieldConfig
}
