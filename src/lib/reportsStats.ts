import type { TransactionWithCategory } from '@/hooks/useTransactions'
import type { CategoryShare } from '@/lib/dashboardStats'
import type { CategoryType } from '@/types/database'

/** Total del período (últimos `monthsBack` meses) por categoría, para un tipo dado. */
export function getCategoryDistribution(
  transactions: TransactionWithCategory[],
  type: CategoryType,
  monthsBack: number,
): CategoryShare[] {
  const now = new Date()
  const cutoff = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1)
  const map = new Map<string, CategoryShare>()

  for (const t of transactions) {
    if (t.type !== type) continue
    const d = new Date(`${t.date}T00:00:00`)
    if (d < cutoff) continue

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

export interface SavingsPoint {
  date: string
  cumulative: number
}

/**
 * Ahorro acumulado (suma corriente de transacciones tipo "saving") por
 * fecha, recortado a los últimos `monthsBack` meses. El acumulado incluye
 * todo lo ahorrado antes del recorte, para que la línea arranque en el
 * total real y no en cero.
 */
export function getSavingsEvolution(
  transactions: TransactionWithCategory[],
  monthsBack: number,
): SavingsPoint[] {
  const savingTx = transactions
    .filter((t) => t.type === 'saving')
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))

  if (savingTx.length === 0) return []

  let cumulative = 0
  const byDate = new Map<string, number>()
  for (const t of savingTx) {
    cumulative += t.amount
    byDate.set(t.date, cumulative)
  }

  const now = new Date()
  const cutoff = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1)

  return Array.from(byDate.entries())
    .filter(([date]) => new Date(`${date}T00:00:00`) >= cutoff)
    .map(([date, value]) => ({ date, cumulative: value }))
}