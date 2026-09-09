import { format, parseISO } from 'date-fns'
import { Pencil, Trash2, ArrowDownLeft, ArrowUpRight, Layers } from 'lucide-react'
import type { TransactionWithCategory } from '@/hooks/useTransactions'
import { useDeleteTransaction } from '@/hooks/useTransactionMutations'
import type { CategoryType } from '@/types/database'

const typeIconBg: Record<CategoryType, string> = {
  income: 'bg-teal-50 text-teal-600',
  expense: 'bg-rust-50 text-rust-600',
  saving: 'bg-indigo-50 text-indigo-700',
}

const typeIcon: Record<CategoryType, typeof ArrowDownLeft> = {
  income: ArrowDownLeft,
  expense: ArrowUpRight,
  saving: Layers,
}

const amountColor: Record<CategoryType, string> = {
  income: 'text-teal-700',
  expense: 'text-rust-600',
  saving: 'text-indigo-700',
}

const amountSign: Record<CategoryType, string> = {
  income: '+',
  expense: '-',
  saving: '',
}

interface TransactionListProps {
  transactions: TransactionWithCategory[]
  onEdit?: (transaction: TransactionWithCategory) => void
  emptyMessage?: string
  readOnly?: boolean
}

export function TransactionList({ transactions, onEdit, emptyMessage, readOnly }: TransactionListProps) {
  const deleteTransaction = useDeleteTransaction()

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        {emptyMessage ?? 'Todavía no tienes transacciones registradas.'}
      </p>
    )
  }

  return (
    <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {transactions.map((t) => {
        const Icon = typeIcon[t.type]
        return (
          <li key={t.id} className="flex items-center gap-3 p-3">
            <span
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${typeIconBg[t.type]}`}
            >
              <Icon size={16} />
            </span>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-800">
                {t.description || t.categories?.name || "Transacción"}
              </div>
              <div className="truncate text-xs text-slate-500">
                {t.description
                  ? (t.categories?.name ?? "Sin categoría")
                  : format(parseISO(t.date), "dd/MM/yyyy")}
              </div>
            </div>

            <span
              className={`whitespace-nowrap font-mono text-sm font-semibold ${amountColor[t.type]}`}
            >
              {amountSign[t.type]}
              {t.amount.toLocaleString("es-DO", {
                style: "currency",
                currency: "DOP",
              })}
            </span>

            {!readOnly && (
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit?.(t)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-700"
                  aria-label="Editar"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => {
                    if (!confirm("¿Eliminar esta transacción?")) return;
                    deleteTransaction.mutate(t.id, {
                      onError: () =>
                        alert(
                          "No se pudo eliminar la transacción. Intenta de nuevo.",
                        ),
                    });
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rust-50 hover:text-rust-600"
                  aria-label="Eliminar"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  )
}