import { Loader, Select } from "@mantine/core";
import { useEffect, useState } from "react";
import type { WidgetProps } from "@rjsf/utils";
import { fetchOwningTeams } from "../../api/client";

export function OwningTeamAsyncSelect({
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
  const [teams, setTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadTeams = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOwningTeams();
        if (mounted) {
          setTeams(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load owning teams");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTeams();

    return () => {
      mounted = false;
    };
  }, []);

  const data = teams.map((team) => ({ value: team, label: team }));

  return (
    <Select
      id={id}
      data={data}
      label={label}
      required={required}
      searchable
      withAsterisk={required}
      value={typeof value === "string" ? value : null}
      placeholder={(options.placeholder as string | undefined) ?? placeholder ?? "Select owning team"}
      disabled={disabled || readonly || loading}
      onChange={(val) => onChange(val ?? undefined)}
      nothingFoundMessage={loading ? "Loading..." : "No teams found"}
      rightSection={loading ? <Loader size="xs" /> : undefined}
      error={error ?? undefined}
      clearable
    />
  );
}
