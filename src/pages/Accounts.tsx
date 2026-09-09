import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAccounts } from '@/hooks/useAccounts'
import { AccountForm } from '@/components/accounts/AccountForm'
import { AccountList } from '@/components/accounts/AccountList'
import { Modal } from '@/components/ui/Modal'
import type { Account } from '@/types/database'

export function AccountsPage() {
  const { data: accounts = [], isLoading, isError } = useAccounts()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  function openNew() {
    setEditingAccount(null)
    setIsFormOpen(true)
  }

  function openEdit(account: Account) {
    setEditingAccount(account)
    setIsFormOpen(true)
  }

  function close() {
    setIsFormOpen(false)
    setEditingAccount(null)
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Cuentas</h1>
        <button
          onClick={openNew}
          className="hidden items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black md:flex"
        >
          <Plus size={16} />
          Nueva cuenta
        </button>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Cargando...</p>}
      {isError && <p className="text-sm text-rust-600">Ocurrió un error al cargar tus cuentas.</p>}
      {!isLoading && !isError && <AccountList accounts={accounts} onEdit={openEdit} />}

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
        title={editingAccount ? 'Editar cuenta' : 'Nueva cuenta'}
      >
        <AccountForm editingAccount={editingAccount} onDone={close} />
      </Modal>
    </div>
  )
}