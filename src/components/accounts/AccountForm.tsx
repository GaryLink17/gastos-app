import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema, type AccountFormValues } from '@/lib/accountSchema'
import { useCreateAccount, useUpdateAccount } from '@/hooks/useAccountMutations'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Account, AccountType } from '@/types/database'

const typeLabels: Record<AccountType, string> = {
  cash: 'Efectivo',
  bank: 'Banco',
  credit_card: 'Tarjeta de crédito',
  savings: 'Ahorro',
}

interface AccountFormProps {
  editingAccount?: Account | null
  onDone?: () => void
}

export function AccountForm({ editingAccount, onDone }: AccountFormProps) {
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: 'cash',
      balance: 0,
    },
  })

  useEffect(() => {
    if (editingAccount) {
      reset({
        name: editingAccount.name,
        type: editingAccount.type,
        balance: editingAccount.balance,
      })
    }
  }, [editingAccount, reset])

  async function onSubmit(values: AccountFormValues) {
    setSubmitError(null)

    try {
      if (editingAccount) {
      await updateAccount.mutateAsync({
        id: editingAccount.id,
        input: { name: values.name, type: values.type },
      })
    } else {
      await createAccount.mutateAsync(values)
    }
    } catch {
      setSubmitError('No se pudo guardar la cuenta. Intentalo de nuevo.')
    }

    reset({ name: '', type: 'cash', balance: 0 })
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nombre"
        type="text"
        placeholder="Ej. Banco Popular"
        error={errors.name?.message}
        {...register('name')}
      />

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Tipo</span>
        <select
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
          {...register('type')}
        >
          {(Object.keys(typeLabels) as AccountType[]).map((type) => (
            <option key={type} value={type}>
              {typeLabels[type]}
            </option>
          ))}
        </select>
      </label>

      {editingAccount ? (
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Balance actual</span>
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-500">
            {editingAccount.balance.toLocaleString('es-DO', {
              style: 'currency',
              currency: 'DOP',
            })}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            El balance se actualiza automáticamente con tus transacciones.
          </p>
        </div>
      ) : (
        <Input
          label="Balance inicial"
          type="number"
          step="0.01"
          className="font-mono text-lg font-semibold"
          error={errors.balance?.message}
          {...register('balance')}
        />
      )}

      {submitError && <p className='text-sm text-rust-600'>{submitError}</p>}

      <Button type="submit" isLoading={isSubmitting}>
        {editingAccount ? 'Guardar cambios' : 'Crear cuenta'}
      </Button>
    </form>
  )
}