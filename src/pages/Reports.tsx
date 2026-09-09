import { useMemo, useState } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { getMonthlyFlow } from '@/lib/dashboardStats'
import { getCategoryDistribution, getSavingsEvolution } from '@/lib/reportsStats'
import { IncomeExpenseTrend } from '@/components/reports/IncomeExpenseTrend'
import { SavingsEvolutionChart } from '@/components/reports/SavingsEvolutionChart'
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown'
import type { CategoryType } from '@/types/database'

const periodOptions = [
  { value: 3, label: 'Últimos 3 meses' },
  { value: 6, label: 'Últimos 6 meses' },
  { value: 12, label: 'Últimos 12 meses' },
]

const typeLabels: Record<CategoryType, string> = {
  expense: 'Gastos',
  income: 'Ingresos',
  saving: 'Ahorros',
}

export function ReportsPage() {
  const { data: transactions = [], isLoading, isError } = useTransactions()
  const [monthsBack, setMonthsBack] = useState(6)
  const [distributionType, setDistributionType] = useState<CategoryType>('expense')

  const flow = useMemo(() => getMonthlyFlow(transactions, monthsBack), [transactions, monthsBack])
  const distribution = useMemo(
    () => getCategoryDistribution(transactions, distributionType, monthsBack),
    [transactions, distributionType, monthsBack],
  )
  const savingsEvolution = useMemo(
    () => getSavingsEvolution(transactions, monthsBack),
    [transactions, monthsBack],
  )

  const distributionEmptyMessage = `Todavía no tienes ${typeLabels[distributionType].toLowerCase()} en este período.`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Reportes</h1>
        <select
          value={monthsBack}
          onChange={(e) => setMonthsBack(Number(e.target.value))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
        >
          {periodOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Cargando...</p>}
      {isError && (
        <p className="text-sm text-rust-600">Ocurrió un error al cargar tus transacciones.</p>
      )}

      {!isLoading && !isError && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Ingresos vs. gastos</h2>
            <IncomeExpenseTrend data={flow} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-700">Distribución por categoría</h2>
              <div className="flex gap-1.5">
                {(Object.keys(typeLabels) as CategoryType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setDistributionType(type)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      distributionType === type
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {typeLabels[type]}
                  </button>
                ))}
              </div>
            </div>
            <CategoryBreakdown data={distribution} emptyMessage={distributionEmptyMessage} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Evolución de ahorros</h2>
            <SavingsEvolutionChart data={savingsEvolution} />
          </div>
        </>
      )}
    </div>
  )
}