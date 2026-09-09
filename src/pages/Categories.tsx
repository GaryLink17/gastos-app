import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import { CategoryForm } from '@/components/categories/CategoryForm'
import { CategoryList } from '@/components/categories/CategoryList'
import { Modal } from '@/components/ui/Modal'
import type { Category } from '@/types/database'

export function CategoriesPage() {
  const { data: categories = [], isLoading, isError } = useCategories()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  function openNew() {
    setEditingCategory(null)
    setIsFormOpen(true)
  }

  function openEdit(category: Category) {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  function close() {
    setIsFormOpen(false)
    setEditingCategory(null)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Categorías</h1>
        <button
          onClick={openNew}
          className="hidden items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black md:flex"
        >
          <Plus size={16} />
          Nueva categoría
        </button>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Cargando...</p>}
      {isError && (
        <p className="text-sm text-rust-600">Ocurrió un error al cargar tus categorías.</p>
      )}
      {!isLoading && !isError && <CategoryList categories={categories} onEdit={openEdit} />}

      {/* Botón flotante (móvil) */}
      <button
        onClick={openNew}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-slate-800 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-black md:hidden"
      >
        <Plus size={16} />
        Nueva
      </button>

      <Modal
        open={isFormOpen}
        onClose={close}
        title={editingCategory ? 'Editar categoría' : 'Nueva categoría'}
      >
        <CategoryForm editingCategory={editingCategory} onDone={close} />
      </Modal>
    </div>
  )
}