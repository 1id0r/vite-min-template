import { useState } from 'react'
import { Button, Modal, Stack } from '@mantine/core'
import { EntityFlowContent } from './EntityFlowContent'
import { useEntityFlowState } from './hooks/useEntityFlowState'

export function CreateEntityModal() {
  const [opened, setOpened] = useState(false)
  const {
    config,
    configStatus,
    configError,
    handleConfigRetry,
    flow,
    flowOptions,
    handleFlowChange,
    activeStep,
    activeStepKey,
    isCompleted,
    stepKeys,
    stepDefinitions,
    flowDescription,
    selectedSystem,
    selectedSystemConfig,
    categories,
    systems,
    nextButtonDisabled,
    goToPreviousStep,
    handleAdvance,
    result,
    resetFlowState,
    formDefinitions,
    formStatus,
    formErrors,
    currentFormState,
    attachFormRef,
    onFormChange,
    onFormSubmit,
    requestFormDefinition,
    handleSystemSelect,
    annotateSystemIcon,
  } = useEntityFlowState()

  const handleOpen = () => setOpened(true)
  const handleClose = () => {
    setOpened(false)
    resetFlowState()
  }

  return (
    <>
      <Button onClick={handleOpen}>Create entity</Button>
      <Modal
        opened={opened}
        onClose={handleClose}
        title='Create new entity'
        size='xl'
        radius='md'
        styles={{
          body: {
            minHeight: 640,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Stack style={{ flex: 1 }}>
          <EntityFlowContent
            configStatus={configStatus}
            configError={configError}
            config={config}
            handleConfigRetry={handleConfigRetry}
            flow={flow}
            flowOptions={flowOptions}
            handleFlowChange={handleFlowChange}
            activeStep={activeStep}
            activeStepKey={activeStepKey}
            isCompleted={isCompleted}
            stepKeys={stepKeys}
            stepDefinitions={stepDefinitions}
            flowDescription={flowDescription}
            selectedSystem={selectedSystem}
            selectedSystemConfig={selectedSystemConfig ?? null}
            categories={categories}
            systems={systems}
            nextButtonDisabled={nextButtonDisabled}
            goToPreviousStep={goToPreviousStep}
            handleAdvance={handleAdvance}
            result={result}
            onClose={handleClose}
            formDefinitions={formDefinitions}
            formStatus={formStatus}
            formErrors={formErrors}
            currentFormState={currentFormState}
            attachFormRef={attachFormRef}
            onFormChange={onFormChange}
            onFormSubmit={onFormSubmit}
            requestFormDefinition={requestFormDefinition}
            handleSystemSelect={handleSystemSelect}
            annotateSystemIcon={annotateSystemIcon}
          />
        </Stack>
      </Modal>
    </>
  )
}
