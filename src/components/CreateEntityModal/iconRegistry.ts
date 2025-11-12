import type { IconType } from 'react-icons'
import * as FiIcons from 'react-icons/fi'
import * as MdIcons from 'react-icons/md'
import * as SiIcons from 'react-icons/si'
import type { FlowId } from './types'

const iconRegistry = {
  ...FiIcons,
  ...MdIcons,
  ...SiIcons,
} as Record<string, IconType>

export const resolveIcon = (name?: string) => {
  if (!name) {
    return undefined
  }

  return iconRegistry[name]
}

export const fallbackCategoryIconName = 'FiLayers'
export const fallbackSystemIconName = 'FiBox'
export const fallbackCategoryIcon = resolveIcon(fallbackCategoryIconName)!
export const fallbackSystemIcon = resolveIcon(fallbackSystemIconName)!
export const categoryPrefixIcon = resolveIcon('FiArrowLeft') ?? fallbackCategoryIcon

export const DISPLAY_FLOW_ID: FlowId = 'display'
export const DISPLAY_FLOW_SYSTEM_IDS: string[] = [
  'sql_server',
  'postgresql',
  'oracle_db',
  'mongo_k',
  'redis',
  's3_db',
  'hadoop_hdfs',
  'kafka',
  'rabbitmq',
  'spark_ocp4',
  'airflow',
  'vm_linux',
  'vm_windows',
  'ocp4',
  'jupyter',
  'llm',
  'dns',
  'gslb',
]

export { iconRegistry }
