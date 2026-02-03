/**
 * Form Schemas - Shared Zod Schemas
 * 
 * Contains reusable schemas imported by other files.
 * Most entity validation is in CreateEntityModal/schemas/entityFormSchema.ts
 */

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Link Schema
// ─────────────────────────────────────────────────────────────────────────────

export const LinkSchema = z.object({
  label: z.string().max(30, 'שם תצוגה חייב להיות עד 30 תווים').optional(),
  url: z.string().url('לינק לא תקין').optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Tree Selection Schema
// ─────────────────────────────────────────────────────────────────────────────

export const TreeSelectionSchema = z.object({
  vid: z.string(),
  displayName: z.string(),
})

export type TreeSelectionData = z.infer<typeof TreeSelectionSchema>
