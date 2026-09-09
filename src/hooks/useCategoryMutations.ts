import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { CategoryType } from '@/types/database'

export interface CategoryInput {
  name: string
  type: CategoryType
  color: string
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CategoryInput) => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const userId = userData.user?.id
      if (!userId) throw new Error('No hay sesión activa')

      const { error } = await supabase.from('categories').insert({
        ...input,
        user_id: userId,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: CategoryInput }) => {
      const { error } = await supabase.from('categories').update(input).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

// category_id en transactions es NOT NULL con ON DELETE RESTRICT: si la
// categoría tiene transacciones asociadas, Postgres rechaza el borrado
// (código 23503). El componente que llama esto debe mostrar un mensaje
// amigable en ese caso en vez de dejar que se pierda el error.
export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}