import type { TransactionWithCategory } from '@/hooks/useTransactions'

export interface MonthlyFlow {
  month: string
  income: number
  expense: number
}

const monthFormatter = new Intl.DateTimeFormat('es-DO', { month: 'short' })

/**
 * Agrupa ingresos y gastos por mes para los últimos `monthsBack` meses
 * (incluyendo el actual), en orden cronológico.
 */
export function getMonthlyFlow(
  transactions: TransactionWithCategory[],
  monthsBack = 6,
): MonthlyFlow[] {
  const now = new Date()
  const startOfWindow = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1)

  const buckets: MonthlyFlow[] = []
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(startOfWindow.getFullYear(), startOfWindow.getMonth() + i, 1)
    const label = monthFormatter.format(d)
    buckets.push({
      month: `${label.charAt(0).toUpperCase()}${label.slice(1)}`,
      income: 0,
      expense: 0,
    })
  }

  for (const t of transactions) {
    const d = new Date(`${t.date}T00:00:00`)
    const monthIndex =
      (d.getFullYear() - startOfWindow.getFullYear()) * 12 + (d.getMonth() - startOfWindow.getMonth())
    if (monthIndex < 0 || monthIndex >= monthsBack) continue

    if (t.type === 'income') buckets[monthIndex].income += t.amount
    else if (t.type === 'expense') buckets[monthIndex].expense += t.amount
  }

  return buckets
}

export interface CategoryShare {
  categoryId: string
  name: string
  color: string
  amount: number
}

/** Total de gastos del mes en curso, agrupado por categoría y ordenado de mayor a menor. */
export function getExpenseByCategory(transactions: TransactionWithCategory[]): CategoryShare[] {
  const now = new Date()
  const map = new Map<string, CategoryShare>()

  for (const t of transactions) {
    if (t.type !== 'expense') continue
    const d = new Date(`${t.date}T00:00:00`)
    if (d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) continue

    const existing = map.get(t.category_id)
    if (existing) {
      existing.amount += t.amount
    } else {
      map.set(t.category_id, {
        categoryId: t.category_id,
        name: t.categories?.name ?? 'Sin categoría',
        color: t.categories?.color ?? '#6B6F68',
        amount: t.amount,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.amount - a.amount)
}

const MAX_VISIBLE_CATEGORIES = 6
const OTHER_CATEGORY_COLOR = '#9B9E96'

/**
 * Agrupa las categorías fuera de las `maxVisible` con mayor monto en una
 * sola entrada "Otros", para no saturar gráficas o listas con muchas
 * categorías pequeñas.
 */
export function groupTopCategories(
  data: CategoryShare[],
  maxVisible = MAX_VISIBLE_CATEGORIES,
): CategoryShare[] {
  const visible = data.slice(0, maxVisible)
  const rest = data.slice(maxVisible)
  const restTotal = rest.reduce((sum, c) => sum + c.amount, 0)
  if (restTotal <= 0) return visible
  return [
    ...visible,
    { categoryId: 'other', name: 'Otros', color: OTHER_CATEGORY_COLOR, amount: restTotal },
  ]
}