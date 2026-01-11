/**
 * EntityForm - Dynamic Entity Creation Form
 *
 * Main form component with 2-step wizard:
 * - Step 1: פרטי ישות (Entity Details) - name, description, links, entity-specific fields
 * - Step 2: הצמדות וחוקים (Bindings & Rules) - TBD
 *
 * For monitor flow: Shows category/entity selectors, then dynamic fields
 * For display flow: Shows general fields + icon selection
 */

import { memo, useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { Box, Button, Divider, ScrollArea, Stack, Text, TextInput, Textarea } from '@mantine/core'
import { FlowSelector } from './FlowSelector'
import { DisplayIconMenu } from './DisplayIconMenu'
import { MonitorSection, CategorySystemSelector, LinksSection } from './sections'
import { FormStepper } from './FormStepper'
import { useEntityForm, type EntityFormData } from './hooks/useEntityForm'
import { DISPLAY_FLOW_SYSTEM_IDS, fallbackSystemIcon } from './iconRegistry'
import { ResultSummary } from './ResultSummary'

interface EntityFormProps {
  onSave?: (data: EntityFormData) => void
  onClose?: () => void
}

// Step definitions
const STEPS = [
  { value: 1, label: 'פרטי ישות' },
  { value: 2, label: 'הצמדות וחוקים' },
]

export const EntityForm = memo(function EntityForm({ onSave }: EntityFormProps) {
  const [submittedData, setSubmittedData] = useState<EntityFormData | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

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
    handleFlowChange,
    handleCategoryChange,
    handleSystemSelect,
    handleIconSelect,
    handleSave,
  } = useEntityForm(handleSaveWithResult)

  // If we have submitted data, show the result summary
  if (submittedData) {
    return <ResultSummary result={submittedData as any} onClose={() => setSubmittedData(null)} />
  }

  // Flow options for selector
  const flowOptions = [
    { value: 'monitor', label: 'מוצר פעיל' },
    { value: 'display', label: 'מוצר תצוגה' },
  ]

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const isNextDisabled = flow === 'monitor' && !systemId

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

            {/* Stepper - Shows current step */}
            <FormStepper currentStep={currentStep} steps={STEPS} />

            {/* Step 1: Entity Details */}
            {currentStep === 1 && (
              <>
                {/* פרטים כלליים Section Header */}
                <Text size='md' fw={700} c='gray.8' ta='center' dir='rtl'>
                  פרטים כלליים
                </Text>

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

                {/* Name and Description - Visible after system selection */}
                {showGeneralSection && (
                  <>
                    <TextInput
                      label='שם מוצר'
                      placeholder='הזן שם מוצר'
                      required
                      dir='rtl'
                      {...form.register('displayName')}
                      error={form.formState.errors.displayName?.message}
                      styles={{ label: { fontWeight: 600 } }}
                    />
                    <Textarea
                      label='תיאור'
                      placeholder='הזן תיאור ותפקיד המוצר'
                      required
                      dir='rtl'
                      minRows={2}
                      {...form.register('description')}
                      error={form.formState.errors.description?.message}
                      styles={{ label: { fontWeight: 600 } }}
                    />
                  </>
                )}

                <Divider />

                {/* Links Section */}
                {showGeneralSection && <LinksSection />}

                <Divider />

                {/* Monitor Section - Dynamic fields per system */}
                {showMonitorSection && systemId && <MonitorSection systemId={systemId} />}

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
              </>
            )}

            {/* Step 2: Bindings & Rules - TBD */}
            {currentStep === 2 && (
              <Box ta='center' py='xl'>
                <Text c='dimmed'>הצמדות וחוקים - בקרוב</Text>
              </Box>
            )}
          </Stack>
        </ScrollArea>

        {/* Footer with Next/Save Button */}
        <Box
          style={{
            padding: '16px',
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
          }}
        >
          {currentStep === 1 ? (
            <Button fullWidth size='md' onClick={handleNext} disabled={isNextDisabled}>
              הבא
            </Button>
          ) : (
            <Button fullWidth size='md' onClick={handleSave}>
              שמור
            </Button>
          )}
        </Box>
      </Box>
    </FormProvider>
  )
})

EntityForm.displayName = 'EntityForm'
