import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { registerSchema, type RegisterFormValues } from '@/lib/authSchemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function RegisterPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [confirmEmailSent, setConfirmEmailSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null)
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    })
    if (error) {
      setServerError(error.message)
      return
    }
    if (data.session) {
      // La confirmación por correo está desactivada: ya quedó logueado.
      navigate('/', { replace: true })
      return
    }
    // La confirmación por correo está activada: aún no hay sesión.
    setConfirmEmailSent(true)
  }

  if (confirmEmailSent) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="mb-2 text-xl font-bold text-teal-700">Revisa tu correo</h1>
          <p className="text-sm text-slate-500">
            Te enviamos un enlace de confirmación. Confírmalo y luego inicia sesión.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block text-sm font-medium text-teal-700 hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-teal-700">Crear cuenta</h1>
        <p className="mb-6 text-sm text-slate-500">
          Empieza a llevar el control de tus finanzas.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Correo"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {serverError && <p className="text-sm text-rust-600">{serverError}</p>}

          <Button type="submit" isLoading={isSubmitting}>
            Crear cuenta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-teal-700 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}