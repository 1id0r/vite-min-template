# Entity Creation Drawer - CreateEntityModal

## Overview

This component manages the complete entity creation flow through a multi-step wizard.
- **Monitor flow**: 2-step wizard with entity details + bindings/rules
- **Display flow**: Single-step form with general details + icon selection

**Tech Stack:**
- **Forms:** React Hook Form + Zod
- **UI:** Ant Design components
- **Validation:** Client-side Zod schemas with type inference

---

## File Structure

```
CreateEntityModal/
├── hooks/
│   ├── useEntityForm.ts         # Unified form management (composes specialized hooks)
│   ├── useFlowState.ts          # Flow switching logic
│   ├── useSystemSelection.ts    # Category/system selection
│   ├── useVisibilityFlags.ts    # Section visibility computation
│   └── useFormHandlers.ts       # Form actions (save, reset, etc.)
├── steps/
│   ├── Step1_Details/
│   │   ├── Step1Content.tsx     # Entity details step content
│   │   ├── FlowSelector.tsx     # Monitor/display toggle
│   │   ├── CategorySystemSelector.tsx
│   │   ├── MonitorSection.tsx   # Dynamic monitor fields
│   │   ├── LinksSection.tsx     # Links array field
│   │   └── IconSelector.tsx     # Icon dropdown (display flow)
│   └── Step2_Rules/
│       ├── Step2Content.tsx     # Bindings & rules step
│       ├── RulesTab.tsx         # Rules configuration
│       └── BindingsTab.tsx      # Binding configuration
├── components/
│   ├── FormStepper.tsx          # Step indicator
│   ├── ResultSummary.tsx        # Debug result display
│   └── BindingSection/          # Binding components
├── schemas/
│   └── entityFormSchema.ts      # Zod validation schema
├── types/
│   └── entityForm.ts            # Form types (FlowId, EntityFormData, etc.)
├── shared/
│   ├── GenericFormField.tsx     # Unified field renderer
│   ├── RuleField.tsx            # Rule field renderer
│   ├── constants.tsx            # Severity config re-exports
│   └── index.ts                 # Shared exports
├── CreateEntityModal.tsx        # Drawer wrapper
├── EntityForm.tsx               # Main form container
└── README.md                    # This file

../schemas/
├── formSchemas.ts               # Shared schemas (LinkSchema, TreeSelectionSchema)
├── fieldConfigs.ts              # UI field configurations + system configs
└── ruleSchemas.ts               # Rule schemas (SEVERITY_LEVELS, rule field groups)
```

---

## Flow Types

| ID | Name | Steps | Features |
|----|------|-------|----------|
| `monitor` | יישות ניטור | 2 | Category/system selection, monitor fields, bindings, rules |
| `display` | יישות תצוגה | 1 | General details, links, icon selection |

---

## Architecture

### Composed Hooks Pattern

`useEntityForm` composes specialized hooks for separation of concerns:

```
useEntityForm
├── useFlowState         # Flow switching (monitor/display)
├── useSystemSelection   # Category/system picker
├── useVisibilityFlags   # Section visibility logic
└── useFormHandlers      # Save, reset, field updates
```

### Single Sources of Truth

| Type | File |
|------|------|
| `FlowId`, `FlowOption`, `EntityFormData` | `types/entityForm.ts` |
| `Severity`, `SEVERITY_LEVELS` | `schemas/ruleSchemas.ts` |
| `EntityFormSchema` | `schemas/entityFormSchema.ts` |
| `MonitorFieldConfigs` (with Hebrew labels) | `schemas/fieldConfigs.ts` |

---

## Adding a New Monitor System

### 1. Add Field Config (`schemas/fieldConfigs.ts`)

```typescript
MonitorFieldConfigs['my_system'] = {
  title: 'My System monitoring',
  fields: [
    { name: 'serverId', type: 'text', label: 'Server ID', labelHe: 'מזהה שרת', required: true, colSpan: 6 },
    { name: 'port', type: 'number', label: 'Port', labelHe: 'פורט', required: true, colSpan: 6 },
  ],
}
```

### 2. Add to Category (`schemas/fieldConfigs.ts`)

```typescript
// In STATIC_CONFIG.categories
{ id: 'myCategory', label: 'קטגוריה שלי', systemIds: ['my_system'] }

// In STATIC_CONFIG.systems
my_system: { id: 'my_system', label: 'My System' }
```

**That's it!** The form will automatically appear when users select that system.

---

## Field Types Reference

| Type | Component | Notes |
|------|-----------|-------|
| `text` | Input | Basic text field |
| `textarea` | TextArea | Multi-line text |
| `number` | InputNumber | With optional min/max |
| `boolean` | Checkbox | Toggle field |
| `select` | Select | Requires `options` |
| `async-select` | AsyncClusterSelect | Async dropdown |
| `severity` | SeverityPills | Critical/Major/Info pills |
| `time` | TimePicker | Time selection |
| `json` | JsonEditor | Monaco editor for JSON |

---

## Visibility Flags

| Flag | Description |
|------|-------------|
| `showSystemSelector` | Category/system picker (monitor flow only) |
| `showGeneralSection` | Name, description, links |
| `showIconSelector` | Icon dropdown (display flow only) |
| `showMonitorSection` | System-specific monitor fields |
| `showBindingsPanel` | Bindings tab in step 2 |

---

## Dependencies

- **react-hook-form** - Form state management
- **@hookform/resolvers** - Zod integration
- **zod** - Schema validation  
- **antd** - UI library (replaced Mantine)
- **@tabler/icons-react** - Icons

---

*Last updated: February 2026*
