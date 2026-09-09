import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AccountType } from '@/types/database'

export interface AccountInput {
  name: string
  type: AccountType
  balance: number
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: AccountInput) => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const userId = userData.user?.id
      if (!userId) throw new Error('No hay sesión activa')

      const { error } = await supabase.from('accounts').insert({
        ...input,
        user_id: userId,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

// El balance no se edita a mano una vez creada la cuenta: lo mantiene el
// trigger de la base de datos a partir de las transacciones. Aquí solo se
// puede cambiar el nombre y el tipo.
export function useUpdateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: Pick<AccountInput, 'name' | 'type'>
    }) => {
      const { error } = await supabase.from('accounts').update(input).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('accounts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      // Las transacciones de esta cuenta quedan con account_id = null
      // (ON DELETE SET NULL), así que también refrescamos 'transactions'.
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}