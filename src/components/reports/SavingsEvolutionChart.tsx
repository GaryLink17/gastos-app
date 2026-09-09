import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Filler,
  type TooltipItem,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { format, parseISO } from 'date-fns'
import type { SavingsPoint } from '@/lib/reportsStats'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Filler)

const SAVING_COLOR = '#3B4C9E'

function formatCurrency(value: number) {
  return value.toLocaleString('es-DO', {
    style: 'currency',
    currency: 'DOP',
    maximumFractionDigits: 0,
  })
}

interface SavingsEvolutionChartProps {
  data: SavingsPoint[]
}

export function SavingsEvolutionChart({ data }: SavingsEvolutionChartProps) {
  const chartData = useMemo(
    () => ({
      labels: data.map((p) => format(parseISO(p.date), 'dd/MM')),
      datasets: [
        {
          label: 'Ahorro acumulado',
          data: data.map((p) => p.cumulative),
          borderColor: SAVING_COLOR,
          // Relleno del área a ~10% de opacidad (una veladura, no un bloque saturado).
          backgroundColor: `${SAVING_COLOR}1A`,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          borderWidth: 2,
          tension: 0.25,
          fill: true,
        },
      ],
    }),
    [data],
  )

  if (data.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center text-center text-sm text-slate-500">
        Aún no tienes transacciones de ahorro en este período.
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
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1C201E',
              padding: 10,
              cornerRadius: 8,
              titleFont: { family: 'Inter', size: 12 },
              bodyFont: { family: 'Space Mono', size: 12 },
              callbacks: {
                label: (ctx: TooltipItem<'line'>) => formatCurrency(ctx.parsed.y ?? 0),
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: '#6B6F68',
                font: { size: 11, family: 'Inter' },
                maxTicksLimit: 8,
              },
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