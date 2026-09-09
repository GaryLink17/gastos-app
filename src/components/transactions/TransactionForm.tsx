import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { transactionSchema, type TransactionFormValues } from '@/lib/transactionSchema'
import { useCategories } from '@/hooks/useCategories'
import { useAccounts } from '@/hooks/useAccounts'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactionMutations'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { CategoryType } from '@/types/database'
import type { TransactionWithCategory } from '@/hooks/useTransactions'

const typeLabels: Record<CategoryType, string> = {
  expense: 'Gasto',
  income: 'Ingreso',
  saving: 'Ahorro',
}

const typeTabActiveClasses: Record<CategoryType, string> = {
  expense: 'border-rust-50 bg-rust-50 text-rust-600',
  income: 'border-teal-50 bg-teal-50 text-teal-600',
  saving: 'border-indigo-50 bg-indigo-50 text-indigo-700',
}

interface TransactionFormProps {
  editingTransaction?: TransactionWithCategory | null
  onDone?: () => void
}

export function TransactionForm({ editingTransaction, onDone }: TransactionFormProps) {
  const { data: categories = [] } = useCategories()
  const { data: accounts = [] } = useAccounts()
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()

  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      category_id: '',
      account_id: '',
      amount: undefined,
      date: new Date().toISOString().slice(0, 10),
      description: '',
    },
  })

  const selectedType = watch('type')

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === selectedType),
    [categories, selectedType],
  )

  useEffect(() => {
    if (editingTransaction) {
      reset({
        type: editingTransaction.type,
        category_id: editingTransaction.category_id,
        account_id: editingTransaction.account_id ?? '',
        amount: editingTransaction.amount,
        date: editingTransaction.date,
        description: editingTransaction.description ?? '',
      })
    }
  }, [editingTransaction, reset])

  async function onSubmit(values: TransactionFormValues) {
    const input = {
      category_id: values.category_id,
      account_id: values.account_id,
      type: values.type,
      amount: values.amount,
      date: values.date,
      description: values.description || undefined,
    };

    try {
      if (editingTransaction) {
        await updateTransaction.mutateAsync({
          id: editingTransaction.id,
          input,
        });
      } else {
        await createTransaction.mutateAsync(input);
      }
    } catch {
      setSubmitError("No se pudo guardar la transaccion. Intentalo de nuevo.");
      return;
    }

    reset({
      type: values.type,
      category_id: "",
      account_id: values.account_id,
      amount: undefined,
      date: values.date,
      description: "",
    });
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex gap-1.5">
        {(Object.keys(typeLabels) as CategoryType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setValue('type', type)
              setValue('category_id', '')
            }}
            className={clsx(
              'flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
              selectedType === type
                ? typeTabActiveClasses[type]
                : 'border-slate-200 text-slate-500 hover:border-slate-300',
            )}
          >
            {typeLabels[type]}
          </button>
        ))}
      </div>

      <Input
        label="Monto"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        className="font-mono text-lg font-semibold"
        error={errors.amount?.message}
        {...register('amount')}
      />

      <Input
        label="Descripción (opcional)"
        type="text"
        placeholder="Ej. Supermercado La Sirena"
        error={errors.description?.message}
        {...register('description')}
      />

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Categoría</span>
        <select
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
          {...register('category_id')}
        >
          <option value="">Selecciona una categoría</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <span className="mt-1 block text-xs text-rust-600">{errors.category_id.message}</span>
        )}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Cuenta</span>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            {...register('account_id')}
          >
            <option value="">Selecciona</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {errors.account_id && (
            <span className="mt-1 block text-xs text-rust-600">{errors.account_id.message}</span>
          )}
        </label>

        <Input label="Fecha" type="date" error={errors.date?.message} {...register('date')} />
      </div>

      {submitError && <p className='text-sm text-rust-600'>{submitError}</p>}

      <Button type="submit" isLoading={isSubmitting}>
        {editingTransaction ? 'Guardar cambios' : 'Guardar transacción'}
      </Button>
    </form>
  )
}