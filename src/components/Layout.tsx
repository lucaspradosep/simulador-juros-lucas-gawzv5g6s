import { Outlet } from 'react-router-dom'
import { Calculator } from 'lucide-react'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm transition-all duration-300">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-emerald-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Calculator className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-xl font-bold tracking-tight">Simulador de Juros Lucas Prado</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-white py-8">
        <div className="container mx-auto flex flex-col items-center justify-center gap-2 px-4 md:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-emerald-900">Simulador de Juros Lucas Prado</p>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Todos os direitos reservados. Feito para visualizar o poder
            dos juros compostos.
          </p>
        </div>
      </footer>
    </div>
  )
}
