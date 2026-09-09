import { useMemo } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useAccounts } from '@/hooks/useAccounts'
import { getMonthlyFlow, getExpenseByCategory } from '@/lib/dashboardStats'
import { FlowChart } from '@/components/dashboard/FlowChart'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { TransactionList } from '@/components/transactions/TransactionList'

function formatCurrency(value: number) {
  return value.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })
}

export function DashboardPage() {
  const { data: transactions = [], isLoading: loadingTx, isError: errorTx } = useTransactions()
  const { data: accounts = [], isLoading: loadingAcc, isError: errorAcc } = useAccounts()

  const monthTotals = useMemo(() => {
    const now = new Date()
    let income = 0
    let expense = 0
    let saving = 0
    for (const t of transactions) {
      const d = new Date(`${t.date}T00:00:00`)
      if (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) continue
      if (t.type === 'income') income += t.amount
      else if (t.type === 'expense') expense += t.amount
      else if (t.type === 'saving') saving += t.amount
    }
    return { income, expense, saving }
  }, [transactions])

  const totalBalance = useMemo(() => accounts.reduce((sum, a) => sum + a.balance, 0), [accounts])
  const monthlyFlow = useMemo(() => getMonthlyFlow(transactions), [transactions])
  const expenseByCategory = useMemo(() => getExpenseByCategory(transactions), [transactions])
  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions])

  const isLoading = loadingTx || loadingAcc
  const isError = errorTx || errorAcc

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      {isLoading && <p className="text-sm text-slate-500">Cargando...</p>}
      {isError && (
        <p className="text-sm text-rust-600">Ocurrió un error al cargar tu información.</p>
      )}

      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-medium text-slate-500">Balance total</div>
              <div className="mt-1 font-mono text-xl font-bold text-slate-800">
                {formatCurrency(totalBalance)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-medium text-slate-500">Ingresos del mes</div>
              <div className="mt-1 font-mono text-xl font-bold text-teal-700">
                {formatCurrency(monthTotals.income)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-medium text-slate-500">Gastos del mes</div>
              <div className="mt-1 font-mono text-xl font-bold text-rust-600">
                {formatCurrency(monthTotals.expense)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-medium text-slate-500">Ahorro del mes</div>
              <div className="mt-1 font-mono text-xl font-bold text-indigo-700">
                {formatCurrency(monthTotals.saving)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">
                Flujo (últimos 6 meses)
              </h2>
              <FlowChart data={monthlyFlow} />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">
                Gastos por categoría (este mes)
              </h2>
              <CategoryPieChart data={expenseByCategory} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Actividad reciente</h2>
            <TransactionList transactions={recentTransactions} readOnly />
          </div>
        </>
      )}
    </div>
  )
}