# Entity Creation Drawer - CreateEntityModal

## Overview

This component manages the complete entity creation flow through a multi-step wizard.
Users can select an entity type, configure general properties, set up monitoring (optional),
and choose a location in the hierarchical tree. The UI slides in from the left as a Drawer.

**Tech Stack:**
- **Forms:** React Hook Form + Zod
- **UI:** Mantine components
- **Validation:** Client-side Zod schemas with type inference

---

## File Structure

```
CreateEntityModal/
├── hooks/
│   └── useEntityForm.ts         # Unified form management hook (~194 lines)
├── sections/
│   ├── index.ts                 # Section exports
│   ├── GeneralSection.tsx       # General details form (~160 lines)
│   ├── MonitorSection.tsx       # System-specific monitoring (~150 lines)
│   ├── CategorySystemSelector.tsx # Category/system picker (~80 lines)
│   └── BindingsPanel.tsx        # Attachments panel (~70 lines)
├── BindingsStep/
│   ├── BindingsStep.tsx         # Tab container (measurements + bindings)
│   ├── BindingsTab.tsx          # Attachment type manager
│   └── BindingCard.tsx          # Individual binding configuration
├── types/
│   └── entityForm.ts            # Form type definitions
├── CreateEntityModal.tsx        # Modal wrapper
├── EntityForm.tsx               # Main form container
├── FlowSelector.tsx             # Flow type selector (monitor/display)
├── TreeStep.tsx                 # Tree location selection
├── DisplayIconMenu.tsx          # Icon picker menu
├── ResultSummary.tsx            # Result summary display
├── iconRegistry.ts              # Icon registry
├── types.ts                     # Type definitions
├── index.ts                     # Public exports
└── README.md                    # This file

../schemas/
├── formSchemas.ts               # Zod validation schemas (~460 lines)
├── fieldConfigs.ts              # UI field configurations (~285 lines)
└── ruleSchemas.ts               # Future rules feature schemas (~585 lines)
```

---

## Flow Types

| ID | Name | Description |
|----|------|-------------|
| `monitor` | Monitored Entity | Full entity with monitoring configuration |
| `display` | Display Entity | Display-only entity without monitoring |

---

## Architecture

### Unified Form Hook

The `useEntityForm` hook manages all form state in a single place:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        useEntityForm                                │
│                      (~194 lines)                                   │
├─────────────────────────────────────────────────────────────────────┤
│  • Single React Hook Form instance                                  │
│  • Dynamic validation based on flow and system                      │
│  • Validates on blur                                                │
│  • Derived state for conditional section visibility                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Form Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                  Form System Architecture                      │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  schemas/formSchemas.ts                                       │
│  ├─ LinkSchema (links validation)                            │
│  ├─ GeneralFormSchema (Step 2)                               │
│  ├─ Monitor schemas per system (Step 3)                      │
│  ├─ Attachment schemas (URL, Elastic)                        │
│  └─ getEntitySchema() builder                                │
│                                                                │
│  schemas/fieldConfigs.ts                                      │
│  ├─ UI field configurations (labels, layout, types)          │
│  ├─ GeneralFieldConfig (Step 2)                              │
│  └─ MonitorFieldConfigs (Step 3, per system)                 │
│                                                                │
│  schemas/ruleSchemas.ts (future)                              │
│  ├─ Rule field groups (generic, dynamic, etc.)               │
│  └─ EntityRuleRegistry (rules per entity type)               │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

## Usage

### Basic Example

```tsx
import { CreateEntityModal } from './components/CreateEntityModal'

function App() {
  const [opened, setOpened] = useState(false)

  return (
    <>
      <Button onClick={() => setOpened(true)}>Create Entity</Button>
      <CreateEntityModal 
        opened={opened} 
        onClose={() => setOpened(false)} 
      />
    </>
  )
}
```

---

## Adding a New Monitor Form

Adding a new monitor form requires updates in 2 files:

### 1. Add Zod Schema (`schemas/formSchemas.ts`)

```typescript
// Define validation schema
export const MySystemMonitorSchema = z.object({
  serverId: z.string().min(1, 'Server ID is required'),
  port: z.number().int().min(1).max(65535, 'Invalid port'),
  enabled: z.boolean().optional(),
})

// Add to registry
MonitorSchemaRegistry['my_system'] = MySystemMonitorSchema
```

### 2. Add Field Config (`schemas/fieldConfigs.ts`)

```typescript
MonitorFieldConfigs['my_system'] = {
  title: 'My System Monitoring',
  fields: [
    {
      name: 'serverId',
      type: 'text',
      label: 'Server ID',
      colSpan: 6,
      placeholder: 'srv-001'
    },
    {
      name: 'port',
      type: 'number',
      label: 'Port',
      colSpan: 6,
    },
    {
      name: 'enabled',
      type: 'boolean',
      label: 'Enable monitoring',
      colSpan: 12,
    },
  ],
}
```

**That's it!** The form will automatically appear when users select that system.

---

## Field Types Reference

| Type | Component | Props Required |
|------|-----------|----------------|
| `text` | TextInput | - |
| `textarea` | Textarea | - |
| `number` | NumberInput | - |
| `boolean` | Checkbox | - |
| `select` | Select | `options` array |
| `async-select` | AsyncSelectField | `asyncOptions.path` |

---

## Hook API Reference

### Visibility Flags

| Field | Type | Description |
|-------|------|-------------|
| `showSystemSelector` | `boolean` | Show system selection (monitor flow) |
| `showGeneralSection` | `boolean` | Show general details section |
| `showIconMenu` | `boolean` | Show icon picker |
| `showMonitorSection` | `boolean` | Show monitor-specific fields |
| `showBindingsPanel` | `boolean` | Show bindings tab |

### Handlers

| Field | Type | Description |
|-------|------|-------------|
| `handleFlowChange` | `(flow: FlowId) => void` | Change flow type |
| `handleCategoryChange` | `(id: string \| null) => void` | Select category |
| `handleSystemSelect` | `(id: string \| null) => void` | Select system |
| `handleMeasurementsChange` | `(items: TreeSelection[]) => void` | Update measurements |
| `handleAttachmentsChange` | `(items: Attachment[]) => void` | Update attachments |
| `handleIconSelect` | `(systemId: string, icon?: string) => void` | Select icon |
| `handleSave` | `() => void` | Submit form |
| `resetForm` | `() => void` | Reset all state |

---

## Troubleshooting

### Form not validating
**Check:** Is the field in the Zod schema with proper validation?
```typescript
// Wrong - no validation
myField: z.string()

// Right - with validation  
myField: z.string().min(1, 'Field is required')
```

### Field not showing
**Check:** Is the field in both schema AND field config?
- Schema: `formSchemas.ts` 
- Config: `fieldConfigs.ts`

### Validation message not showing
**Update the Zod schema message:**
```typescript
z.string().min(1, 'הודעה בעברית') // Hebrew
z.string().min(1, 'English message') // English
```

### URL validation not showing on links
The `LinkSchema` validates URLs with `z.string().url()`. Errors display on blur.

---

## Dependencies

- **react-hook-form** - Form state management
- **@hookform/resolvers** - Zod integration
- **zod** - Schema validation  
- **@mantine/core** - UI library
- **react-icons** - Icons

---

## Backend API

The modal communicates with these endpoints:

1. **GET /tree** - Load hierarchical tree nodes

> **Note:** Form schemas are client-side (no backend dependency for validation)

---

*Last updated: December 2024*
