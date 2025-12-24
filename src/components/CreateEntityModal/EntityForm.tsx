/**
 * EntityForm - Dynamic Entity Creation Form
 *
 * Main form component that renders sections conditionally based on:
 * - Flow type (monitor/display)
 * - Selected system
 *
 * Replaces the step-based StepRenderer with a single dynamic form.
 */

import { memo, useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { Box, Button, Divider, ScrollArea, Stack } from '@mantine/core'
import { FlowSelector } from './FlowSelector'
import { DisplayIconMenu } from './DisplayIconMenu'
import { GeneralSection, MonitorSection, BindingsPanel, CategorySystemSelector } from './sections'
import { useEntityForm, type EntityFormData } from './hooks/useEntityForm'
import { DISPLAY_FLOW_SYSTEM_IDS, fallbackSystemIcon } from './iconRegistry'
import { ResultSummary } from './ResultSummary'

interface EntityFormProps {
  onSave?: (data: EntityFormData) => void
  onClose?: () => void
}

export const EntityForm = memo(function EntityForm({ onSave }: EntityFormProps) {
  const [submittedData, setSubmittedData] = useState<EntityFormData | null>(null)

  const handleSaveWithResult = (data: EntityFormData) => {
    setSubmittedData(data)
    onSave?.(data)
  }

  const {
    form,
    flow,
    systemId,
    categoryId,
    categories,
    systems,
    showSystemSelector,
    showGeneralSection,
    showIconMenu,
    showMonitorSection,
    showBindingsPanel,
    handleFlowChange,
    handleCategoryChange,
    handleSystemSelect,
    handleMeasurementsChange,
    handleAttachmentsChange,
    handleIconSelect,
    handleSave,
  } = useEntityForm(handleSaveWithResult)

  // If we have submitted data, show the result summary
  if (submittedData) {
    return <ResultSummary result={submittedData as any} onClose={() => setSubmittedData(null)} />
  }

  // Get measurements and attachments from form
  const measurements = form.watch('measurements') || []
  const attachments = form.watch('attachments') || []

  // Flow options for selector
  const flowOptions = [
    { value: 'monitor', label: 'מנוטר' },
    { value: 'display', label: 'תצוגה' },
  ]

  return (
    <FormProvider {...form}>
      <Box
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Scrollable Content */}
        <ScrollArea style={{ flex: 1 }} offsetScrollbars>
          <Stack gap='md' p='md'>
            {/* Flow Selector - Always visible */}
            <FlowSelector
              flow={flow}
              flowOptions={flowOptions}
              onFlowChange={(value) => handleFlowChange(value as 'monitor' | 'display')}
            />

            {/* Category and Entity Selectors - Only for monitor flow */}
            {showSystemSelector && (
              <CategorySystemSelector
                categories={categories}
                systems={systems}
                selectedCategory={categoryId}
                selectedSystem={systemId}
                onCategoryChange={handleCategoryChange}
                onSystemChange={handleSystemSelect}
              />
            )}

            <Divider />

            {/* General Section - Visible after system selection */}
            {showGeneralSection && <GeneralSection />}

            {/* Icon Menu - For display flow or monitor+general system */}
            {showIconMenu && (
              <DisplayIconMenu
                systems={systems}
                allowedSystemIds={DISPLAY_FLOW_SYSTEM_IDS}
                selectedSystem={systemId}
                selectedIconId={form.watch('icon')}
                onIconSelect={handleIconSelect}
                fallbackSystemIcon={fallbackSystemIcon}
              />
            )}

            {/* Monitor Section - Dynamic fields per system */}
            {showMonitorSection && systemId && <MonitorSection systemId={systemId} />}

            {/* Bindings Panel - Collapsible tabs for measurements/attachments */}
            {showBindingsPanel && (
              <BindingsPanel
                measurements={measurements}
                onMeasurementsChange={handleMeasurementsChange}
                attachments={attachments}
                onAttachmentsChange={handleAttachmentsChange}
              />
            )}
          </Stack>
        </ScrollArea>

        {/* Footer with Save Button */}
        <Box
          style={{
            padding: '16px',
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Button fullWidth size='md' onClick={handleSave} disabled={flow === 'monitor' && !systemId}>
            שמור
          </Button>
        </Box>
      </Box>
    </FormProvider>
  )
})

EntityForm.displayName = 'EntityForm'
