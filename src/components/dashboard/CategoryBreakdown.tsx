import { groupTopCategories, type CategoryShare } from '@/lib/dashboardStats'

function formatCurrency(value: number) {
  return value.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })
}

interface CategoryBreakdownProps {
  data: CategoryShare[]
  emptyMessage?: string
}

export function CategoryBreakdown({ data, emptyMessage }: CategoryBreakdownProps) {
  if (data.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center text-center text-sm text-slate-500">
        {emptyMessage ?? 'Aún no tienes gastos registrados este mes.'}
      </p>
    )
  }

  const rows = groupTopCategories(data)
  const total = data.reduce((sum, c) => sum + c.amount, 0)
  const max = Math.max(...rows.map((r) => r.amount))

  return (
    <div className="space-y-3">
      {rows.map((c) => {
        const widthPct = max > 0 ? (c.amount / max) * 100 : 0
        const sharePct = total > 0 ? Math.round((c.amount / total) * 100) : 0
        return (
          <div key={c.categoryId} className="flex items-center gap-3">
            <span className="w-20 flex-shrink-0 truncate text-xs font-medium text-slate-600">
              {c.name}
            </span>
            <div className="h-3 flex-1 rounded bg-slate-100">
              <div
                className="h-3 rounded"
                style={{ width: `${widthPct}%`, backgroundColor: c.color }}
              />
            </div>
            <span className="w-24 flex-shrink-0 text-right font-mono text-xs text-slate-700">
              {formatCurrency(c.amount)}
            </span>
            <span className="w-9 flex-shrink-0 text-right text-xs text-slate-400">
              {sharePct}%
            </span>
          </div>
        )
      })}
    </div>
  )
}