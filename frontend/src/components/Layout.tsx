import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/quadras', label: 'Quadras' },
  { to: '/lotes', label: 'Lotes' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/contratos', label: 'Contratos' },
];

const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 160;
const MAX_WIDTH = 400;
const SNAP_CLOSE_THRESHOLD = 80;

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [desktopWidth, setDesktopWidth] = useState(DEFAULT_WIDTH);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    const next = dragStartWidth.current + (e.clientX - dragStartX.current);
    setDesktopWidth(Math.max(0, Math.min(MAX_WIDTH, next)));
  }, []);

  const onMouseUp = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    const next = dragStartWidth.current + (e.clientX - dragStartX.current);
    const clamped = Math.max(0, Math.min(MAX_WIDTH, next));
    if (clamped < SNAP_CLOSE_THRESHOLD) {
      setDesktopWidth(0);
    } else if (clamped < MIN_WIDTH) {
      setDesktopWidth(MIN_WIDTH);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  function startDrag(e: React.MouseEvent) {
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = desktopWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }

  const collapsed = desktopWidth === 0;

  const navContent = (
    <>
      <div className="px-5 py-4 border-b border-slate-800">
        <Link to="/" className="block text-lg font-bold tracking-tight leading-tight">
          JK Empreendimentos
        </Link>
        <p className="text-xs text-slate-400 mt-0.5">Loteamento Recantos do Lago</p>
      </div>
      <nav className="flex flex-col py-2 flex-1 overflow-y-auto">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `px-5 py-2.5 text-sm transition ${
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
    </>
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-900 text-slate-100 md:hidden
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <Link to="/" className="block text-lg font-bold tracking-tight leading-tight">
              JK Empreendimentos
            </Link>
            <p className="text-xs text-slate-400 mt-0.5">Loteamento Recantos do Lago</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-3 mt-0.5 text-slate-400 hover:text-white"
            aria-label="Fechar menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col py-2 flex-1 overflow-y-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-5 py-2.5 text-sm transition ${
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

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col shrink-0 bg-slate-900 text-slate-100 relative overflow-hidden"
        style={{ width: desktopWidth }}
      >
        {/* Sidebar content — rendered at full width inside a clipped container */}
        <div
          className="flex flex-col h-full overflow-hidden"
          style={{ width: DEFAULT_WIDTH, opacity: desktopWidth < 60 ? 0 : 1, transition: 'opacity 0.1s' }}
        >
          {navContent}
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={startDrag}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize group"
        >
          <div className="w-full h-full group-hover:bg-primary-500/40 transition-colors" />
        </div>
      </aside>

      {/* Collapsed expand button (desktop only) */}
      {collapsed && (
        <button
          onClick={() => setDesktopWidth(DEFAULT_WIDTH)}
          className="hidden md:flex items-center justify-center w-5 shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-r border-slate-700 transition-colors"
          aria-label="Expandir barra lateral"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-slate-500 hover:text-slate-800 p-1 -ml-1"
            aria-label="Abrir menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="hidden md:block" />

          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-700 hidden sm:inline">{user?.nome}</span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50"
            >
              Sair
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
