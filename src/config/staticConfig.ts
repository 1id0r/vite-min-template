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
  ],
  flows: {
    monitor: {
      id: 'monitor',
      label: 'יישות ניטורית',
      steps: ['system', 'general', 'monitor', 'tree'],
      description: 'Create a new entity with monitoring',
    },
    display: {
      id: 'display',
      label: 'יישות תצוגה',
      steps: ['system', 'general', 'tree'],
      description: 'Create a purely visual entity',
    },
  },
  steps: {
    system: { label: 'בחירת יישות', description: 'Select the type of entity you want to create' },
    general: { label: 'פרטים כלליים', description: 'Basic entity information' },
    monitor: { label: 'פרטי ניטור', description: 'Monitoring configuration' },
    tree: { label: 'בחירת עץ', description: 'Locate in tree and add bindings' },
  },
  systems: {
    redis: { id: 'redis', label: 'Redis', category: 'databases', icon: 'SiRedis', description: 'Redis caches', forms: {} },
    postgresql: { id: 'postgresql', label: 'PostgreSQL', category: 'databases', icon: 'SiPostgresql', description: 'PostgreSQL clusters', forms: {} },
    eck: { id: 'eck', label: 'ECK', category: 'search', icon: 'FiSearch', description: 'Elastic Cloud on Kubernetes', forms: {} },
    splunk: { id: 'splunk', label: 'Splunk', category: 'databases', icon: 'FiDatabase', description: 'Splunk indexers', forms: {} },
    hdfs: { id: 'hdfs', label: 'HDFS', category: 'filesystems', icon: 'FiHardDrive', description: 'HDFS cluster', forms: {} },
    nifi: { id: 'nifi', label: 'NiFi', category: 'transport', icon: 'FiWind', description: 'NiFi data flows', forms: {} },
    os: { id: 'os', label: 'Operating System', category: 'virtualization', icon: 'FiCpu', description: 'Generic OS', forms: {} },
    chevila: { id: 'chevila', label: 'חבילה', category: 'services', icon: 'FiPackage', description: 'חבילה שירותית', forms: {} },
    ribua: { id: 'ribua', label: 'ריבוע', category: 'services', icon: 'FiGrid', description: 'ריבוע שירותי', forms: {} },
    s3_db: { id: 's3_db', label: 'S3', category: 'databases', icon: 'MdStorage', description: 'S3 data lake buckets', forms: {} },
    hadoop_hdfs: { id: 'hadoop_hdfs', label: 'Hadoop-HDFS', category: 'filesystems', icon: 'FiHardDrive', description: 'HDFS storage clusters', forms: {} },
    nfs: { id: 'nfs', label: 'NFS', category: 'filesystems', icon: 'FiHardDrive', description: 'Network file systems', forms: {} },
    cifs: { id: 'cifs', label: 'CIFS', category: 'filesystems', icon: 'FiHardDrive', description: 'SMB/CIFS shares', forms: {} },
    kafka: { id: 'kafka', label: 'Kafka', category: 'transport', icon: 'SiApachekafka', description: 'Kafka messaging', forms: {} },
    rabbitmq: { id: 'rabbitmq', label: 'RabbitMQ', category: 'transport', icon: 'SiRabbitmq', description: 'RabbitMQ brokers', forms: {} },
    spark_ocp4: { id: 'spark_ocp4', label: 'Spark on OCP4', category: 'transport', icon: 'SiRedhat', description: 'Spark workloads on OpenShift', forms: {} },
    airflow: { id: 'airflow', label: 'Airflow', category: 'transport', icon: 'FiWind', description: 'Workflow orchestration', forms: {} },
    ibm_mq: { id: 'ibm_mq', label: 'IBM MQ', category: 'transport', icon: 'FiInbox', description: 'IBM MQ queues', forms: {} },
    general: { id: 'general', label: 'כללי', category: 'applications', icon: 'FiLayers', description: 'ישות כללית ', forms: {} },
    oracle_db: { id: 'oracle_db', label: 'Oracle Database', category: 'databases', icon: 'SiOracle', description: 'Oracle multi-tenant database', forms: {} },
    mongo_k: { id: 'mongo_k', label: 'Mongo K', category: 'databases', icon: 'SiMongodb', description: 'MongoDB clusters', forms: {} },
    sql_server: { id: 'sql_server', label: 'SQL Server', category: 'databases', icon: 'SiSqlite', description: 'Microsoft SQL Server instances', forms: {} },
    vm_linux: { id: 'vm_linux', label: 'Linux', category: 'virtualization', icon: 'FiCpu', description: 'Virtualized Linux guest templates with hypervisor placement and sizing.', forms: {} },
    vm_windows: { id: 'vm_windows', label: 'Windows', category: 'virtualization', icon: 'MdDesktopWindows', description: 'Virtualized Windows guest templates', forms: {} },
    pvc: { id: 'pvc', label: 'PVC', category: 'virtualization', icon: 'FiHardDrive', description: 'Persistent Volume Claims', forms: {} },
    dns: { id: 'dns', label: 'DNS', category: 'network', icon: 'FiGlobe', description: 'DNS records', forms: {} },
    ocp4: { id: 'ocp4', label: 'OCP4', category: 'virtualization', icon: 'SiRedhat', description: 'OpenShift 4 clusters', forms: {} },
    // Adding stubs for others to prevent errors if referenced
    gslb: { id: 'gslb', label: 'GSLB', category: 'network', icon: 'FiGlobe', description: 'Global Server Load Balancing', forms: {} },
    avi: { id: 'avi', label: 'AVI', category: 'network', icon: 'FiGlobe', description: 'AVI Load Balancer', forms: {} },
    dp: { id: 'dp', label: 'DP', category: 'network', icon: 'FiGlobe', description: 'Data Power', forms: {} },
    prophet: { id: 'prophet', label: 'Prophet', category: 'services', icon: 'FiBarChart', description: 'Prophet forecasting', forms: {} },
    runai: { id: 'runai', label: 'RunAI', category: 'services', icon: 'FiZap', description: 'RunAI GPU scheduler', forms: {} },
    jupyter: { id: 'jupyter', label: 'Jupyter', category: 'services', icon: 'FiCode', description: 'Jupyter notebooks', forms: {} },
    llm: { id: 'llm', label: 'LLM', category: 'services', icon: 'FiMessageSquare', description: 'Large Language Models', forms: {} },
    richard: { id: 'richard', label: 'Richard', category: 'services', icon: 'FiUser', description: 'User management service', forms: {} },
    solr: { id: 'solr', label: 'Solr', category: 'services', icon: 'FiSearch', description: 'Solr search engine', forms: {} },
    tardis_xport: { id: 'tardis_xport', label: 'Tardis Xport', category: 'services', icon: 'FiTruck', description: 'Data export service', forms: {} },
    s3_pipeline: { id: 's3_pipeline', label: 'S3 Pipeline', category: 'services', icon: 'FiGitBranch', description: 'S3 data pipelines', forms: {} },
    tiva: { id: 'tiva', label: 'Tiva', category: 'services', icon: 'FiActivity', description: 'Tiva monitoring', forms: {} },
    mishloach: { id: 'mishloach', label: 'Mishloach', category: 'services', icon: 'FiSend', description: 'Delivery service', forms: {} },
  },
}
