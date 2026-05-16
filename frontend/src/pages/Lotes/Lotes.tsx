import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { Table } from '../../components/Table';
import { api, extractApiError } from '../../lib/api';
import { formatMoney } from '../../lib/format';
import { Lote, LoteStatus } from '../../types';

type Filter = LoteStatus | 'ALL';

const filters: Array<{ value: Filter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'DISPONIVEL', label: 'Disponíveis' },
  { value: 'RESERVADO', label: 'Reservados' },
  { value: 'VENDIDO', label: 'Vendidos' },
];

export function Lotes() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [items, setItems] = useState<Lote[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = filter === 'ALL' ? {} : { status: filter };
    api
      .get<Lote[]>('/lotes', { params })
      .then((res) => setItems(res.data))
      .catch((e) => setError(extractApiError(e)))
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = search.trim()
    ? items.filter((l) => l.numero.toLowerCase().includes(search.trim().toLowerCase()))
    : items;

  return (
    <div>
      <PageHeader
        title="Lotes"
        subtitle="Todos os lotes cadastrados"
        actions={
          <Link to="/lotes/novo">
            <Button>Novo lote</Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-md border border-slate-200 bg-white p-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded px-3 py-1 text-xs font-medium transition ${
                filter === f.value
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Buscar por número..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
        />
      </div>

      {loading && <p className="text-slate-500">Carregando...</p>}
      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {!loading && (
        <Table
          data={filtered}
          keyExtractor={(l) => l.id}
          onRowClick={(l) => navigate(`/quadras/${l.quadraId}`)}
          columns={[
            { header: 'Quadra', cell: (l) => l.quadra?.nome ?? '-' },
            { header: 'Lote', cell: (l) => l.numero },
            { header: 'Metragem', cell: (l) => `${l.metragem} m²` },
            { header: 'Valor', cell: (l) => formatMoney(l.valor) },
            { header: 'Status', cell: (l) => <StatusBadge status={l.status} /> },
            {
              header: '',
              cell: (l: Lote) => (
                <div onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/lotes/${l.id}/editar`)}
                  >
                    Editar
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
