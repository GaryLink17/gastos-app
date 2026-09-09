import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTransactions, type TransactionWithCategory } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useAccounts } from '@/hooks/useAccounts'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionList } from '@/components/transactions/TransactionList'
import {
  TransactionFilters,
  defaultFilters,
  type TransactionFiltersState,
} from '@/components/transactions/TransactionFilters'
import { Modal } from '@/components/ui/Modal'

export function TransactionsPage() {
  const { data: transactions = [], isLoading, isError } = useTransactions()
  const { data: categories = [] } = useCategories()
  const { data: accounts = [] } = useAccounts()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(
    null,
  )
  const [filters, setFilters] = useState<TransactionFiltersState>(defaultFilters)

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filters.type !== 'all' && t.type !== filters.type) return false
      if (filters.categoryId !== 'all' && t.category_id !== filters.categoryId) return false
      if (filters.accountId !== 'all' && t.account_id !== filters.accountId) return false
      if (filters.dateFrom && t.date < filters.dateFrom) return false
      if (filters.dateTo && t.date > filters.dateTo) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const matchesDescription = t.description?.toLowerCase().includes(q) ?? false
        const matchesCategory = t.categories?.name.toLowerCase().includes(q) ?? false
        if (!matchesDescription && !matchesCategory) return false
      }
      return true
    })
  }, [transactions, filters])

  function openNew() {
    setEditingTransaction(null)
    setIsFormOpen(true)
  }

  function openEdit(transaction: TransactionWithCategory) {
    setEditingTransaction(transaction)
    setIsFormOpen(true)
  }

  function close() {
    setIsFormOpen(false)
    setEditingTransaction(null)
  }

  const hasAnyTransactions = transactions.length > 0

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Transacciones</h1>
        <button
          onClick={openNew}
          className="hidden items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black md:flex"
        >
          <Plus size={16} />
          Nueva transacción
        </button>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Cargando...</p>}
      {isError && (
        <p className="text-sm text-rust-600">Ocurrió un error al cargar tus transacciones.</p>
      )}

      {!isLoading && !isError && hasAnyTransactions && (
        <TransactionFilters
          filters={filters}
          onChange={setFilters}
          categories={categories}
          accounts={accounts}
        />
      )}

      {!isLoading && !isError && (
        <TransactionList
          transactions={filteredTransactions}
          onEdit={openEdit}
          emptyMessage={
            hasAnyTransactions
              ? 'No hay transacciones que coincidan con los filtros.'
              : 'Todavía no tienes transacciones registradas.'
          }
        />
      )}

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
        title={editingTransaction ? 'Editar transacción' : 'Nueva transacción'}
      >
        <TransactionForm editingTransaction={editingTransaction} onDone={close} />
      </Modal>
    </div>
  )
}