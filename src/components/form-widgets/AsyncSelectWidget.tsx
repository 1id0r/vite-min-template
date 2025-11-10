import { Loader, Select } from "@mantine/core";
import { useEffect, useState } from "react";
import type { WidgetProps } from "@rjsf/utils";
import { request } from "../../api/client";

interface AsyncOptionsConfig {
  path: string;
  valueField?: string;
  labelField?: string;
  placeholder?: string;
}

interface SelectOption {
  label: string;
  value: string;
}

function normalizeOptions(data: unknown, config: AsyncOptionsConfig): SelectOption[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      if (typeof item === "string") {
        return { label: item, value: item };
      }

      if (typeof item === "object" && item !== null) {
        const valueKey = config.valueField ?? "value";
        const labelKey = config.labelField ?? "label";

        const value =
          (item as Record<string, unknown>)[valueKey] ??
          (item as Record<string, unknown>).id ??
          (item as Record<string, unknown>).name;
        const label =
          (item as Record<string, unknown>)[labelKey] ??
          (typeof value === "string" ? value : undefined);

        if (typeof value === "string" && typeof label === "string") {
          return { label, value };
        }
      }

      return null;
    })
    .filter((option): option is SelectOption => Boolean(option));
}

export function AsyncSelectWidget({
  id,
  label,
  required,
  value,
  onChange,
  disabled,
  readonly,
  options,
  placeholder,
}: WidgetProps) {
  const asyncConfig = (options.asyncOptions as AsyncOptionsConfig | undefined) ?? undefined;
  const [data, setData] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUrl = asyncConfig?.path;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!fetchUrl) {
        setError("Missing asyncOptions.path");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await request<unknown>(fetchUrl);
        if (mounted) {
          setData(normalizeOptions(response, asyncConfig ?? { path: fetchUrl }));
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load options");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [fetchUrl, JSON.stringify(asyncConfig)]);

  const selectData = data;
  const valueString = typeof value === "string" ? value : null;
  const finalPlaceholder =
    asyncConfig?.placeholder ??
    (options.placeholder as string | undefined) ??
    placeholder ??
    "Select option";

  return (
    <Select
      id={id}
      data={selectData}
      label={label}
      required={required}
      searchable
      withAsterisk={required}
      value={valueString}
      placeholder={finalPlaceholder}
      disabled={disabled || readonly || loading || !fetchUrl}
      onChange={(val) => onChange(val ?? undefined)}
      nothingFoundMessage={loading ? "Loading..." : "No results"}
      rightSection={loading ? <Loader size="xs" /> : undefined}
      error={error ?? undefined}
      clearable
    />
  );
}
