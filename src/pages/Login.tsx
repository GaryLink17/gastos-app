import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { loginSchema, type LoginFormValues } from '@/lib/authSchemas'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function LoginPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginFormValues) {
    setServerError(null)
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      setServerError(
        error.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos'
          : error.message,
      )
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-teal-700">Iniciar sesión</h1>
        <p className="mb-6 text-sm text-slate-500">Entra para ver tus finanzas.</p>

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
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {serverError && <p className="text-sm text-rust-600">{serverError}</p>}

          <Button type="submit" isLoading={isSubmitting}>
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-medium text-teal-700 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}