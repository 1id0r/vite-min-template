def basic_forms(entity_label: str):
    return {
        "system": {
            "schema": {
                "title": f"{entity_label} setup",
                "type": "object",
                "required": ["identifier", "region"],
                "properties": {
                    "identifier": {"type": "string", "title": "Identifier"},
                    "region": {"type": "string", "title": "Region"},
                    "capacity": {"type": "integer", "title": "Capacity", "minimum": 0},
                },
            },
            "uiSchema": {
                "identifier": {"ui:options": {"colSpan": 6}},
                "region": {"ui:options": {"colSpan": 6}},
                "capacity": {"ui:options": {"colSpan": 6}},
            },
        },
        "general": {
            "schema": {
                "title": f"{entity_label} general",
                "type": "object",
                "properties": {
                    "owner": {"type": "string", "title": "Owner"},
                    "environment": {
                        "type": "string",
                        "title": "Environment",
                        "enum": ["dev", "qa", "prod"],
                    },
                },
            },
            "uiSchema": {
                "owner": {
                    "ui:widget": "AsyncSelect",
                    "ui:options": {
                        "colSpan": 6,
                        "asyncOptions": {"path": "/owning-teams"},
                        "placeholder": "Select owner",
                    },
                },
                "environment": {"ui:options": {"colSpan": 6}},
            },
        },
        "monitor": {
            "schema": {
                "title": f"{entity_label} monitoring",
                "type": "object",
                "properties": {
                    "alertChannel": {"type": "string", "title": "Alert channel"},
                    "enableTelemetry": {"type": "boolean", "title": "Enable telemetry", "default": True},
                },
            },
            "uiSchema": {
                "alertChannel": {"ui:options": {"colSpan": 6}},
                "enableTelemetry": {"ui:options": {"colSpan": 6}},
            },
        },
    }


SYSTEMS = {
    "vm_linux": {
        "id": "vm_linux",
        "label": "VM - Linux",
        "category": "virtualization",
        "icon": "FiCpu",
        "description": "Virtualized Linux guest templates with hypervisor placement and sizing.",
        "forms": {
            "system": {
                "schema": {
                    "title": "Linux VM blueprint",
                    "type": "object",
                    "required": ["hypervisor", "vCPU", "memoryGb"],
                    "properties": {
                        "hypervisor": {"type": "string", "title": "Hypervisor"},
                        "vCPU": {"type": "integer", "title": "vCPU count", "minimum": 1},
                        "memoryGb": {"type": "integer", "title": "Memory (GB)", "minimum": 1},
                        "network": {"type": "string", "title": "Network segment"},
                    },
                },
                "uiSchema": {
                    "hypervisor": {"ui:options": {"colSpan": 6}},
                    "vCPU": {"ui:options": {"colSpan": 3}},
                    "memoryGb": {"ui:options": {"colSpan": 3}},
                    "network": {"ui:options": {"colSpan": 12}},
                },
            },
            "general": {
                "schema": {
                    "title": "Linux VM general",
                    "type": "object",
                    "properties": {
                        "owner": {"type": "string", "title": "Service owner"},
                        "environment": {
                            "type": "string",
                            "title": "Environment",
                            "enum": ["dev", "qa", "prod"],
                        },
                    },
                },
                "uiSchema": {
                    "owner": {"ui:options": {"colSpan": 6}},
                    "environment": {"ui:options": {"colSpan": 6}},
                },
            },
            "monitor": {
                "schema": {
                    "title": "Linux VM monitoring",
                    "type": "object",
                    "properties": {
                        "enableMetrics": {"type": "boolean", "title": "Enable metrics"},
                        "backupPolicy": {"type": "string", "title": "Backup policy"},
                    },
                },
                "uiSchema": {
                    "enableMetrics": {"ui:options": {"colSpan": 6}},
                    "backupPolicy": {"ui:options": {"colSpan": 6}},
                },
            },
        },
    },
    "vm_windows": {
        "id": "vm_windows",
        "label": "VM - Windows",
        "category": "virtualization",
        "icon": "FiMonitor",
        "description": "Windows guest templates with licensing and domain join data.",
        "forms": {
            "system": {
                "schema": {
                    "title": "Windows VM blueprint",
                    "type": "object",
                    "required": ["hypervisor", "osVersion", "vCPU", "memoryGb"],
                    "properties": {
                        "hypervisor": {"type": "string", "title": "Hypervisor"},
                        "osVersion": {"type": "string", "title": "OS version"},
                        "vCPU": {"type": "integer", "title": "vCPU count", "minimum": 1},
                        "memoryGb": {"type": "integer", "title": "Memory (GB)", "minimum": 1},
                        "licensed": {"type": "boolean", "title": "Licensed"},
                    },
                },
                "uiSchema": {
                    "hypervisor": {"ui:options": {"colSpan": 6}},
                    "osVersion": {"ui:options": {"colSpan": 6}},
                    "vCPU": {"ui:options": {"colSpan": 3}},
                    "memoryGb": {"ui:options": {"colSpan": 3}},
                    "licensed": {"ui:options": {"colSpan": 6}},
                },
            },
            "general": {
                "schema": {
                    "title": "Windows VM general",
                    "type": "object",
                    "properties": {
                        "domain": {"type": "string", "title": "Domain"},
                        "ou": {"type": "string", "title": "OU path"},
                    },
                },
                "uiSchema": {
                    "domain": {"ui:options": {"colSpan": 6}},
                    "ou": {"ui:options": {"colSpan": 6}},
                },
            },
            "monitor": {
                "schema": {
                    "title": "Windows VM monitoring",
                    "type": "object",
                    "properties": {
                        "enableEventViewer": {"type": "boolean", "title": "Collect Event Viewer logs"},
                        "patchGroup": {"type": "string", "title": "Patch group"},
                    },
                },
                "uiSchema": {
                    "enableEventViewer": {"ui:options": {"colSpan": 6}},
                    "patchGroup": {"ui:options": {"colSpan": 6}},
                },
            },
        },
    },
    "ocp4": {
        "id": "ocp4",
        "label": "OCP4 Cluster",
        "category": "virtualization",
        "icon": "FiLayers",
        "description": "Red Hat OpenShift 4 cluster onboarding with control/data plane sizing.",
        "forms": {
            "system": {
                "schema": {
                    "title": "Cluster definition",
                    "type": "object",
                    "required": ["clusterName", "masters", "workers"],
                    "properties": {
                        "clusterName": {"type": "string", "title": "Cluster name"},
                        "masters": {"type": "integer", "title": "Master count", "minimum": 3},
                        "workers": {"type": "integer", "title": "Worker count", "minimum": 2},
                        "storageClass": {"type": "string", "title": "Default storage class"},
                    },
                },
                "uiSchema": {
                    "clusterName": {"ui:options": {"colSpan": 6}},
                    "masters": {"ui:options": {"colSpan": 3}},
                    "workers": {"ui:options": {"colSpan": 3}},
                    "storageClass": {"ui:options": {"colSpan": 12}},
                },
            },
            "general": {
                "schema": {
                    "title": "Cluster general",
                    "type": "object",
                    "properties": {
                        "openshiftVersion": {"type": "string", "title": "OpenShift version"},
                        "networkType": {"type": "string", "title": "Network type", "enum": ["OVNKubernetes", "OpenShiftSDN"]},
                    },
                },
                "uiSchema": {
                    "openshiftVersion": {"ui:options": {"colSpan": 6}},
                    "networkType": {"ui:options": {"colSpan": 6}},
                },
            },
            "monitor": {
                "schema": {
                    "title": "Cluster monitoring",
                    "type": "object",
                    "properties": {
                        "alertChannel": {"type": "string", "title": "Alert channel"},
                        "enableClusterLogging": {"type": "boolean", "title": "Enable cluster logging"},
                    },
                },
                "uiSchema": {
                    "alertChannel": {"ui:options": {"colSpan": 6}},
                    "enableClusterLogging": {"ui:options": {"colSpan": 6}},
                },
            },
        },
    },
    "pvc": {
        "id": "pvc",
        "label": "Persistent Volume",
        "category": "virtualization",
        "icon": "FiDatabase",
        "description": "Persistent storage claims for container platforms.",
        "forms": {
            "system": {
                "schema": {
                    "title": "PVC definition",
                    "type": "object",
                    "required": ["name", "sizeGb", "storageClass"],
                    "properties": {
                        "name": {"type": "string", "title": "Claim name"},
                        "sizeGb": {"type": "integer", "title": "Size (GB)", "minimum": 1},
                        "storageClass": {"type": "string", "title": "Storage class"},
                    },
                },
                "uiSchema": {
                    "name": {"ui:options": {"colSpan": 6}},
                    "sizeGb": {"ui:options": {"colSpan": 3}},
                    "storageClass": {"ui:options": {"colSpan": 3}},
                },
            },
            "general": {
                "schema": {
                    "title": "PVC general",
                    "type": "object",
                    "properties": {
                        "accessMode": {
                            "type": "string",
                            "title": "Access mode",
                            "enum": ["ReadWriteOnce", "ReadOnlyMany", "ReadWriteMany"],
                        },
                        "namespace": {"type": "string", "title": "Namespace"},
                    },
                },
                "uiSchema": {
                    "accessMode": {"ui:options": {"colSpan": 6}},
                    "namespace": {"ui:options": {"colSpan": 6}},
                },
            },
            "monitor": {
                "schema": {
                    "title": "PVC monitoring",
                    "type": "object",
                    "properties": {
                        "retentionDays": {"type": "integer", "title": "Snapshot retention (days)", "minimum": 1},
                        "iopsAlert": {"type": "integer", "title": "IOPS alert threshold"},
                    },
                },
                "uiSchema": {
                    "retentionDays": {"ui:options": {"colSpan": 6}},
                    "iopsAlert": {"ui:options": {"colSpan": 6}},
                },
            },
        },
    },
    **{
        system_id: {
            "id": system_id,
            "label": label,
            "category": "network",
            "icon": icon,
            "description": desc,
            "forms": basic_forms(label),
        }
        for system_id, label, icon, desc in [
            ("dns", "DNS", "FiGlobe", "Authoritative DNS components"),
            ("gslb", "GSLB", "FiMap", "Global server load balancer"),
            ("avi", "Avi", "FiAirplay", "Avi load balancer"),
            ("dp", "DP", "FiShare2", "Data plane device"),
        ]
    },
    **{
        system_id: {
            "id": system_id,
            "label": label,
            "category": "ml",
            "icon": icon,
            "description": desc,
            "forms": basic_forms(label),
        }
        for system_id, label, icon, desc in [
            ("prophet", "Prophet", "FiTrendingUp", "Time-series forecasting pipelines"),
            ("runai", "Run:AI", "FiCpu", "GPU scheduling platform"),
            ("jupyter", "Jupyter", "FiBook", "Interactive notebooks"),
            ("llm", "LLM", "FiFeather", "Large language model serving"),
            ("richard", "Richard", "FiCode", "Internal ML service"),
        ]
    },
    **{
        system_id: {
            "id": system_id,
            "label": label,
            "category": "search",
            "icon": icon,
            "description": desc,
            "forms": basic_forms(label),
        }
        for system_id, label, icon, desc in [
            ("eck", "ECK", "FiSearch", "Elastic Cloud on Kubernetes"),
            ("solr", "Solr", "FiSearch", "Apache Solr clusters"),
        ]
    },
    **{
        system_id: {
            "id": system_id,
            "label": label,
            "category": "databases",
            "icon": icon,
            "description": desc,
            "forms": basic_forms(label),
        }
        for system_id, label, icon, desc in [
            ("sql_server", "SQL Server", "FiDatabase", "Microsoft SQL Server instances"),
            ("postgresql", "PostgreSQL", "FiDatabase", "PostgreSQL clusters"),
            ("oracle_db", "Oracle Database", "FiDatabase", "Oracle multi-tenant database"),
            ("mongo_k", "Mongo K", "FiDatabase", "MongoDB clusters"),
            ("redis", "Redis", "FiDatabase", "Redis caches"),
            ("s3_db", "S3", "FiDatabase", "S3 data lake buckets"),
        ]
    },
    **{
        system_id: {
            "id": system_id,
            "label": label,
            "category": "filesystems",
            "icon": icon,
            "description": desc,
            "forms": basic_forms(label),
        }
        for system_id, label, icon, desc in [
            ("hadoop_hdfs", "Hadoop-HDFS", "FiHardDrive", "HDFS storage clusters"),
            ("nfs", "NFS", "FiHardDrive", "Network file systems"),
            ("cifs", "CIFS", "FiHardDrive", "SMB/CIFS shares"),
        ]
    },
    **{
        system_id: {
            "id": system_id,
            "label": label,
            "category": "transport",
            "icon": icon,
            "description": desc,
            "forms": basic_forms(label),
        }
        for system_id, label, icon, desc in [
            ("kafka", "Kafka", "FiActivity", "Kafka messaging"),
            ("rabbitmq", "RabbitMQ", "FiSend", "RabbitMQ brokers"),
            ("spark_ocp4", "Spark on OCP4", "FiZap", "Spark workloads on OpenShift"),
            ("airflow", "Airflow", "FiWind", "Workflow orchestration"),
            ("tardis_xport", "Tardis-Xport", "FiShuffle", "Data export service"),
            ("ibm_mq", "IBM MQ", "FiInbox", "IBM MQ queues"),
            ("s3_pipeline", "S3", "FiCloud", "S3 transport pipelines"),
        ]
    },
    **{
        system_id: {
            "id": system_id,
            "label": label,
            "category": "applications",
            "icon": icon,
            "description": desc,
            "forms": basic_forms(label),
        }
        for system_id, label, icon, desc in [
            ("tiva", "תיבה", "FiPackage", "Flow application Teiva"),
            ("mishloach", "משלוח", "FiSend", "Flow application Mishloach"),
        ]
    },
}

CATEGORIES = [
    {
        "id": "network",
        "label": "רכיבי רשת",
        "icon": "FiGlobe",
        "systemIds": ["dns", "gslb", "avi", "dp"],
    },
    {
        "id": "ml",
        "label": "למידת מכונה",
        "icon": "FiTrendingUp",
        "systemIds": ["prophet", "runai", "jupyter", "llm", "richard"],
    },
    {
        "id": "search",
        "label": "מנועי חיפוש",
        "icon": "FiSearch",
        "systemIds": ["eck", "solr"],
    },
    {
        "id": "databases",
        "label": "מסדי נתונים",
        "icon": "FiDatabase",
        "systemIds": ["sql_server", "postgresql", "oracle_db", "mongo_k", "redis", "s3_db"],
    },
    {
        "id": "filesystems",
        "label": "מערכות קבצים",
        "icon": "FiHardDrive",
        "systemIds": ["hadoop_hdfs", "nfs", "cifs"],
    },
    {
        "id": "transport",
        "label": "עיבוד ושינוע",
        "icon": "FiShuffle",
        "systemIds": [
            "kafka",
            "rabbitmq",
            "spark_ocp4",
            "airflow",
            "tardis_xport",
            "ibm_mq",
            "s3_pipeline",
        ],
    },
    {
        "id": "virtualization",
        "label": "וירטואליזציה",
        "icon": "FiCpu",
        "subMenus": [
            {
                "label": "VM",
                "systemIds": ["vm_linux", "vm_windows"],
            }
        ],
        "systemIds": ["ocp4", "pvc"],
    },
    {
        "id": "applications",
        "label": "אפליקציות",
        "icon": "FiGrid",
        "systemIds": [],
        "subMenus": [
            {
                "label": "זרימה",
                "systemIds": ["tiva", "mishloach"],
            }
        ],
    },
]

OWNING_TEAMS = [
    "Observability",
    "Core Platform",
    "Site Reliability",
    "Data Integrity",
    "Growth Engineering",
    "Security Operations",
    "Developer Experience",
]

FLOWS = {
    "display": {
        "id": "display",
        "label": "Display",
        "description": "",
        "steps": ["system", "general"],
    },
    "monitor": {
        "id": "monitor",
        "label": "Monitor",
        "description": "",
        "steps": ["system", "general", "monitor"],
    },
}

STEPS = {
    "system": {"label": " בחירת יישות"},
    "general": {"label": " פרטים כלליים"},
    "monitor": {"label": " פרטי ניטור"},
}
