# CreateEntityModal

Multi-step modal for creating entities with system selection, tree navigation, and dynamic form inputs.

## Architecture Overview

The CreateEntityModal is a complex feature built around a state machine pattern that guides users through multiple steps to create different types of entities (monitors, displays, general entities).

### Main Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `CreateEntityModal.tsx` | Modal wrapper and entry point | Root |
| `EntityFlowContent.tsx` | Flow orchestration and step management | Root |
| `TreeStep.tsx` | Tree navigation step with search | Root |
| `SystemStep.tsx` | System selection step | Root |
| `FormStepCard.tsx` | Dynamic form rendering using RJSF | Root |
| `TreeNodeView.tsx` | Memoized tree node component | `components/` |

### State Management

All state is managed through custom hooks following the colocated hooks pattern:

| Hook | Purpose | Lines | Complexity |
|------|---------|-------|------------|
| `useEntityFlowState.ts` | Central flow state management | 584 | High |
| `useTreeData.ts` | Tree data and lazy loading | 75 | Medium |
| `useTreeSearch.ts` | Debounced search with cancellation | 140 | High |

---

## TreeStep Component

The TreeStep component provides hierarchical tree navigation with search functionality.

### User Flow

```
1. User enters search term
   ↓
2. After 350ms debounce, search API is called
   ↓
3. Results displayed OR tree navigation shown
   ↓
4. User expands nodes (lazy loads children on demand)
   ↓
5. User selects items via + button
   ↓
6. Selections stored in parent flow state
```

### Key Features

- **Lazy Loading**: Child nodes fetched only when parent is expanded (depth 1)
- **Initial Load**: Root level loads with depth 3 for better UX
- **Search Debouncing**: 350ms delay reduces API calls while typing
- **Request Cancellation**: AbortController prevents race conditions
- **Memoized Rendering**: TreeNodeView wrapped in React.memo() for performance
- **Right-to-Left Support**: Full RTL layout for Hebrew interface

### Architecture

```
TreeStep.tsx (orchestration layer)
├── useTreeData() ────────────> Tree data, expansion, lazy loading
├── useTreeSearch() ──────────> Search with debouncing
└── TreeNodeView (memoized) ──> Recursive tree rendering
```

---

## Configuration

### Environment Variables

Tree search can be configured via environment variables:

```bash
# .env file
VITE_TREE_SEARCH_ENDPOINT=https://your-api.com/tree-search
VITE_TREE_SEARCH_APP_TOKEN=your-secure-token-here
```

**Files**:
- Configuration: `constants/treeConfig.ts`
- Default endpoint: `https://replace-with-real-api/tree-search`
- Default token: `123lidor` (⚠️ Replace in production!)

### Search Parameters

| Parameter | Value | File |
|-----------|-------|------|
| Debounce delay | 350ms | `constants/treeConfig.ts` |
| Initial tree depth | 3 levels | `hooks/useTreeData.ts:39` |
| Lazy load depth | 1 level | `hooks/useTreeData.ts:56` |

---

## How to Modify

### Change Search Debounce Delay

**File**: `src/components/CreateEntityModal/constants/treeConfig.ts`

```typescript
// Change from 350ms to 500ms
export const TREE_SEARCH_DEBOUNCE_MS = 500
```

### Change Initial Tree Depth

**File**: `src/components/CreateEntityModal/hooks/useTreeData.ts:39`

```typescript
// Change from depth 3 to depth 2
const json = await fetchTreeNodes('root', 2)
```

### Add New Tree Node Actions

**File**: `src/components/CreateEntityModal/components/TreeNodeView.tsx`

Add new action buttons in the `<Group>` section (lines 85-100):

```typescript
<Group gap={6} wrap='nowrap'>
  {isLoading && <Loader size='xs' />}
  {/* Add your new action button here */}
  <ActionIcon ... />
</Group>
```

### Customize Search API

**File**: `src/components/CreateEntityModal/hooks/useTreeSearch.ts:61-75`

Modify the `fetchSearchResults` function to:
- Change query parameters
- Add authentication headers
- Transform response format

### Change Tree Styling

**File**: `src/components/CreateEntityModal/components/TreeNodeView.tsx:48-58`

Modify the inline styles in the main `<Flex>` component:
- Border colors (selected: `#4c6ef5`)
- Background colors (selected: `#f0f4ff`, expanded: `#f9fafb`)
- Spacing and padding

---

## File Structure

```
src/components/CreateEntityModal/
├── README.md                          ← You are here
├── hooks/
│   ├── useEntityFlowState.ts          (584 lines - main flow state)
│   ├── useTreeData.ts                 (75 lines - tree management)
│   └── useTreeSearch.ts               (140 lines - search with debouncing)
├── utils/
│   └── treeTransformers.ts            (Pure transformation functions)
├── components/
│   └── TreeNodeView.tsx               (Memoized tree node component)
├── constants/
│   └── treeConfig.ts                  (Configuration values)
├── TreeStep.tsx                        (~150 lines - orchestration)
├── CreateEntityModal.tsx               (Modal wrapper)
├── EntityFlowContent.tsx               (Flow management)
├── SystemStep.tsx                      (System selection)
├── FormStepCard.tsx                    (Dynamic forms)
├── SystemSelectionPanel.tsx            (System selection UI)
├── DisplayIconMenu.tsx                 (Icon selection)
├── ResultSummary.tsx                   (Final result display)
├── entityFormUtils.ts                  (Form utilities)
├── iconRegistry.ts                     (Icon mappings)
└── types.ts                            (Local type definitions)
```

---

## Key Technical Details

### State Management Pattern

The codebase uses a **controller object pattern** to avoid prop drilling:

```typescript
// In useEntityFlowState.ts - returns one large object
const controller = {
  flow, setFlow,
  activeStep, setActiveStep,
  selectedSystem, setSelectedSystem,
  // ... 30+ properties
}

// Memoized to prevent cascading re-renders
return useMemo(() => controller, [/* dependencies */])
```

Child components receive the controller object instead of individual props.

### Memoization Strategy

Performance optimization through strategic memoization:

1. **Components**: `React.memo()` for TreeNodeView, SystemSelectionPanel
2. **Hooks**: Return objects wrapped in `useMemo()`
3. **Callbacks**: `useCallback()` for functions passed to memoized children
4. **Derived State**: `useMemo()` for expensive computations (e.g., `selectedIds` Set)

### Type Safety

All components and hooks use TypeScript with:
- Interface definitions for props
- Type imports from `types/tree.ts`
- Explicit return type interfaces for hooks

---

## Common Tasks

### Adding a New Step

1. Create new step component (e.g., `ReviewStep.tsx`)
2. Update `useEntityFlowState.ts` to include step in flow definition
3. Update `EntityFlowContent.tsx` to render the new step
4. Update `FlowStepper.tsx` if needed

### Modifying Tree Selection Behavior

Selection logic is in `TreeStep.tsx:29-42`:

```typescript
const addSelection = (node: MantineNode) => { ... }
const removeSelection = (vid: string) => { ... }
const toggleSelection = useCallback((node: MantineNode) => { ... })
```

### Debugging Search Issues

Enable detailed logging in `useTreeSearch.ts` effect (line 49):

```typescript
useEffect(() => {
  console.log('Search term changed:', trimmedSearch)
  console.log('Is searching:', isSearching)
  // ... rest of effect
}, [isSearching, trimmedSearch])
```

---

## Testing

Manual testing checklist:

- [ ] Tree expansion and collapse
- [ ] Lazy loading of children nodes
- [ ] Search debouncing (type fast, only one request)
- [ ] Search result display
- [ ] Selection and deselection via + and - buttons
- [ ] Badge removal via x button
- [ ] Visual feedback (borders, backgrounds)
- [ ] RTL layout correctness

---

## Performance Considerations

Current optimizations:
- ✅ TreeNodeView memoized (prevents re-render on parent state change)
- ✅ Search requests cancelled on new input (AbortController)
- ✅ Debouncing reduces API calls
- ✅ selectedIds uses Set for O(1) lookups

Potential improvements:
- Consider virtualization for very large trees (1000+ nodes)
- Cache expanded node data to prevent re-fetching
- Implement intersection observer for infinite scroll

---

## Related Documentation

- [Mantine UI Components](https://mantine.dev/)
- [React JSON Schema Form](https://rjsf-team.github.io/react-jsonschema-form/)
- Main API client: `src/api/client.ts`
- Type definitions: `src/types/tree.ts`, `src/types/entity.ts`

---

## Support

For questions or issues with this component:
1. Check this README first
2. Review JSDoc comments in the relevant hook/component
3. Consult the team lead or original implementer
