import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Transaction } from '@/types/database'

export interface TransactionWithCategory extends Transaction {
  categories: { name: string; color: string } | null
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<TransactionWithCategory[]> => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(name, color)')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as TransactionWithCategory[]
    },
  })
}