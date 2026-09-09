import { Pencil, Trash2 } from 'lucide-react'
import type { Category, CategoryType } from '@/types/database'
import { useDeleteCategory } from '@/hooks/useCategoryMutations'

const typeLabels: Record<CategoryType, string> = {
  expense: 'Gastos',
  income: 'Ingresos',
  saving: 'Ahorros',
}

const typeOrder: CategoryType[] = ['expense', 'income', 'saving']

interface CategoryListProps {
  categories: Category[]
  onEdit: (category: Category) => void
}

export function CategoryList({ categories, onEdit }: CategoryListProps) {
  const deleteCategory = useDeleteCategory()

  if (categories.length === 0) {
    return <p className="text-sm text-slate-500">Todavía no tienes categorías.</p>
  }

  async function handleDelete(category: Category) {
    if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) return
    try {
      await deleteCategory.mutateAsync(category.id)
    } catch (err) {
      const code = (err as { code?: string } | null)?.code
      if (code === '23503') {
        alert(
          'No puedes eliminar esta categoría porque tiene transacciones asociadas. Elimina o reasigna esas transacciones primero.',
        )
      } else {
        alert('Ocurrió un error al eliminar la categoría.')
      }
    }
  }

  return (
    <div className="space-y-6">
      {typeOrder.map((type) => {
        const group = categories.filter((c) => c.type === type)
        if (group.length === 0) return null
        return (
          <div key={type}>
            <h2 className="mb-2 text-sm font-semibold text-slate-500">{typeLabels[type]}</h2>
            <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {group.map((c) => (
                <li key={c.id} className="flex items-center gap-3 p-3">
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="flex-1 text-sm font-medium text-slate-800">{c.name}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEdit(c)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-700"
                      aria-label="Editar"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rust-50 hover:text-rust-600"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}