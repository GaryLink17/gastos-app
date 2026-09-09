import { Pencil, Trash2, Wallet, Landmark, CreditCard, PiggyBank } from 'lucide-react'
import type { Account, AccountType } from '@/types/database'
import { useDeleteAccount } from '@/hooks/useAccountMutations'

const typeLabels: Record<AccountType, string> = {
  cash: 'Efectivo',
  bank: 'Banco',
  credit_card: 'Tarjeta de crédito',
  savings: 'Ahorro',
}

const typeIcon: Record<AccountType, typeof Wallet> = {
  cash: Wallet,
  bank: Landmark,
  credit_card: CreditCard,
  savings: PiggyBank,
}

const typeIconBg: Record<AccountType, string> = {
  cash: 'bg-teal-50 text-teal-600',
  bank: 'bg-indigo-50 text-indigo-700',
  credit_card: 'bg-rust-50 text-rust-600',
  savings: 'bg-indigo-50 text-indigo-700',
}

interface AccountListProps {
  accounts: Account[]
  onEdit: (account: Account) => void
}

export function AccountList({ accounts, onEdit }: AccountListProps) {
  const deleteAccount = useDeleteAccount()

  if (accounts.length === 0) {
    return <p className="text-sm text-slate-500">Todavía no tienes cuentas registradas.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((a) => {
        const Icon = typeIcon[a.type]
        const isNegative = a.balance < 0
        return (
          <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${typeIconBg[a.type]}`}
                >
                  <Icon size={18} />
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{a.name}</div>
                  <div className="text-xs text-slate-500">{typeLabels[a.type]}</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(a)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-teal-700"
                  aria-label="Editar"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `¿Eliminar la cuenta "${a.name}"? Sus transacciones quedarán sin cuenta asignada.`,
                      )
                    ) {
                      deleteAccount.mutate(a.id, {
                        onError: () => alert('No se pudo eliminar la cuenta. Intentalo de nuevo.')
                      })
                    }
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rust-50 hover:text-rust-600"
                  aria-label="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div
              className={`mt-4 font-mono text-xl font-bold ${isNegative ? 'text-rust-600' : 'text-slate-800'}`}
            >
              {a.balance.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}
            </div>
          </div>
        )
      })}
    </div>
  )
}