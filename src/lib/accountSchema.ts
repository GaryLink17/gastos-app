import { z } from 'zod'

export const accountSchema = z.object({
  name: z.string().min(1, 'Ingresa un nombre'),
  type: z.enum(['cash', 'bank', 'credit_card', 'savings']),
  balance: z.coerce.number({ invalid_type_error: 'Ingresa un balance válido' }),
})
export type AccountFormValues = z.infer<typeof accountSchema>