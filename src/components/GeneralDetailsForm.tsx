import { ActionIcon, Group, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";

export interface LinkField {
  label: string;
  url: string;
}

export interface GeneralDetailsFormValue {
  displayName: string;
  description: string;
  entityType: string;
  contactInfo: string;
  responsibleParty: string;
  links: LinkField[];
}

export interface GeneralFormErrors {
  displayName?: string;
  description?: string;
  entityType?: string;
}

interface GeneralDetailsFormProps {
  value: GeneralDetailsFormValue;
  errors?: GeneralFormErrors;
  onChange: (nextValue: GeneralDetailsFormValue) => void;
  onFieldTouched?: (field: keyof GeneralFormErrors) => void;
}

export function GeneralDetailsForm({ value, errors, onChange, onFieldTouched }: GeneralDetailsFormProps) {
  const updateField = <Key extends keyof GeneralDetailsFormValue>(field: Key, fieldValue: GeneralDetailsFormValue[Key]) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });

    if (onFieldTouched && (field === "displayName" || field === "description" || field === "entityType")) {
      onFieldTouched(field);
    }
  };

  const updateLink = (index: number, key: keyof LinkField, linkValue: string) => {
    const nextLinks = value.links.map((link, idx) => (idx === index ? { ...link, [key]: linkValue } : link));
    onChange({ ...value, links: nextLinks });
  };

  const addLink = () => {
    onChange({
      ...value,
      links: [...value.links, { label: "", url: "" }],
    });
  };

  const removeLink = (index: number) => {
    const nextLinks = value.links.filter((_, idx) => idx !== index);
    onChange({ ...value, links: nextLinks.length ? nextLinks : [{ label: "", url: "" }] });
  };

  return (
    <Stack gap="md">
      <Group grow align="flex-start">
        <TextInput
          label="שם תצוגה"
          placeholder="Display name"
          required
          value={value.displayName}
          onChange={(event) => updateField("displayName", event.currentTarget.value)}
          error={errors?.displayName}
        />
        <TextInput
          label="סוג יישות"
          placeholder="Entity type"
          value={value.entityType}
          disabled
          error={errors?.entityType}
        />
      </Group>

      <Textarea
        label="תיאור"
        placeholder="Description"
        minRows={3}
        required
        value={value.description}
        onChange={(event) => updateField("description", event.currentTarget.value)}
        error={errors?.description}
      />

      <Group grow align="flex-start">
        <TextInput
          label="פרטי התקשרות"
          placeholder="Contact info"
          value={value.contactInfo}
          onChange={(event) => updateField("contactInfo", event.currentTarget.value)}
        />
        <TextInput
          label="גורם אחראי"
          placeholder="Responsible party"
          value={value.responsibleParty}
          onChange={(event) => updateField("responsibleParty", event.currentTarget.value)}
        />
      </Group>

      <Stack gap="xs">
        <Text fw={500}>לינקים</Text>
        <Stack gap="xs">
          {value.links.map((link, index) => (
            <Group key={`link-${index}`} gap="xs" align="flex-end">
              <ActionIcon
                variant="subtle"
                color={index === 0 ? "blue" : "red"}
                onClick={() => (index === 0 ? addLink() : removeLink(index))}
                aria-label={index === 0 ? "הוסף לינק" : "הסר לינק"}
              >
                {index === 0 ? <FiPlusCircle size={18} /> : <FiMinusCircle size={18} />}
              </ActionIcon>
              <TextInput
                placeholder="שם תצוגה ללינק"
                value={link.label}
                onChange={(event) => updateLink(index, "label", event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <TextInput
                placeholder="לינק"
                value={link.url}
                onChange={(event) => updateLink(index, "url", event.currentTarget.value)}
                style={{ flex: 1 }}
              />
            </Group>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
