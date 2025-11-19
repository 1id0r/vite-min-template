from copy import deepcopy

GENERAL_FORM_DEFINITION = {
    "schema": {
        "title": "פרטים כלליים",
        "type": "object",
        "required": ["displayName", "description", "entityType"],
        "properties": {
            "displayName": {"type": "string", "title": "שם תצוגה"},
            "entityType": {"type": "string", "title": "סוג יישות", "readOnly": True},
            "description": {"type": "string", "title": "תיאור"},
            "contactInfo": {"type": "string", "title": "פרטי התקשרות"},
            "responsibleParty": {"type": "string", "title": "גורם אחראי"},
            "links": {
                "type": "array",
                "title": "לינקים",
                "items": {
                    "type": "object",
                    "required": [],
                    "properties": {
                        "label": {"type": "string", "title": "שם תצוגה"},
                        "url": {"type": "string", "title": "לינק"},
                    },
                },
            },
        },
    },
    "uiSchema": {
        "displayName": {"ui:options": {"colSpan": 6}},
        "entityType": {"ui:disabled": True, "ui:options": {"colSpan": 6}},
        "description": {"ui:widget": "textarea", "ui:options": {"colSpan": 12}},
        "contactInfo": {"ui:options": {"colSpan": 6}},
        "responsibleParty": {"ui:options": {"colSpan": 6}},
        "links": {
            "ui:options": {"orderable": False},
            "items": {
                "label": {"ui:options": {"colSpan": 6, "placeholder": "שם תצוגה ללינק"}},
                "url": {"ui:options": {"colSpan": 6, "placeholder": "לינק"}},
            },
        },
    },
}

DISPLAY_NAME_ASYNC_VALIDATION = {
    "validationRoute": "/validate/display-name",
    "field": "displayName",
    "debounceMs": 500,
    "duplicateMessage": "שם התצוגה כבר תפוס",
    "serverMessage": "לא ניתן לאמת כרגע",
}

GENERAL_FORM_CUSTOMIZATIONS = {
    "eck": {
        "displayName": {
            "ui:options": {
                "asyncValidation": DISPLAY_NAME_ASYNC_VALIDATION,
            }
        }
    }
}

def build_general_form_definition(system_id: str):
    general_form = deepcopy(GENERAL_FORM_DEFINITION)
    ui_schema = deepcopy(general_form.get("uiSchema") or {})
    overrides = GENERAL_FORM_CUSTOMIZATIONS.get(system_id)
    if overrides:
        for field, field_override in overrides.items():
            field_ui = deepcopy(ui_schema.get(field) or {})
            options = deepcopy(field_ui.get("ui:options") or {})
            override_options = field_override.get("ui:options") or {}
            options.update(override_options)
            field_ui["ui:options"] = options
            ui_schema[field] = field_ui
    general_form["uiSchema"] = ui_schema
    return general_form

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


ORACLE_MONITOR_FORM = {
    "schema": {
        "title": "Oracle monitoring",
        "type": "object",
        "required": ["dc", "host", "database"],
        "properties": {
            "dc": {"type": "string", "title": "DC"},
            "host": {"type": "string", "title": "Host"},
            "database": {"type": "string", "title": "Database"},
        },
    },
    "uiSchema": {
        "dc": {"ui:options": {"colSpan": 4, "placeholder": "dc-01"}},
        "host": {"ui:options": {"colSpan": 4}},
        "database": {"ui:options": {"colSpan": 4}},
    },
}

ORACLE_FORMS = basic_forms("Oracle Database")
ORACLE_FORMS["monitor"] = ORACLE_MONITOR_FORM

MONGO_MONITOR_FORM = {
    "schema": {
        "title": "Mongo monitoring",
        "type": "object",
        "required": ["dc", "host", "database"],
        "required": ["dc", "host", "database"],
        "properties": {
            "dc": {"type": "string", "title": "DC"},
            "host": {"type": "string", "title": "Host"},
            "database": {"type": "string", "title": "Database"},
        },
    },
    "uiSchema": {
        "dc": {"ui:options": {"colSpan": 4, "placeholder": "dc-01"}},
        "host": {"ui:options": {"colSpan": 4}},
        "database": {"ui:options": {"colSpan": 4}},
    },
}

MONGO_FORMS = basic_forms("Mongo K")
MONGO_FORMS["monitor"] = MONGO_MONITOR_FORM

REDIS_MONITOR_FORM = {
    "schema": {
        "title": "Redis monitoring",
        "type": "object",
        "required": ["dc", "environment", "database","instance"],
        "properties": {
            "dc": {"type": "string", "title": "DC"},
            "environment": {"type": "string", "title": "Environment"},
            "database": {"type": "string", "title": "Database"},
            "instance": {"type": "string", "title": "Instance"},
        },
    },
    "uiSchema": {
        "dc": {"ui:options": {"colSpan": 3, "placeholder": "dc-01"}},
        "environment": {"ui:options": {"colSpan": 3}},
        "database": {"ui:options": {"colSpan": 3}},
        "instance": {"ui:options": {"colSpan": 3}},
    },
}

REDIS_FORMS = basic_forms("Redis")
REDIS_FORMS["monitor"] = REDIS_MONITOR_FORM

POSTGRES_MONITOR_FORM = {
    "schema": {
        "title": "PostgreSQL monitoring",
        "type": "object",
        "required": ["host", "dc","database"],
        "properties": {
            "dc": {"type": "string", "title": "DC"},
            "host": {"type": "string", "title": "Host"},
            "database": {"type": "string", "title": "Database"},
        },
    },
    "uiSchema": {
        "dc": {"ui:options": {"colSpan": 4, "placeholder": "dc-01"}},
        "host": {"ui:options": {"colSpan": 4}},
        "database": {"ui:options": {"colSpan": 4}},
    },
}

POSTGRES_FORMS = basic_forms("PostgreSQL")
POSTGRES_FORMS["monitor"] = POSTGRES_MONITOR_FORM

ECK_MONITOR_FORM = {
    "schema": {
        "title": "ECK monitoring",
        "type": "object",
                "required": ["cluster", "index"],

        "properties": {
            "cluster": {"type": "string", "title": "Cluster"},
            "index": {"type": "string", "title": "Index"},
        },
    },
    "uiSchema": {
        "cluster": {"ui:options": {"colSpan": 6}},
        "index": {"ui:options": {"colSpan": 6}},
    },
}

ECK_FORMS = basic_forms("ECK")
ECK_FORMS["monitor"] = ECK_MONITOR_FORM

SQL_MONITOR_FORM = {
    "schema": {
        "title": "SQL monitoring",
        "type": "object",
        "required":["dc","host","database"],
        "properties": {
            "dc": {"type": "string", "title": "DC"},
            "host": {"type": "string", "title": "Host"},
            "database": {"type": "string", "title": "Database"},
        },
    },
    "uiSchema": {
        "dc": {"ui:options": {"colSpan": 4, "placeholder": "dc-01"}},
        "host": {"ui:options": {"colSpan": 4}},
        "database": {"ui:options": {"colSpan": 4}},
    },
}

SQL_FORMS = basic_forms("SQL Server")
SQL_FORMS["monitor"] = SQL_MONITOR_FORM

S3_MONITOR_FORM = {
    "schema": {
        "title": "S3 monitoring",
        "type": "object",
        "required": ["dc", "name"],
        "properties": {
            "dc": {"type": "string", "title": "DC"},
            "name": {"type": "string", "title": "Name"},
        },
    },
    "uiSchema": {
        "dc": {"ui:options": {"colSpan": 6, "placeholder": "dc-01"}},
        "name": {"ui:options": {"colSpan": 6}},
    },
}

S3_FORMS = basic_forms("S3")
S3_FORMS["monitor"] = S3_MONITOR_FORM

HDFS_MONITOR_FORM = {
    "schema": {
        "title": "HDFS monitoring",
        "type": "object",
        "required": ["network", "dc", "url"],
        "properties": {
            "network": {"type": "string", "title": "Network"},
            "dc": {"type": "string", "title": "DC"},
            "url": {"type": "string", "title": "URL"},
        },
    },
    "uiSchema": {
        "network": {"ui:options": {"colSpan": 4}},
        "dc": {"ui:options": {"colSpan": 4}},
        "url": {"ui:options": {"colSpan": 4}},
    },
}

HDFS_FORMS = basic_forms("HDFS")
HDFS_FORMS["monitor"] = HDFS_MONITOR_FORM

NFS_MONITOR_FORM = {
    "schema": {
        "title": "NFS monitoring",
        "type": "object",
        "required": ["network", "dc", "route"],
        "properties": {
            "network": {"type": "string", "title": "Network"},
            "dc": {"type": "string", "title": "DC"},
            "route": {"type": "string", "title": "Route"},
        },
    },
    "uiSchema": {
        "network": {"ui:options": {"colSpan": 4}},
        "dc": {"ui:options": {"colSpan": 4}},
        "route": {"ui:options": {"colSpan": 4}},
    },
}

NFS_FORMS = basic_forms("NFS")
NFS_FORMS["monitor"] = NFS_MONITOR_FORM

CIFS_MONITOR_FORM = {
    "schema": {
        "title": "CIFS monitoring",
        "type": "object",
        "required": ["network", "dc", "route"],
        "properties": {
            "network": {"type": "string", "title": "Network"},
            "dc": {"type": "string", "title": "DC"},
            "route": {"type": "string", "title": "Route"},
        },
    },
    "uiSchema": {
        "network": {"ui:options": {"colSpan": 4}},
        "dc": {"ui:options": {"colSpan": 4}},
        "route": {"ui:options": {"colSpan": 4}},
    },
}

CIFS_FORMS = basic_forms("CIFS")
CIFS_FORMS["monitor"] = CIFS_MONITOR_FORM

KAFKA_MONITOR_FORM = {
    "schema": {
        "title": "Kafka monitoring",
        "type": "object",
        "required": ["cluster", "topic", "consumer"],
        "properties": {
            "cluster": {"type": "string", "title": "Cluster"},
            "topic": {"type": "string", "title": "Topic"},
            "consumer": {"type": "string", "title": "Consumer"},
        },
    },
    "uiSchema": {
        "cluster": {
            "ui:widget": "AsyncSelect",
            "ui:options": {
                "asyncOptions": {"path": "/owning-teams", "placeholder": "Select cluster"},
            },
        },
        "topic": {"ui:options": {"colSpan": 6}},
        "consumer": {"ui:options": {"colSpan": 6}},
    },
}

KAFKA_FORMS = basic_forms("Kafka")
KAFKA_FORMS["monitor"] = KAFKA_MONITOR_FORM

RABBIT_MONITOR_FORM = {
    "schema": {
        "title": "RabbitMQ monitoring",
        "type": "object",
        "required": ["network", "dc", "queue"],
        "properties": {
            "network": {"type": "string", "title": "Network"},
            "dc": {"type": "string", "title": "DC"},
            "queue": {"type": "string", "title": "שם תור"},
        },
    },
    "uiSchema": {
        "network": {"ui:options": {"colSpan": 4}},
        "dc": {"ui:options": {"colSpan": 4}},
        "queue": {"ui:options": {"colSpan": 4}},
    },
}

RABBIT_FORMS = basic_forms("RabbitMQ")
RABBIT_FORMS["monitor"] = RABBIT_MONITOR_FORM

SPARK_MONITOR_FORM = {
    "schema": {
        "title": "Spark monitoring",
        "type": "object",
        "required": ["namespace", "applicationName"],
        "properties": {
            "namespace": {"type": "string", "title": "Namespace"},
            "applicationName": {"type": "string", "title": "Application name"},
        },
    },
    "uiSchema": {
        "namespace": {"ui:options": {"colSpan": 6}},
        "applicationName": {"ui:options": {"colSpan": 6}},
    },
}

SPARK_FORMS = basic_forms("Spark on OCP4")
SPARK_FORMS["monitor"] = SPARK_MONITOR_FORM


SYSTEMS = {

    "redis": {
        "id": "redis",
        "label": "Redis",
        "category": "databases",
        "icon": "SiRedis",
        "description": "Redis caches",
        "forms": REDIS_FORMS,
    },
    "postgresql": {
        "id": "postgresql",
        "label": "PostgreSQL",
        "category": "databases",
        "icon": "SiPostgresql",
        "description": "PostgreSQL clusters",
        "forms": POSTGRES_FORMS,
    },
    "eck": {
        "id": "eck",
        "label": "ECK",
        "category": "search",
        "icon": "FiSearch",
        "description": "Elastic Cloud on Kubernetes",
        "forms": ECK_FORMS,
    },
    "splunk": {
        "id": "splunk",
        "label": "Splunk",
        "category": "databases",
        "icon": "FiDatabase",
        "description": "Splunk indexers",
        "forms": basic_forms("Splunk"),
    },
    "hdfs": {
        "id": "hdfs",
        "label": "HDFS",
        "category": "filesystems",
        "icon": "FiHardDrive",
        "description": "HDFS cluster",
        "forms": basic_forms("HDFS"),
    },
    "nifi": {
        "id": "nifi",
        "label": "NiFi",
        "category": "transport",
        "icon": "FiWind",
        "description": "NiFi data flows",
        "forms": basic_forms("NiFi"),
    },
    "os": {
        "id": "os",
        "label": "Operating System",
        "category": "virtualization",
        "icon": "FiCpu",
        "description": "Generic OS",
        "forms": basic_forms("Operating System"),
    },
    "chevila": {
        "id": "chevila",
        "label": "חבילה",
        "category": "services",
        "icon": "FiPackage",
        "description": "חבילה שירותית",
        "forms": basic_forms("חבילה"),
    },
    "ribua": {
        "id": "ribua",
        "label": "ריבוע",
        "category": "services",
        "icon": "FiGrid",
        "description": "ריבוע שירותי",
        "forms": basic_forms("ריבוע"),
    },
    "s3_db": {
        "id": "s3_db",
        "label": "S3",
        "category": "databases",
        "icon": "MdStorage",
        "description": "S3 data lake buckets",
        "forms": S3_FORMS,
    },
    "hadoop_hdfs": {
        "id": "hadoop_hdfs",
        "label": "Hadoop-HDFS",
        "category": "filesystems",
        "icon": "FiHardDrive",
        "description": "HDFS storage clusters",
        "forms": HDFS_FORMS,
    },
    "nfs": {
        "id": "nfs",
        "label": "NFS",
        "category": "filesystems",
        "icon": "FiHardDrive",
        "description": "Network file systems",
        "forms": NFS_FORMS,
    },
    "cifs": {
        "id": "cifs",
        "label": "CIFS",
        "category": "filesystems",
        "icon": "FiHardDrive",
        "description": "SMB/CIFS shares",
        "forms": CIFS_FORMS,
    },
    "kafka": {
        "id": "kafka",
        "label": "Kafka",
        "category": "transport",
        "icon": "SiApachekafka",
        "description": "Kafka messaging",
        "forms": KAFKA_FORMS,
    },
    "rabbitmq": {
        "id": "rabbitmq",
        "label": "RabbitMQ",
        "category": "transport",
        "icon": "SiRabbitmq",
        "description": "RabbitMQ brokers",
        "forms": RABBIT_FORMS,
    },
    "spark_ocp4": {
        "id": "spark_ocp4",
        "label": "Spark on OCP4",
        "category": "transport",
        "icon": "SiRedhat",
        "description": "Spark workloads on OpenShift",
        "forms": SPARK_FORMS,
    },

    "general": {
        "id": "general",
        "label": "כללי",
        "category": "applications",
        "icon": "FiLayers",
        "description": "ישות כללית ",
        "forms": {
            "general": GENERAL_FORM_DEFINITION,
        },
    },
    "oracle_db": {
        "id": "oracle_db",
        "label": "Oracle Database",
        "category": "databases",
        "icon": "SiOracle",
        "description": "Oracle multi-tenant database",
        "forms": ORACLE_FORMS,
    },
    "mongo_k": {
        "id": "mongo_k",
        "label": "Mongo K",
        "category": "databases",
        "icon": "SiMongodb",
        "description": "MongoDB clusters",
        "forms": MONGO_FORMS,
    },
    "sql_server": {
        "id": "sql_server",
        "label": "SQL Server",
        "category": "databases",
        "icon": "SiSqlite",
        "description": "Microsoft SQL Server instances",
        "forms": SQL_FORMS,
    },
    "vm_linux": {
        "id": "vm_linux",
        "label": "Linux",
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
        "label": "Windows",
        "category": "virtualization",
        "icon": "MdDesktopWindows",
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
            ("dns", "DNS", "MdOutlineDns", "Authoritative DNS components"),
            ("gslb", "GSLB", "FiGlobe", "Global server load balancer"),
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
            ("solr", "Solr", "SiApachesolr", "Apache Solr clusters"),
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
        "id": "databases",
        "label": "מסדי נתונים",
        "icon": "FiDatabase",
        "systemIds": ["oracle_db", "mongo_k", "sql_server", "redis", "postgresql", "eck", "splunk"],
    },
    {
        "id": "filesystems",
        "label": "אחסון נתונים",
        "icon": "FiHardDrive",
        "systemIds": ["s3_db", "hadoop_hdfs", "hdfs", "nfs", "cifs"],
    },
    {
        "id": "transport",
        "label": "עיבוד ושינוע",
        "icon": "FiShuffle",
        "systemIds": ["kafka", "rabbitmq", "spark_ocp4", "airflow", "nifi", "ibm_mq"],
    },
    {
        "id": "virtualization",
        "label": "וירטואליזציה",
        "icon": "FiCpu",
        "systemIds": ["vm_linux", "vm_windows", "os", "pvc", "dns"],
    },
    {
        "id": "services",
        "label": "שירותים",
        "icon": "FiGrid",
        "systemIds": ["chevila", "ribua"],
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
