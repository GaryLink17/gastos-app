import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { MonthlyFlow } from '@/lib/dashboardStats'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend)

const INCOME_COLOR = '#0d9488'
const EXPENSE_COLOR = '#B5502E'

function formatCurrency(value: number) {
  return value.toLocaleString('es-DO', {
    style: 'currency',
    currency: 'DOP',
    maximumFractionDigits: 0,
  })
}

interface IncomeExpenseTrendProps {
  data: MonthlyFlow[]
}

export function IncomeExpenseTrend({ data }: IncomeExpenseTrendProps) {
  const chartData = useMemo(
    () => ({
      labels: data.map((d) => d.month),
      datasets: [
        {
          label: 'Ingresos',
          data: data.map((d) => d.income),
          borderColor: INCOME_COLOR,
          backgroundColor: INCOME_COLOR,
          pointRadius: 4,
          pointHoverRadius: 5,
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          borderWidth: 2,
          tension: 0.25,
        },
        {
          label: 'Gastos',
          data: data.map((d) => d.expense),
          borderColor: EXPENSE_COLOR,
          backgroundColor: EXPENSE_COLOR,
          pointRadius: 4,
          pointHoverRadius: 5,
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          borderWidth: 2,
          tension: 0.25,
        },
      ],
    }),
    [data],
  )

  const hasAnyData = data.some((d) => d.income > 0 || d.expense > 0)

  if (!hasAnyData) {
    return (
      <p className="flex h-64 items-center justify-center text-center text-sm text-slate-500">
        Aún no hay suficientes transacciones para mostrar esta gráfica.
      </p>
    )
  }

  return (
    <div className="h-64">
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 8,
                color: '#3F433D',
                font: { size: 12, family: 'Inter' },
              },
            },
            tooltip: {
              backgroundColor: '#1C201E',
              padding: 10,
              cornerRadius: 8,
              titleFont: { family: 'Inter', size: 12 },
              bodyFont: { family: 'Space Mono', size: 12 },
              callbacks: {
                label: (ctx: TooltipItem<'line'>) =>
                  `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#6B6F68', font: { size: 11, family: 'Inter' } },
            },
            y: {
              beginAtZero: true,
              grid: { color: '#E3E1D9' },
              border: { display: false },
              ticks: {
                color: '#6B6F68',
                font: { size: 11, family: 'Inter' },
                callback: (value) => formatCurrency(Number(value)),
              },
            },
          },
        }}
      />
    </div>
  )
}