import type { Account, Category, CategoryType } from '@/types/database'

export interface TransactionFiltersState {
  search: string
  type: CategoryType | 'all'
  categoryId: string
  accountId: string
  dateFrom: string
  dateTo: string
}

export const defaultFilters: TransactionFiltersState = {
  search: '',
  type: 'all',
  categoryId: 'all',
  accountId: 'all',
  dateFrom: '',
  dateTo: '',
}

const typeLabels: Record<CategoryType, string> = {
  expense: 'Gasto',
  income: 'Ingreso',
  saving: 'Ahorro',
}

interface TransactionFiltersProps {
  filters: TransactionFiltersState
  onChange: (filters: TransactionFiltersState) => void
  categories: Category[]
  accounts: Account[]
}

const fieldClasses =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20'

export function TransactionFilters({
  filters,
  onChange,
  categories,
  accounts,
}: TransactionFiltersProps) {
  const filteredCategories =
    filters.type === 'all' ? categories : categories.filter((c) => c.type === filters.type)

  function update<K extends keyof TransactionFiltersState>(
    key: K,
    value: TransactionFiltersState[K],
  ) {
    if (key === 'type') {
      // Si cambia el tipo, la categoría seleccionada puede ya no aplicar.
      onChange({ ...filters, type: value as TransactionFiltersState['type'], categoryId: 'all' })
      return
    }
    onChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.categoryId !== 'all' ||
    filters.accountId !== 'all' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== ''

  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-7">
        <label className="col-span-2 block md:col-span-1 lg:col-span-2">
          <span className="mb-1 block text-xs font-medium text-slate-500">Buscar</span>
          <input
            type="text"
            placeholder="Descripción o categoría"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className={fieldClasses}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Tipo</span>
          <select
            value={filters.type}
            onChange={(e) => update('type', e.target.value as TransactionFiltersState['type'])}
            className={fieldClasses}
          >
            <option value="all">Todos</option>
            {(Object.keys(typeLabels) as CategoryType[]).map((type) => (
              <option key={type} value={type}>
                {typeLabels[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Categoría</span>
          <select
            value={filters.categoryId}
            onChange={(e) => update('categoryId', e.target.value)}
            className={fieldClasses}
          >
            <option value="all">Todas</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Cuenta</span>
          <select
            value={filters.accountId}
            onChange={(e) => update('accountId', e.target.value)}
            className={fieldClasses}
          >
            <option value="all">Todas</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <div className="col-span-2 grid grid-cols-2 gap-3 md:col-span-3 lg:col-span-2">
          <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Desde</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update('dateFrom', e.target.value)}
            className={fieldClasses}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Hasta</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update('dateTo', e.target.value)}
            className={fieldClasses}
          />
        </label>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => onChange(defaultFilters)}
          className="mt-3 text-xs font-medium text-teal-700 hover:text-teal-800"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}