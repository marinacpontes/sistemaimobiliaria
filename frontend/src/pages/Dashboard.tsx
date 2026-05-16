import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { api, extractApiError } from '../lib/api';
import { formatMoney } from '../lib/format';
import { DashboardStats } from '../types';

interface CardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'green' | 'amber' | 'red' | 'blue';
}

function Card({ label, value, hint, tone = 'default' }: CardProps) {
  const tones: Record<NonNullable<CardProps['tone']>, string> = {
    default: 'border-slate-200',
    green: 'border-emerald-200 bg-emerald-50',
    amber: 'border-amber-200 bg-amber-50',
    red: 'border-red-200 bg-red-50',
    blue: 'border-blue-200 bg-blue-50',
  };
  return (
    <div className={`rounded-lg border bg-white p-5 ${tones[tone]}`}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<DashboardStats>('/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setError(extractApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Visão geral do sistema" />

      {loading && <p className="text-slate-500">Carregando...</p>}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {stats && (
        <>
          <h2 className="mb-2 text-sm font-semibold text-slate-600">Lotes</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card label="Total de lotes" value={stats.totalLotes} />
            <Card label="Disponíveis" value={stats.lotesDisponiveis} tone="green" />
            <Card label="Reservados" value={stats.lotesReservados} tone="amber" />
            <Card label="Vendidos" value={stats.lotesVendidos} tone="red" />
          </div>

          <h2 className="mb-2 mt-6 text-sm font-semibold text-slate-600">Financeiro</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card
              label="Receita prevista"
              value={formatMoney(stats.receitaPrevista)}
              hint="Soma do valor total de todos os contratos ativos e quitados"
              tone="blue"
            />
            <Card
              label="Receita recebida"
              value={formatMoney(stats.receitaRecebida)}
              hint="Entradas + parcelas pagas"
              tone="green"
            />
          </div>

          <h2 className="mb-2 mt-6 text-sm font-semibold text-slate-600">Cadastros</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Card label="Quadras" value={stats.totalQuadras} />
            <Card label="Clientes" value={stats.totalClientes} />
            <Card label="Contratos" value={stats.totalContratos} />
          </div>
        </>
      )}
    </div>
  );
}
