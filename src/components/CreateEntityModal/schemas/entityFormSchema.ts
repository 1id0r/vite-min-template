/**
 * Entity Form Schema
 * 
 * Zod validation schema for entity creation form.
 * Separated from the hook for cleaner imports and reusability.
 */

import { z } from 'zod'
import { LinkSchema, TreeSelectionSchema } from '../../../schemas/formSchemas'

/** Zod validation schema for entity form */
export const EntityFormSchema = z.object({
  flow: z.enum(['monitor', 'display']),
  systemId: z.string().optional(), // Optional - display flow doesn't require system
  displayName: z.string().min(1, 'שם תצוגה הוא שדה חובה').max(50, 'שם תצוגה חייב להיות עד 50 תווים'),
  entityType: z.string(),
  description: z.string().min(1, 'תיאור הוא שדה חובה').max(200, 'תיאור חייב להיות עד 200 תווים'),
  contactInfo: z.string().regex(/^[0-9\-+() ]*$/, 'פרטי התקשרות יכולים להכיל רק מספרים ותווי פיסוק').optional().or(z.literal('')),
  responsibleParty: z.string().max(50, 'גורם אחראי חייב להיות עד 50 תווים').optional(),
  links: z.array(LinkSchema).optional(),
  icon: z.string().optional(),
  monitor: z.record(z.string(), z.unknown()).optional(),
  measurements: z.array(TreeSelectionSchema).optional(),
  attachments: z.array(z.any()).optional(), // Using any to avoid complex union type issues
  
  // Step 2 Fields
  entityRules: z.array(z.object({
     ruleKey: z.string(),
     ruleLabel: z.string(),
     enabled: z.boolean(),
     data: z.record(z.string(), z.any())
  })).optional(),
  
  urls: z.array(z.object({
     url: z.string(),
     timeout: z.number().optional()
  })).optional(),
  
  elastic: z.record(z.string(), z.any()).optional(),
})

export type EntityFormSchemaType = z.infer<typeof EntityFormSchema>
