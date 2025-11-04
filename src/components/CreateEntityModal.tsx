import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Menu,
  Modal,
  Paper,
  SegmentedControl,
  Stack,
  Stepper,
  Text,
} from "@mantine/core";
import FormComponent, { withTheme, type IChangeEvent } from "@rjsf/core";
import { Theme as MantineTheme } from "@rjsf/mantine";
import validator from "@rjsf/validator-ajv8";
import { fetchEntityConfig, fetchFormDefinition } from "../api/client";
import type {
  CategoryDefinition,
  EntityConfig,
  FlowDefinition,
  FormDefinition,
  StepKey,
  SystemDefinition,
} from "../types/entity";

const RjsfForm = withTheme(MantineTheme);

type FlowId = string;
type FormStatus = "idle" | "loading" | "success" | "error";

type RjsfFormRef = InstanceType<typeof FormComponent>;

interface FormState {
  [key: string]: Record<StepKey, unknown>;
}

interface AggregatedResult {
  flow: FlowId;
  systemId: string;
  formData: Record<StepKey, unknown>;
}

type FormDefinitionsState = Record<string, Partial<Record<StepKey, FormDefinition>>>;
type FormStatusState = Record<string, Partial<Record<StepKey, FormStatus>>>;
type FormErrorState = Record<string, Partial<Record<StepKey, string>>>;

const createEmptyStepState = (): Record<StepKey, unknown> => ({
  system: {},
  general: {},
  monitor: {},
});

export function CreateEntityModal() {
  const [opened, setOpened] = useState(false);
  const [flow, setFlow] = useState<FlowId>("display");
  const [activeStep, setActiveStep] = useState(0);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>({});
  const [result, setResult] = useState<AggregatedResult | null>(null);
  const [config, setConfig] = useState<EntityConfig | null>(null);
  const [configStatus, setConfigStatus] =
    useState<"idle" | "loading" | "error" | "success">("idle");
  const [configError, setConfigError] = useState<string | null>(null);
  const [configReloadKey, setConfigReloadKey] = useState(0);
  const [formDefinitions, setFormDefinitions] = useState<FormDefinitionsState>({});
  const [formStatus, setFormStatus] = useState<FormStatusState>({});
  const [formErrors, setFormErrors] = useState<FormErrorState>({});
  const formRefs = useRef<Record<StepKey, RjsfFormRef | null>>({
    system: null,
    general: null,
    monitor: null,
  });

  const handleConfigRetry = useCallback(() => {
    setConfigReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadConfig = async () => {
      setConfigStatus("loading");
      setConfigError(null);

      try {
        const data = await fetchEntityConfig();
        if (!cancelled) {
          setConfig(data);
          setConfigStatus("success");
        }
      } catch (error) {
        if (!cancelled) {
          setConfigStatus("error");
          setConfigError(
            error instanceof Error ? error.message : "Failed to load configuration"
          );
        }
      }
    };

    loadConfig();

    return () => {
      cancelled = true;
    };
  }, [configReloadKey]);

  useEffect(() => {
    if (!config) {
      return;
    }

    if (config.flows[flow]) {
      return;
    }

    const [firstFlow] = Object.values<FlowDefinition>(config.flows);
    if (firstFlow) {
      setFlow(firstFlow.id);
      setActiveStep(0);
      setSelectedSystem(null);
    }
  }, [config, flow]);

  const currentFlow = config ? config.flows[flow] ?? null : null;

  useEffect(() => {
    if (!currentFlow) {
      return;
    }

    if (activeStep > currentFlow.steps.length) {
      setActiveStep(0);
    }
  }, [currentFlow, activeStep]);

  const stepKeys: StepKey[] = currentFlow?.steps ?? [];
  const isCompleted = currentFlow ? activeStep === stepKeys.length : false;
  const activeStepKey = !isCompleted ? stepKeys[activeStep] ?? null : null;

  const applyInitialData = useCallback(
    (systemId: string, stepKey: StepKey, definition: FormDefinition) => {
      const { initialData } = definition;
      setFormState((prev) => {
        const existingSystemState = prev[systemId] ?? createEmptyStepState();
        const currentValue = existingSystemState[stepKey];

        const shouldApplyInitial =
          initialData !== undefined &&
          (currentValue === undefined ||
            (typeof currentValue === "object" &&
              currentValue !== null &&
              Object.keys(currentValue as Record<string, unknown>).length === 0));

        if (!prev[systemId] || shouldApplyInitial) {
          return {
            ...prev,
            [systemId]: {
              ...existingSystemState,
              ...(shouldApplyInitial ? { [stepKey]: initialData } : {}),
            },
          };
        }

        return prev;
      });
    },
    []
  );

  const ensureFormState = useCallback((systemId: string) => {
    setFormState((prev) => {
      if (prev[systemId]) {
        return prev;
      }

      return {
        ...prev,
        [systemId]: createEmptyStepState(),
      };
    });
  }, []);

  const requestFormDefinition = useCallback(
    async (systemId: string, stepKey: StepKey) => {
      ensureFormState(systemId);

      setFormStatus((prev) => ({
        ...prev,
        [systemId]: {
          ...prev[systemId],
          [stepKey]: "loading",
        },
      }));
      setFormErrors((prev) => ({
        ...prev,
        [systemId]: {
          ...prev[systemId],
          [stepKey]: undefined,
        },
      }));

      try {
        const definition = await fetchFormDefinition(systemId, stepKey);
        setFormDefinitions((prev) => ({
          ...prev,
          [systemId]: {
            ...prev[systemId],
            [stepKey]: definition,
          },
        }));
        setFormStatus((prev) => ({
          ...prev,
          [systemId]: {
            ...prev[systemId],
            [stepKey]: "success",
          },
        }));
        applyInitialData(systemId, stepKey, definition);
        return definition;
      } catch (error) {
        setFormStatus((prev) => ({
          ...prev,
          [systemId]: {
            ...prev[systemId],
            [stepKey]: "error",
          },
        }));
        setFormErrors((prev) => ({
          ...prev,
          [systemId]: {
            ...prev[systemId],
            [stepKey]:
              error instanceof Error ? error.message : "Failed to load form definition",
          },
        }));
        throw error;
      }
    },
    [applyInitialData, ensureFormState]
  );

  useEffect(() => {
    if (!selectedSystem || !activeStepKey || activeStepKey === "system") {
      return;
    }

    const definition = formDefinitions[selectedSystem]?.[activeStepKey];
    const status = formStatus[selectedSystem]?.[activeStepKey];

    if (definition || status === "loading") {
      return;
    }

    requestFormDefinition(selectedSystem, activeStepKey).catch(() => {
      // error state handled via formStatus/formErrors
    });
  }, [
    activeStepKey,
    formDefinitions,
    formStatus,
    requestFormDefinition,
    selectedSystem,
  ]);

  useEffect(() => {
    if (!selectedSystem || !activeStepKey || activeStepKey === "system") {
      return;
    }

    const definition = formDefinitions[selectedSystem]?.[activeStepKey];
    if (definition) {
      applyInitialData(selectedSystem, activeStepKey, definition);
    }
  }, [activeStepKey, applyInitialData, formDefinitions, selectedSystem]);

  const selectedSystemConfig =
    selectedSystem && config ? config.systems[selectedSystem] ?? null : null;

  const currentFormState = selectedSystem
    ? formState[selectedSystem] ?? createEmptyStepState()
    : createEmptyStepState();

  const canMoveNext = Boolean(selectedSystem);

  const goToNextStep = useCallback(() => {
    setActiveStep((step) => {
      const next = step + 1;
      return Math.min(next, stepKeys.length);
    });
  }, [stepKeys.length]);

  const goToPreviousStep = useCallback(() => {
    setActiveStep((step) => Math.max(step - 1, 0));
  }, []);

  const aggregateResult = useCallback(() => {
    if (!selectedSystem) {
      return null;
    }

    const data = stepKeys.reduce<Record<StepKey, unknown>>((acc, key) => {
      acc[key] = currentFormState[key];
      return acc;
    }, {} as Record<StepKey, unknown>);

    return {
      flow,
      systemId: selectedSystem,
      formData: data,
    };
  }, [currentFormState, flow, selectedSystem, stepKeys]);

  const handleCreate = useCallback(() => {
    const aggregate = aggregateResult();
    if (!aggregate) {
      return;
    }

    setResult(aggregate);
    setActiveStep(stepKeys.length);
  }, [aggregateResult, stepKeys.length]);

  const handleAdvance = useCallback(() => {
    if (!stepKeys.length) {
      return;
    }

    const currentKey = stepKeys[activeStep];
    if (!currentKey) {
      return;
    }

    if (currentKey === "system" && !canMoveNext) {
      return;
    }

    const formRef = formRefs.current[currentKey];

    if (formRef && typeof formRef.submit === "function") {
      formRef.submit();
    } else if (activeStep === stepKeys.length - 1) {
      handleCreate();
    } else {
      goToNextStep();
    }
  }, [activeStep, canMoveNext, goToNextStep, handleCreate, stepKeys]);

  const handleOpen = useCallback(() => {
    setOpened(true);
  }, []);

  const resetRefs = useCallback(() => {
    formRefs.current = {
      system: null,
      general: null,
      monitor: null,
    };
  }, []);

  const resetState = useCallback(() => {
    setActiveStep(0);
    setSelectedSystem(null);
    setResult(null);
    setFormState({});
    resetRefs();
  }, [resetRefs]);

  const handleClose = useCallback(() => {
    setOpened(false);
    resetState();
  }, [resetState]);

  const handleFlowChange = useCallback((value: string) => {
    const nextFlow = value as FlowId;
    setFlow(nextFlow);
    setActiveStep(0);
    setResult(null);
    setSelectedSystem(null);
  }, []);

  const handleSystemSelect = useCallback(
    (systemId: string) => {
      setSelectedSystem(systemId);
      ensureFormState(systemId);
      setActiveStep(stepKeys.length > 1 ? 1 : 0);
      setResult(null);
    },
    [ensureFormState, stepKeys.length]
  );

  const handleReturnToSystemStep = useCallback(() => {
    setActiveStep(0);
  }, []);

  const onFormChange = useCallback(
    (systemId: string, key: StepKey, change: IChangeEvent) => {
      setFormState((prev) => ({
        ...prev,
        [systemId]: {
          ...(prev[systemId] ?? {}),
          [key]: change.formData,
        },
      }));
    },
    []
  );

  const onFormSubmit = useCallback(
    (key: StepKey, change: IChangeEvent) => {
      if (!selectedSystem) {
        return;
      }

      setFormState((prev) => ({
        ...prev,
        [selectedSystem]: {
          ...(prev[selectedSystem] ?? {}),
          [key]: change.formData,
        },
      }));

      if (stepKeys[activeStep] === key) {
        if (activeStep === stepKeys.length - 1) {
          handleCreate();
        } else {
          goToNextStep();
        }
      }
    },
    [activeStep, goToNextStep, handleCreate, selectedSystem, stepKeys]
  );

  const attachFormRef = useCallback((key: StepKey, ref: RjsfFormRef | null) => {
    formRefs.current[key] = ref;
  }, []);

  const renderForm = useCallback(
    (key: StepKey) => {
      if (!selectedSystem) {
        return (
          <Alert color="blue" title="Select a system">
            Choose one of the templates from the menu to unlock this step.
          </Alert>
        );
      }

      const definition = formDefinitions[selectedSystem]?.[key];
      const status = formStatus[selectedSystem]?.[key];
      const error = formErrors[selectedSystem]?.[key];

      if (status === "error" && !definition) {
        return (
          <Paper withBorder shadow="xs" p="md">
            <Stack gap="sm">
              <Alert color="red" title="Failed to load form">
                {error ?? "Unable to fetch the form definition. Try again."}
              </Alert>
              <Group justify="flex-end">
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => requestFormDefinition(selectedSystem, key)}
                >
                  Retry
                </Button>
              </Group>
            </Stack>
          </Paper>
        );
      }

      if (!definition) {
        return (
          <Paper withBorder shadow="xs" p="md">
            <Center>
              <Loader size="sm" />
            </Center>
          </Paper>
        );
      }

      const combinedUiSchema = {
        "ui:submitButtonOptions": {
          norender: true,
        },
        ...(definition.uiSchema ?? {}),
      };

      return (
        <Paper withBorder shadow="xs" p="md">
          <RjsfForm
            schema={definition.schema}
            uiSchema={combinedUiSchema}
            formData={currentFormState[key]}
            validator={validator}
            liveValidate
            ref={(ref) => attachFormRef(key, ref)}
            onChange={(change) => {
              if (!selectedSystem) {
                return;
              }
              onFormChange(selectedSystem, key, change);
            }}
            onSubmit={(change) => onFormSubmit(key, change)}
          />
        </Paper>
      );
    },
    [
      attachFormRef,
      currentFormState,
      formDefinitions,
      formErrors,
      formStatus,
      onFormChange,
      onFormSubmit,
      requestFormDefinition,
      selectedSystem,
    ]
  );

  const flowSelection = useMemo(() => {
    if (!config) {
      return [];
    }

    return Object.values<FlowDefinition>(config.flows).map((item) => ({
      label: item.label,
      value: item.id,
    }));
  }, [config]);

  const categories = (config?.categories ?? []) as CategoryDefinition[];
  const systems = (config?.systems ?? {}) as Record<string, SystemDefinition>;
  const stepDefinitions = config?.steps;
  const flowDescription = currentFlow?.description?.trim();
  const nextButtonDisabled =
    (activeStepKey === "system" && !canMoveNext) ||
    (activeStepKey !== null &&
      activeStepKey !== "system" &&
      selectedSystem !== null &&
      formStatus[selectedSystem]?.[activeStepKey] === "loading");

  return (
    <>
      <Button onClick={handleOpen}>Create entity</Button>
      <Modal
        opened={opened}
        onClose={handleClose}
        title="Create new entity"
        size="xl"
        radius="md"
      >
        <Stack>
          {configStatus === "loading" && !config && (
            <Center py="lg">
              <Loader />
            </Center>
          )}

          {configStatus === "error" && !config && (
            <Alert color="red" title="Unable to load configuration">
              <Stack gap="sm">
                <Text size="sm">
                  {configError ?? "Check that the API is running on port 8000 and retry."}
                </Text>
                <Group justify="flex-end">
                  <Button size="xs" variant="light" onClick={handleConfigRetry}>
                    Retry
                  </Button>
                </Group>
              </Stack>
            </Alert>
          )}

          {config && currentFlow && (
            <>
              <Stepper
                active={activeStep}
                allowNextStepsSelect={false}
                styles={(theme) => ({
                  step: {
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  },
                  stepBody: {
                    marginLeft: 0,
                    marginTop: theme.spacing.xs,
                  },
                  stepLabel: {
                    fontSize: theme.fontSizes.sm,
                    fontWeight: 500,
                  },
                })}
              >
                {stepKeys.map((key) => {
                  const definition = stepDefinitions?.[key];
                  return (
                    <Stepper.Step
                      key={key}
                      label={definition?.label ?? key}
                    />
                  );
                })}
                <Stepper.Completed>{null}</Stepper.Completed>
              </Stepper>

              {!isCompleted && activeStepKey === "system" && (
                <>
                  <SegmentedControl
                    fullWidth
                    value={flow}
                    onChange={handleFlowChange}
                    data={flowSelection}
                    aria-label="Choose creation flow"
                  />

                  {flowDescription && (
                    <Text c="dimmed" size="sm">
                      {flowDescription}
                    </Text>
                  )}
                </>
              )}

              {!isCompleted && activeStepKey === "system" && (
                <Paper withBorder p="md" shadow="xs">
                  <Stack gap="sm">
                    <Group gap="xs" justify="space-between">
                      <Text fw={500}>System template</Text>
                      {selectedSystemConfig ? (
                        <Text size="sm" c="dimmed">
                          {selectedSystemConfig.description}
                        </Text>
                      ) : (
                        <Text size="sm" c="dimmed">
                          Pick a system to continue
                        </Text>
                      )}
                    </Group>
                    <Stack
                      gap="xs"
                      style={{
                        width: "50%",
                        marginLeft: "auto",
                      }}
                    >
                      {categories.map((category) => (
                        <Menu
                          key={category.id}
                          trigger="hover"
                          position="right-start"
                          withinPortal
                        >
                          <Menu.Target>
                            <Button
                              variant="light"
                              fullWidth
                              style={{ justifyContent: "space-between" }}
                            >
                              {category.label}
                            </Button>
                          </Menu.Target>
                          <Menu.Dropdown>
                            {category.systemIds.map((systemId) => {
                              const system = systems[systemId];
                              if (!system) {
                                return null;
                              }
                              return (
                                <Menu.Item
                                  key={systemId}
                                  onClick={() => handleSystemSelect(systemId)}
                                >
                                  {system.label}
                                </Menu.Item>
                              );
                            })}
                          </Menu.Dropdown>
                        </Menu>
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              )}

              {!isCompleted && activeStepKey && activeStepKey !== "system" && (
                <Stack gap="md">
                  <Group justify="flex-end">
                    <Button
                      variant="subtle"
                      size="compact-sm"
                      onClick={handleReturnToSystemStep}
                    >
                      Change system
                    </Button>
                  </Group>
                  {renderForm(activeStepKey)}
                </Stack>
              )}

              {isCompleted && (
                <Stack>
                  <Alert color="green" title="Entity ready to create">
                    The configuration is assembled from API definitions. Submit it to your API
                    or persist it as needed.
                  </Alert>
                  {result && (
                    <Box component="pre" bg="gray.0" p="sm" style={{ overflowX: "auto" }}>
                      {JSON.stringify(result, null, 2)}
                    </Box>
                  )}
                  <Group justify="flex-end">
                    <Button onClick={handleClose}>Close</Button>
                  </Group>
                </Stack>
              )}

              {!isCompleted && (
                <>
                  <Divider />
                  <Group justify="space-between">
                    <Button
                      variant="default"
                      onClick={goToPreviousStep}
                      disabled={activeStep === 0}
                    >
                      Back
                    </Button>
                    <Group>
                      <Button variant="default" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button onClick={handleAdvance} disabled={nextButtonDisabled}>
                        {activeStep === stepKeys.length - 1 ? "Create entity" : "Next"}
                      </Button>
                    </Group>
                  </Group>
                </>
              )}
            </>
          )}
        </Stack>
      </Modal>
    </>
  );
}
