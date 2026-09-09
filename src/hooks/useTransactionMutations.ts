import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { CategoryType } from '@/types/database'

export interface TransactionInput {
  category_id: string
  account_id: string
  type: CategoryType
  amount: number
  description?: string
  date: string
}

function invalidateAffectedQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['transactions'] })
  queryClient.invalidateQueries({ queryKey: ['accounts'] })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: TransactionInput) => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const userId = userData.user?.id
      if (!userId) throw new Error('No hay sesión activa')

      const { error } = await supabase.from('transactions').insert({
        ...input,
        user_id: userId,
      })
      if (error) throw error
    },
    onSuccess: () => invalidateAffectedQueries(queryClient),
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: TransactionInput }) => {
      const { error } = await supabase.from('transactions').update(input).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateAffectedQueries(queryClient),
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateAffectedQueries(queryClient),
  })
}