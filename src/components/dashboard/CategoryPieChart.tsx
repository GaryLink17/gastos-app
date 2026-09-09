import { useMemo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, type TooltipItem, type ChartData } from 'chart.js'
import { Pie } from 'react-chartjs-2'
import { groupTopCategories, type CategoryShare } from '@/lib/dashboardStats'

ChartJS.register(ArcElement, Tooltip)

function formatCurrency(value: number) {
  return value.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })
}

interface CategoryPieChartProps {
  data: CategoryShare[]
  emptyMessage?: string
}

export function CategoryPieChart({ data, emptyMessage }: CategoryPieChartProps) {
  const rows = useMemo(() => groupTopCategories(data), [data])
  const total = useMemo(() => data.reduce((sum, c) => sum + c.amount, 0), [data])

  const chartData: ChartData<'pie'> = useMemo(
    () => ({
      labels: rows.map((c) => c.name),
      datasets: [
        {
          data: rows.map((c) => c.amount),
          backgroundColor: rows.map((c) => c.color),
          borderColor: '#FFFFFF',
          borderWidth: 2,
        },
      ],
    }),
    [rows],
  )

  if (data.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center text-center text-sm text-slate-500">
        {emptyMessage ?? 'Aún no tienes gastos registrados este mes.'}
      </p>
    )
  }

  return (
    <div className="flex h-64 items-center gap-4">
      <div className="h-full w-1/2 flex-shrink-0">
        <Pie
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              // El detalle por categoría va en la lista de la derecha (con
              // color, nombre y %), así que aquí basta el tooltip al pasar
              // el mouse — no duplicamos una leyenda de Chart.js.
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1C201E',
                padding: 10,
                cornerRadius: 8,
                titleFont: { family: 'Inter', size: 12 },
                bodyFont: { family: 'Space Mono', size: 12 },
                callbacks: {
                  label: (ctx: TooltipItem<'pie'>) => {
                    const value = typeof ctx.parsed === 'number' ? ctx.parsed : 0
                    const pct = total > 0 ? Math.round((value / total) * 100) : 0
                    return `${ctx.label}: ${formatCurrency(value)} (${pct}%)`
                  },
                },
              },
            },
          }}
        />
      </div>

      <ul className="min-w-0 flex-1 space-y-2 overflow-y-auto">
        {rows.map((c) => {
          const pct = total > 0 ? Math.round((c.amount / total) * 100) : 0
          return (
            <li key={c.categoryId} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <span className="min-w-0 flex-1 truncate text-slate-600">{c.name}</span>
              <span className="flex-shrink-0 font-mono text-slate-700">{pct}%</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}