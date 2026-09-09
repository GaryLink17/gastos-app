import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Ingresa un nombre'),
  type: z.enum(['income', 'expense', 'saving']),
  color: z.string().min(1, 'Selecciona un color'),
})
export type CategoryFormValues = z.infer<typeof categorySchema>