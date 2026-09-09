import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Account } from '@/types/database'

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async (): Promise<Account[]> => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true })
      if (error) throw error
      return data
    },
  })
}