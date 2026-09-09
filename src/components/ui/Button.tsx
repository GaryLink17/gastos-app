import { type ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
}

export function Button({ className, isLoading, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'flex w-full items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60',        className,
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? 'Cargando...' : children}
    </button>
  )
}