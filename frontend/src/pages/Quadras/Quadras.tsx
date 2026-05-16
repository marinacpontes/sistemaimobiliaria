import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { Table } from '../../components/Table';
import { api, extractApiError } from '../../lib/api';
import { Quadra } from '../../types';

export function Quadras() {
  const [items, setItems] = useState<Quadra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Quadra[]>('/quadras')
      .then((res) => setItems(res.data))
      .catch((e) => setError(extractApiError(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Quadras"
        subtitle="Todas as quadras do loteamento"
        actions={
          <Link to="/quadras/novo">
            <Button>Nova quadra</Button>
          </Link>
        }
      />

      {loading && <p className="text-slate-500">Carregando...</p>}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {!loading && !error && (
        <Table
          data={items}
          keyExtractor={(q) => q.id}
          emptyMessage="Nenhuma quadra cadastrada."
          columns={[
            {
              header: 'Nome',
              cell: (q) => (
                <Link to={`/quadras/${q.id}`} className="text-primary-600 hover:underline">
                  Quadra {q.nome}
                </Link>
              ),
            },
            { header: 'Lotes', cell: (q) => q._count?.lotes ?? 0 },
          ]}
        />
      )}
    </div>
  );
}
