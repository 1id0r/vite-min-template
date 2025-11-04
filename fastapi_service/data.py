SYSTEMS = {
    "laptop": {
        "id": "laptop",
        "label": "Laptop",
        "category": "compute",
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
                    "assetId": {"ui:autofocus": True},
                    "ownerEmail": {"ui:placeholder": "name@company.com"},
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
                    "environment": {"ui:widget": "radio"},
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
                    "hostname": {"ui:autofocus": True},
                    "tags": {"ui:options": {"orderable": False}},
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
                "uiSchema": {"ownerSlack": {"ui:placeholder": "#oncall-core"}},
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
                "uiSchema": {"owners": {"ui:options": {"orderable": False}}},
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
}

CATEGORIES = [
    {"id": "compute", "label": "Compute", "systemIds": ["laptop", "server"]},
    {"id": "data", "label": "Data", "systemIds": ["kafka", "mongo"]},
    {"id": "platform", "label": "Platform", "systemIds": ["linux"]},
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
        "description": "Provision an entity that reports monitoring telemetry and alerting details.",
        "steps": ["system", "general", "monitor"],
    },
}

STEPS = {
    "system": {"label": "Select entity"},
    "general": {"label": "General details"},
    "monitor": {"label": "Monitor details"},
}
