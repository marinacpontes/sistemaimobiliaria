import { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/quadras', label: 'Quadras' },
  { to: '/lotes', label: 'Lotes' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/contratos', label: 'Contratos' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-full">
      <aside className="w-60 shrink-0 bg-slate-900 text-slate-100">
        <div className="px-5 py-4 border-b border-slate-800">
          <Link to="/" className="block text-lg font-bold tracking-tight">
            JK Empreendimentos
          </Link>
          <p className="text-xs text-slate-400">Loteamento Recantos do Lago</p>
        </div>
        <nav className="flex flex-col py-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-5 py-2 text-sm transition ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-700">{user?.nome}</span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50"
            >
              Sair
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
