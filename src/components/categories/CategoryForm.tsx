import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import { categorySchema, type CategoryFormValues } from '@/lib/categorySchema'
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategoryMutations'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Category, CategoryType } from '@/types/database'

const typeLabels: Record<CategoryType, string> = {
  expense: 'Gasto',
  income: 'Ingreso',
  saving: 'Ahorro',
}

const colorPresets = [
  '#0f766e',
  '#0d9488',
  '#14b8a6',
  '#3b4c9e',
  '#4338ca',
  '#3730a3',
  '#b45309',
  '#c2410c',
  '#9a3412',
  '#a16207',
  '#b91c1c',
  '#be123c',
  '#78350f',
]

interface CategoryFormProps {
  editingCategory?: Category | null
  onDone?: () => void
}

export function CategoryForm({ editingCategory, onDone }: CategoryFormProps) {
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
      color: colorPresets[0],
    },
  })

  const selectedColor = watch('color')

  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name,
        type: editingCategory.type,
        color: editingCategory.color,
      })
    }
  }, [editingCategory, reset])

  async function onSubmit(values: CategoryFormValues) {
    if (editingCategory) {
      await updateCategory.mutateAsync({ id: editingCategory.id, input: values })
    } else {
      await createCategory.mutateAsync(values)
    }
    reset({ name: '', type: values.type, color: colorPresets[0] })
    onDone?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nombre"
        type="text"
        placeholder="Ej. Suscripciones"
        error={errors.name?.message}
        {...register('name')}
      />

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Tipo</span>
        <select
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
          {...register('type')}
        >
          {(Object.keys(typeLabels) as CategoryType[]).map((type) => (
            <option key={type} value={type}>
              {typeLabels[type]}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="mb-2 block text-sm font-medium text-slate-700">Color</span>
        <div className="flex flex-wrap gap-2">
          {colorPresets.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={clsx(
                'h-8 w-8 rounded-full border-2 transition-transform',
                selectedColor === color
                  ? 'scale-110 border-slate-800'
                  : 'border-transparent hover:scale-105',
              )}
              style={{ backgroundColor: color }}
              aria-label={color}
            />
          ))}
        </div>
        {errors.color && (
          <span className="mt-1 block text-xs text-rust-600">{errors.color.message}</span>
        )}
      </div>

      <Button type="submit" isLoading={isSubmitting}>
        {editingCategory ? 'Guardar cambios' : 'Crear categoría'}
      </Button>
    </form>
  )
}