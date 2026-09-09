import { forwardRef, type InputHTMLAttributes } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
        <input
          ref={ref}
          className={clsx(
            'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-teal-600/30',
            error ? 'border-rust-500' : 'border-slate-300 focus:border-teal-600',
            className,
          )}
          {...props}
        />
        {error && <span className="mt-1 block text-xs text-rust-600">{error}</span>}
      </label>
    )
  },
)
Input.displayName = 'Input'