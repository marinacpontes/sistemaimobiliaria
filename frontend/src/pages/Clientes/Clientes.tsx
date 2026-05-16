import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { Table } from '../../components/Table';
import { api, extractApiError } from '../../lib/api';
import { formatCPF } from '../../lib/format';
import { Cliente } from '../../types';

export function Clientes() {
  const [items, setItems] = useState<Cliente[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const params = search.trim() ? { search: search.trim() } : {};
      api
        .get<Cliente[]>('/clientes', { params })
        .then((res) => setItems(res.data))
        .catch((e) => setError(extractApiError(e)))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Clientes"
        actions={
          <Link to="/clientes/novo">
            <Button>Novo cliente</Button>
          </Link>
        }
      />

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {loading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <Table
          data={items}
          keyExtractor={(c) => c.id}
          columns={[
            {
              header: 'Nome',
              cell: (c) => (
                <Link to={`/clientes/${c.id}`} className="text-primary-600 hover:underline">
                  {c.nome}
                </Link>
              ),
            },
            { header: 'CPF', cell: (c) => formatCPF(c.cpf) },
            { header: 'Telefone', cell: (c) => c.telefone },
            {
              header: 'Cidade/UF',
              cell: (c) => (c.cidade && c.estado ? `${c.cidade}/${c.estado}` : '-'),
            },
            { header: 'Contratos', cell: (c) => c._count?.contratos ?? 0 },
          ]}
        />
      )}
    </div>
  );
}
