import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, ListOrdered, Wallet, Tags, BarChart3, LogOut } from 'lucide-react'
import clsx from 'clsx'
import { supabase } from '@/lib/supabase'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transacciones', label: 'Transacciones', icon: ListOrdered },
  { to: '/cuentas', label: 'Cuentas', icon: Wallet },
  { to: '/categorias', label: 'Categorías', icon: Tags },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
]

function NavLinks({ variant = 'sidebar' }: { variant?: 'sidebar' | 'bottom' }) {
  return (
    <>
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            clsx(
              variant === 'sidebar'
                ? 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
                : 'flex flex-col items-center gap-1 px-2 py-1 text-[10.5px] font-medium transition-colors',
              isActive
                ? variant === 'sidebar'
                  ? 'bg-slate-800 text-white'
                  : 'text-teal-600'
                : 'text-slate-500 hover:text-teal-600',
            )
          }
        >
          <Icon size={variant === 'sidebar' ? 18 : 20} />
          {label}
        </NavLink>
      ))}
    </>
  )
}

export function AppLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2 text-base font-semibold">
          <span className="h-[22px] w-[22px] flex-shrink-0 rounded-md bg-teal-600" />
          Mis Finanzas
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          <NavLinks />
        </nav>
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-rust-50 hover:text-rust-700"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </aside>

      {/* Contenido */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
          <Outlet />
        </main>

        {/* Bottom nav (móvil) */}
        <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t border-slate-200 bg-white py-2 md:hidden">
          <NavLinks variant="bottom" />
        </nav>
      </div>
    </div>
  )
}