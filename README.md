# Entity Creation Portal

This project is a Vite + React + Mantine UI frontend backed by a FastAPI mock service. It demonstrates a fully dynamic entity creation wizard powered by JSON schema definitions fetched from the backend.

## Getting Started

### Frontend

```bash
pnpm install   # or npm install / yarn install
pnpm dev       # launches Vite on http://localhost:5173
```

### Backend Mock API

```bash
cd fastapi_service
python3 -m venv .venv
source .venv/bin/activate          # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Keep the backend running while working on the frontend; the wizard fetches all UI definitions from `http://localhost:8000`.

## Adding / Editing Schemas

All schema definitions live in `fastapi_service/data.py`.

1. **Define the form**: extend or add specific `*_MONITOR_FORM` (or `*_system`, `*_general`) objects—each contains:
   - `schema`: a standard JSON Schema object with `properties`, `required`, `enum`, etc.
   - `uiSchema`: RJSF UI configuration (col spans, widgets, placeholders, async options...).
2. **Wire the system**: register the system in the `SYSTEMS` dict with `forms: YOUR_FORM_MAP`.
3. **Reference in categories**: ensure the system ID is listed under the right category in `CATEGORIES` so it appears in the picker.
4. **Fast reload**: the FastAPI service reloads automatically when `data.py` changes.

## Async Select Widget

Use the custom Mantine-powered async select as follows in any schema’s `uiSchema`:

```ts
uiSchema = {
  owningTeam: {
    'ui:widget': 'AsyncSelect',
    'ui:options': {
      asyncOptions: {
        path: '/owning-teams',    // endpoint relative to the FastAPI server
        valueField: 'id',         // optional; defaults to `value`/`name`
        labelField: 'label',
        placeholder: 'בחר צוות',
      },
    },
  },
}
```

The widget (see `src/components/form-widgets/AsyncSelectWidget.tsx`) automatically fetches once, shows loading/error state, and produces a standard string value compatible with the JSON schema.

## Async Validation

The frontend’s `useAsyncValidation` hook reads async validation configs from each field’s `ui:options`. Example:

```ts
uiSchema = {
  displayName: {
    'ui:widget': 'text',
    'ui:options': {
      asyncValidation: {
        validationRoute: '/validate/display-name',
        field: 'displayName',
        debounceMs: 500,
        duplicateMessage: 'שם תפוס',
        serverMessage: 'לא ניתן לבדוק כעת',
      },
    },
  },
}
```

The hook posts `{ value }` to the route, surfaces duplicate/server errors through RJSF’s `extraErrors`, and displays a spinner in the grid slot while validation is pending.

## Frontend Architecture

| Component / Hook | Responsibility |
| ---------------- | -------------- |
| **`CreateEntityModal`** | Entry point. Opens/closes the modal and hands off the full controller object to the wizard. |
| **`useEntityFlowState`** | Master hook orchestrating config fetch, flow/step state, RJSF refs, async submission, and aggregating final results. Memoized return value ensures downstream components only re-render when necessary. |
| **`EntityFlowContent`** | High-level wizard container. Chooses between loading/error states, renders the stepper, current step content, summary, and bottom controls. |
| **`StepContent` (internal)** | Decides what to render for each step (`system`, `general`, `monitor`). Handles general-flow icon overlays and the dynamically fetched RJSF step forms. |
| **`SystemStep`** | Chooses between the display-flow icon grid and the monitor-flow menu selector. |
| **`SystemSelectionPanel`** | RTL-aligned menu of categories/sub-menus, including the “כללי” selection. Memoized and optimized to avoid unnecessary re-renders. |
| **`DisplayIconMenu`** | Displays the icon grid for display flow/general flow. Supports both direct selection and delegation via `onIconSelect`. |
| **`FormStepCard`** | RJSF wrapper that injects Mantine theming, async validation UI, custom grid layout logic, and fallback states. |
| **`FlowStepper` / `ResultSummary`** | Top step indicator and final JSON preview respectively. |
| **`AsyncSelectWidget`** | Shared widget consumed by `FormStepCard` to provide remote data selects. |
| **`useAsyncValidation`** | Debounced validation hook used within `FormStepCard` to display spinner/error states beside fields. |

All components follow Mantine’s RTL requirements, support tight screen heights, and rely solely on backend schemas—so extending the wizard is as simple as editing `data.py`.

## Notes

- **State Flow**: `useEntityFlowState` returns all derived data, actions, and refs as a single memoized object (the “controller”). This prevents prop drilling and keeps hook logic localized.
- **Form Aggregation**: when `ResultSummary` displays the final JSON, monitor data is already normalized to `{ type, details }` so future consumers can use it directly.
- **Async UX**: both async select and async validation surface loading status and errors without blocking other inputs.

## No Functionality Changes

All refactors preserve existing behavior and endpoints. If you customize schemas or UI, re-run `npm run build` (Vite still warns for Node 20.18; upgrade to ≥20.19 for best results).
