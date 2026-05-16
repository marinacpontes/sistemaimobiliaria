import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ClienteDetalhe } from './pages/Clientes/ClienteDetalhe';
import { ClienteForm } from './pages/Clientes/ClienteForm';
import { Clientes } from './pages/Clientes/Clientes';
import { ContratoDetalhe } from './pages/Contratos/ContratoDetalhe';
import { ContratoEdit } from './pages/Contratos/ContratoEdit';
import { ContratoForm } from './pages/Contratos/ContratoForm';
import { Contratos } from './pages/Contratos/Contratos';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { LoteForm } from './pages/Lotes/LoteForm';
import { Lotes } from './pages/Lotes/Lotes';
import { QuadraDetalhe } from './pages/Quadras/QuadraDetalhe';
import { QuadraForm } from './pages/Quadras/QuadraForm';
import { Quadras } from './pages/Quadras/Quadras';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Shell><Dashboard /></Shell>} />

      <Route path="/quadras" element={<Shell><Quadras /></Shell>} />
      <Route path="/quadras/novo" element={<Shell><QuadraForm /></Shell>} />
      <Route path="/quadras/:id" element={<Shell><QuadraDetalhe /></Shell>} />
      <Route path="/quadras/:id/editar" element={<Shell><QuadraForm /></Shell>} />

      <Route path="/lotes" element={<Shell><Lotes /></Shell>} />
      <Route path="/lotes/novo" element={<Shell><LoteForm /></Shell>} />
      <Route path="/lotes/:id/editar" element={<Shell><LoteForm /></Shell>} />

      <Route path="/clientes" element={<Shell><Clientes /></Shell>} />
      <Route path="/clientes/novo" element={<Shell><ClienteForm /></Shell>} />
      <Route path="/clientes/:id" element={<Shell><ClienteDetalhe /></Shell>} />
      <Route path="/clientes/:id/editar" element={<Shell><ClienteForm /></Shell>} />

      <Route path="/contratos" element={<Shell><Contratos /></Shell>} />
      <Route path="/contratos/novo" element={<Shell><ContratoForm /></Shell>} />
      <Route path="/contratos/:id" element={<Shell><ContratoDetalhe /></Shell>} />
      <Route path="/contratos/:id/editar" element={<Shell><ContratoEdit /></Shell>} />

      <Route path="*" element={<Shell><div className="text-slate-500">Página não encontrada.</div></Shell>} />
    </Routes>
  );
}
