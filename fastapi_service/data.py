SYSTEMS = {
    "laptop": {
        "id": "laptop",
        "label": "Laptop",
        "category": "compute",
        "icon": "FiMonitor",
        "description": "Represents individual developer or field laptops that report compliance posture.",
        "forms": {
            "system": {
                "schema": {
                    "title": "Laptop setup",
                    "type": "object",
                    "required": ["assetId", "ownerEmail"],
                    "properties": {
                        "assetId": {
                            "type": "string",
                            "title": "Asset tag",
                            "minLength": 3,
                        },
                        "serial": {
                            "type": "string",
                            "title": "Serial number",
                        },
                        "ownerEmail": {
                            "type": "string",
                            "title": "Primary owner",
                            "format": "email",
                        },
                        "osVersion": {
                            "type": "string",
                            "title": "OS version",
                            "default": "macOS 15",
                        },
                    },
                },
                "uiSchema": {
                    "assetId": {"ui:autofocus": True, "ui:options": {"colSpan": 6}},
                    "serial": {"ui:options": {"colSpan": 6}},
                    "ownerEmail": {
                        "ui:placeholder": "name@company.com",
                        "ui:options": {"colSpan": 6},
                    },
                    "osVersion": {"ui:options": {"colSpan": 6}},
                },
                "initialData": {"osVersion": "macOS 15"},
            },
            "general": {
                "schema": {
                    "title": "Laptop general",
                    "type": "object",
                    "required": ["team", "environment"],
                    "properties": {
                        "environment": {
                            "type": "string",
                            "title": "Environment",
                            "enum": ["dev", "qa", "prod"],
                            "enumNames": ["Development", "Quality", "Production"],
                        },
                        "team": {"type": "string", "title": "Owning team"},
                        "notes": {"type": "string", "title": "Notes"},
                    },
                },
                "uiSchema": {
                    "environment": {"ui:widget": "radio", "ui:options": {"colSpan": 6}},
                    "team": {"ui:options": {"colSpan": 6}},
                    "notes": {"ui:widget": "textarea"},
                },
            },
            "monitor": {
                "schema": {
                    "title": "Laptop monitoring",
                    "type": "object",
                    "required": ["heartbeatInterval", "alertEmails"],
                    "properties": {
                        "heartbeatInterval": {
                            "type": "number",
                            "title": "Heartbeat interval (minutes)",
                            "minimum": 1,
                            "default": 5,
                        },
                        "alertEmails": {
                            "type": "array",
                            "title": "Alert recipients",
                            "items": {"type": "string", "format": "email"},
                            "minItems": 1,
                        },
                        "enableDiskChecks": {
                            "type": "boolean",
                            "title": "Disk capacity alerts",
                            "default": True,
                        },
                    },
                },
                "uiSchema": {
                    "alertEmails": {
                        "items": {"ui:placeholder": "alerts@company.com"},
                    }
                },
            },
        },
    },
    "server": {
        "id": "server",
        "label": "Server",
        "category": "compute",
        "icon": "FiServer",
        "description": "Fleet server provisioning for data center or cloud based VMs with richer metadata.",
        "forms": {
            "system": {
                "schema": {
                    "title": "Server blueprint",
                    "type": "object",
                    "required": ["hostname", "region", "cpuCores"],
                    "properties": {
                        "hostname": {"type": "string", "title": "Hostname"},
                        "region": {
                            "type": "string",
                            "title": "Region",
                            "enum": ["us-east-1", "us-west-2", "eu-west-1"],
                        },
                        "cpuCores": {
                            "type": "integer",
                            "title": "CPU cores",
                            "minimum": 2,
                            "default": 4,
                        },
                        "memoryGb": {
                            "type": "integer",
                            "title": "Memory (GB)",
                            "default": 16,
                        },
                        "tags": {
                            "type": "array",
                            "title": "Tags",
                            "items": {"type": "string"},
                        },
                    },
                },
                "uiSchema": {
                    "hostname": {"ui:autofocus": True, "ui:options": {"colSpan": 6}},
                    "region": {"ui:options": {"colSpan": 6}},
                    "cpuCores": {"ui:options": {"colSpan": 6}},
                    "memoryGb": {"ui:options": {"colSpan": 6}},
                    "tags": {"ui:options": {"orderable": False, "colSpan": 12}},
                },
            },
            "general": {
                "schema": {
                    "title": "Server general",
                    "type": "object",
                    "required": ["service", "tier"],
                    "properties": {
                        "service": {"type": "string", "title": "Service name"},
                        "tier": {
                            "type": "string",
                            "title": "Tier",
                            "enum": ["critical", "important", "best-effort"],
                        },
                        "ownerSlack": {
                            "type": "string",
                            "title": "Slack channel",
                            "pattern": "^#.*$",
                        },
                    },
                },
                "uiSchema": {
                    "service": {"ui:options": {"colSpan": 6}},
                    "tier": {"ui:options": {"colSpan": 6}},
                    "ownerSlack": {
                        "ui:placeholder": "#oncall-core",
                        "ui:options": {"colSpan": 12},
                    },
                },
            },
            "monitor": {
                "schema": {
                    "title": "Server monitoring",
                    "type": "object",
                    "required": ["errorBudgetMinutes", "pagerRotation"],
                    "properties": {
                        "errorBudgetMinutes": {
                            "type": "integer",
                            "title": "Monthly error budget (minutes)",
                            "minimum": 0,
                            "default": 30,
                        },
                        "pagerRotation": {
                            "type": "string",
                            "title": "Pager rotation",
                        },
                        "syntheticCheckUrl": {
                            "type": "string",
                            "title": "Synthetic URL",
                            "format": "uri",
                        },
                    },
                },
            },
        },
    },
    "kafka": {
        "id": "kafka",
        "label": "Kafka",
        "category": "data",
        "icon": "FiActivity",
        "description": "Cluster level Kafka monitoring with replication, storage, and lag thresholds.",
        "forms": {
            "system": {
                "schema": {
                    "title": "Kafka cluster setup",
                    "type": "object",
                    "required": ["clusterName", "brokers"],
                    "properties": {
                        "clusterName": {
                            "type": "string",
                            "title": "Cluster name",
                        },
                        "brokers": {
                            "type": "integer",
                            "title": "Broker count",
                            "minimum": 1,
                        },
                        "schemaRegistry": {
                            "type": "string",
                            "title": "Schema registry URL",
                            "format": "uri",
                        },
                    },
                },
                "uiSchema": {
                    "clusterName": {"ui:options": {"colSpan": 6}},
                    "brokers": {"ui:options": {"colSpan": 6}},
                    "schemaRegistry": {"ui:options": {"colSpan": 12}},
                },
            },
            "general": {
                "schema": {
                    "title": "Kafka general",
                    "type": "object",
                    "required": ["businessOwner", "retentionHours"],
                    "properties": {
                        "businessOwner": {
                            "type": "string",
                            "title": "Business owner",
                        },
                        "retentionHours": {
                            "type": "integer",
                            "title": "Log retention (hours)",
                            "minimum": 24,
                        },
                        "encryption": {
                            "type": "string",
                            "title": "Encryption at rest",
                            "enum": ["none", "sse-s3", "kms"],
                            "default": "sse-s3",
                        },
                    },
                },
                "uiSchema": {
                    "businessOwner": {"ui:options": {"colSpan": 6}},
                    "retentionHours": {"ui:options": {"colSpan": 6}},
                    "encryption": {"ui:options": {"colSpan": 6}},
                },
            },
            "monitor": {
                "schema": {
                    "title": "Kafka monitoring",
                    "type": "object",
                    "required": ["maxConsumerLag", "replicationFactor"],
                    "properties": {
                        "maxConsumerLag": {
                            "type": "integer",
                            "title": "Max consumer lag (messages)",
                            "minimum": 0,
                            "default": 5000,
                        },
                        "replicationFactor": {
                            "type": "integer",
                            "title": "Required replication factor",
                            "minimum": 1,
                            "maximum": 5,
                            "default": 3,
                        },
                        "alertTopic": {
                            "type": "string",
                            "title": "Alert topic",
                        },
                    },
                },
            },
        },
    },
    "mongo": {
        "id": "mongo",
        "label": "MongoDB",
        "category": "data",
        "icon": "FiDatabase",
        "description": "Replica set and sharded cluster telemetry definitions for MongoDB deployments.",
        "forms": {
            "system": {
                "schema": {
                    "title": "Mongo deployment",
                    "type": "object",
                    "required": ["deploymentType", "version"],
                    "properties": {
                        "deploymentType": {
                            "type": "string",
                            "title": "Deployment type",
                            "enum": ["replicaset", "sharded"],
                        },
                        "version": {
                            "type": "string",
                            "title": "Mongo version",
                            "default": "7.0",
                        },
                        "connectionString": {
                            "type": "string",
                            "title": "Connection string",
                        },
                    },
                },
                "uiSchema": {
                    "deploymentType": {"ui:options": {"colSpan": 6}},
                    "version": {"ui:options": {"colSpan": 6}},
                    "connectionString": {"ui:options": {"colSpan": 12}},
                },
            },
            "general": {
                "schema": {
                    "title": "Mongo general",
                    "type": "object",
                    "required": ["dataClassification"],
                    "properties": {
                        "dataClassification": {
                            "type": "string",
                            "title": "Data classification",
                            "enum": ["public", "internal", "restricted"],
                        },
                        "owners": {
                            "type": "array",
                            "title": "Owners",
                            "items": {"type": "string"},
                        },
                    },
                },
                "uiSchema": {
                    "dataClassification": {"ui:options": {"colSpan": 6}},
                    "owners": {"ui:options": {"orderable": False, "colSpan": 12}},
                },
            },
            "monitor": {
                "schema": {
                    "title": "Mongo monitoring",
                    "type": "object",
                    "required": ["backupWindow", "slowQueryThresholdMs"],
                    "properties": {
                        "backupWindow": {
                            "type": "string",
                            "title": "Backup window",
                        },
                        "slowQueryThresholdMs": {
                            "type": "integer",
                            "title": "Slow query threshold (ms)",
                            "default": 200,
                        },
                        "enableOplogChecks": {
                            "type": "boolean",
                            "title": "Monitor Oplog replication lag",
                            "default": True,
                        },
                    },
                },
            },
        },
    },
    "linux": {
        "id": "linux",
        "label": "Linux",
        "category": "platform",
        "icon": "FiLayers",
        "description": "Generic Linux host provisioning with package, user, and hardening baselines.",
        "forms": {
            "system": {
                "schema": {
                    "title": "Linux baseline",
                    "type": "object",
                    "required": ["distro", "version"],
                    "properties": {
                        "distro": {
                            "type": "string",
                            "title": "Distribution",
                            "enum": ["ubuntu", "debian", "rhel", "amazon-linux"],
                        },
                        "version": {"type": "string", "title": "Version"},
                        "hardened": {
                            "type": "boolean",
                            "title": "Apply CIS baseline",
                            "default": True,
                        },
                    },
                },
                "uiSchema": {
                    "distro": {"ui:options": {"colSpan": 6}},
                    "version": {"ui:options": {"colSpan": 6}},
                    "hardened": {"ui:options": {"colSpan": 6}},
                },
            },
            "general": {
                "schema": {
                    "title": "Linux general",
                    "type": "object",
                    "properties": {
                        "changeRequest": {
                            "type": "string",
                            "title": "Change request ID",
                        },
                        "documentation": {
                            "type": "string",
                            "title": "Docs URL",
                            "format": "uri",
                        },
                    },
                },
                "uiSchema": {
                    "changeRequest": {"ui:options": {"colSpan": 6}},
                    "documentation": {"ui:options": {"colSpan": 6}},
                },
            },
            "monitor": {
                "schema": {
                    "title": "Linux monitoring",
                    "type": "object",
                    "properties": {
                        "logAggregation": {
                            "type": "string",
                            "title": "Log aggregation endpoint",
                        },
                        "syslogFacility": {
                            "type": "string",
                            "title": "Syslog facility",
                            "enum": ["kern", "mail", "daemon", "auth", "local0"],
                        },
                    },
                },
            },
        },
    },
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
}

CATEGORIES = [
    {"id": "compute", "label": "Compute", "icon": "FiCpu", "systemIds": ["laptop", "server"]},
    {"id": "data", "label": "Data", "icon": "FiDatabase", "systemIds": ["kafka", "mongo"]},
    {"id": "platform", "label": "Platform", "icon": "FiLayers", "systemIds": ["linux"]},
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
