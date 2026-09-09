import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoginPage } from '@/pages/Login'
import { RegisterPage } from '@/pages/Register'
import { DashboardPage } from '@/pages/Dashboard'
import { TransactionsPage } from '@/pages/Transactions'
import { CategoriesPage } from '@/pages/Categories'
import { AccountsPage } from '@/pages/Accounts'
import { ReportsPage } from '@/pages/Reports'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transacciones" element={<TransactionsPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/cuentas" element={<AccountsPage />} />
          <Route path="/reportes" element={<ReportsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
