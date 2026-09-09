import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'saving']),
  category_id: z.string().min(1, 'Selecciona una categoría'),
  account_id: z.string().min(1, 'Selecciona una cuenta'),
  amount: z.coerce
    .number({ invalid_type_error: 'Ingresa un monto válido' })
    .positive('El monto debe ser mayor a 0'),
  date: z.string().min(1, 'Selecciona una fecha'),
  description: z.string().optional(),
})
export type TransactionFormValues = z.infer<typeof transactionSchema>