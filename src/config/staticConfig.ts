import type { EntityConfig } from '../types/entity'

// Static configuration mirroring the backend data
export const STATIC_CONFIG: EntityConfig = {
  categories: [
    { 
      id: 'databases', 
      label: 'מסדי נתונים', 
      icon: 'FiDatabase', 
      systemIds: ['oracle_db', 'mongo_k', 'sql_server', 'redis', 'postgresql', 'eck', 'splunk'] 
    },
    { 
      id: 'filesystems', 
      label: 'אחסון נתונים', 
      icon: 'FiHardDrive', 
      systemIds: ['s3_db', 'hdfs', 'nfs', 'cifs'] 
    },
    { 
      id: 'transport', 
      label: 'עיבוד ושינוע', 
      icon: 'FiShuffle', 
      systemIds: ['kafka', 'rabbitmq', 'spark_ocp4', 'airflow', 'nifi', 'ibm_mq'] 
    },
    { 
      id: 'virtualization', 
      label: 'וירטואליזציה', 
      icon: 'FiCpu', 
      systemIds: ['vm_linux', 'vm_windows', 'os', 'pvc', 'dns'] 
    },
    { 
      id: 'services', 
      label: 'שירותים', 
      icon: 'FiGrid', 
      systemIds: ['chevila', 'ribua', 'tardis_xport'] 
    },
    { 
      id: 'general_category', 
      label: 'כללי', 
      icon: 'FiLayers', 
      systemIds: ['general'] 
    },
  ],
  flows: {
    monitor: {
      id: 'monitor',
      label: 'יישות ניטורית',
      steps: ['system', 'general', 'monitor', 'tree'],
    },
    display: {
      id: 'display',
      label: 'יישות תצוגה',
      steps: ['system', 'general', 'tree'],
    },
  },
  steps: {
    system: { label: 'בחירת יישות' },
    general: { label: 'פרטים כלליים' },
    monitor: { label: 'פרטי ניטור' },
    tree: { label: 'הצמדות' },
  },
  systems: {
    redis: { id: 'redis', label: 'Redis', category: 'databases', icon: 'SiRedis', forms: {} },
    postgresql: { id: 'postgresql', label: 'PostgreSQL', category: 'databases', icon: 'SiPostgresql', forms: {} },
    eck: { id: 'eck', label: 'ECK', category: 'search', icon: 'FiSearch', forms: {} },
    splunk: { id: 'splunk', label: 'Splunk', category: 'databases', icon: 'FiDatabase', forms: {} },
    hdfs: { id: 'hdfs', label: 'HDFS', category: 'filesystems', icon: 'FiHardDrive', forms: {} },
    nifi: { id: 'nifi', label: 'NiFi', category: 'transport', icon: 'FiWind', forms: {} },
    os: { id: 'os', label: 'Operating System', category: 'virtualization', icon: 'FiCpu', forms: {} },
    chevila: { id: 'chevila', label: 'חבילה', category: 'services', icon: 'FiPackage', forms: {} },
    ribua: { id: 'ribua', label: 'ריבוע', category: 'services', icon: 'FiGrid', forms: {} },
    s3_db: { id: 's3_db', label: 'S3', category: 'databases', icon: 'MdStorage', forms: {} },
    hadoop_hdfs: { id: 'hadoop_hdfs', label: 'Hadoop-HDFS', category: 'filesystems', icon: 'FiHardDrive', forms: {} },
    nfs: { id: 'nfs', label: 'NFS', category: 'filesystems', icon: 'FiHardDrive', forms: {} },
    cifs: { id: 'cifs', label: 'CIFS', category: 'filesystems', icon: 'FiHardDrive', forms: {} },
    kafka: { id: 'kafka', label: 'Kafka', category: 'transport', icon: 'SiApachekafka', forms: {} },
    rabbitmq: { id: 'rabbitmq', label: 'RabbitMQ', category: 'transport', icon: 'SiRabbitmq', forms: {} },
    spark_ocp4: { id: 'spark_ocp4', label: 'Spark on OCP4', category: 'transport', icon: 'SiRedhat', forms: {} },
    airflow: { id: 'airflow', label: 'Airflow', category: 'transport', icon: 'FiWind', forms: {} },
    ibm_mq: { id: 'ibm_mq', label: 'IBM MQ', category: 'transport', icon: 'FiInbox', forms: {} },
    general: { id: 'general', label: 'כללי', category: 'applications', icon: 'FiLayers', forms: {} },
    oracle_db: { id: 'oracle_db', label: 'Oracle Database', category: 'databases', icon: 'SiOracle', forms: {} },
    mongo_k: { id: 'mongo_k', label: 'Mongo K', category: 'databases', icon: 'SiMongodb', forms: {} },
    sql_server: { id: 'sql_server', label: 'SQL Server', category: 'databases', icon: 'SiSqlite', forms: {} },
    vm_linux: { id: 'vm_linux', label: 'Linux', category: 'virtualization', icon: 'FiCpu', forms: {} },
    vm_windows: { id: 'vm_windows', label: 'Windows', category: 'virtualization', icon: 'MdDesktopWindows', forms: {} },
    pvc: { id: 'pvc', label: 'PVC', category: 'virtualization', icon: 'FiHardDrive', forms: {} },
    dns: { id: 'dns', label: 'DNS', category: 'network', icon: 'FiGlobe', forms: {} },
    ocp4: { id: 'ocp4', label: 'OCP4', category: 'virtualization', icon: 'SiRedhat', forms: {} },
    // Adding stubs for others to prevent errors if referenced
    gslb: { id: 'gslb', label: 'GSLB', category: 'network', icon: 'FiGlobe', forms: {} },
    avi: { id: 'avi', label: 'AVI', category: 'network', icon: 'FiGlobe', forms: {} },
    dp: { id: 'dp', label: 'DP', category: 'network', icon: 'FiGlobe', forms: {} },
    prophet: { id: 'prophet', label: 'Prophet', category: 'services', icon: 'FiBarChart', forms: {} },
    runai: { id: 'runai', label: 'RunAI', category: 'services', icon: 'FiZap', forms: {} },
    jupyter: { id: 'jupyter', label: 'Jupyter', category: 'services', icon: 'FiCode', forms: {} },
    llm: { id: 'llm', label: 'LLM', category: 'services', icon: 'FiMessageSquare', forms: {} },
    richard: { id: 'richard', label: 'Richard', category: 'services', icon: 'FiUser', forms: {} },
    solr: { id: 'solr', label: 'Solr', category: 'services', icon: 'FiSearch', forms: {} },
    tardis_xport: { id: 'tardis_xport', label: 'Tardis Xport', category: 'services', icon: 'FiTruck', forms: {} },
    s3_pipeline: { id: 's3_pipeline', label: 'S3 Pipeline', category: 'services', icon: 'FiGitBranch', forms: {} },
    tiva: { id: 'tiva', label: 'Tiva', category: 'services', icon: 'FiActivity', forms: {} },
    mishloach: { id: 'mishloach', label: 'Mishloach', category: 'services', icon: 'FiSend', forms: {} },
  },
}
