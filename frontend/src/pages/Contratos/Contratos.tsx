import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { Table } from '../../components/Table';
import { api, extractApiError } from '../../lib/api';
import { formatDate, formatMoney } from '../../lib/format';
import { Contrato } from '../../types';

export function Contratos() {
  const [items, setItems] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Contrato[]>('/contratos')
      .then((res) => setItems(res.data))
      .catch((e) => setError(extractApiError(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Contratos"
        subtitle="Vendas registradas"
        actions={
          <Link to="/contratos/novo">
            <Button>Nova venda</Button>
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
          keyExtractor={(c) => c.id}
          columns={[
            { header: 'Data', cell: (c) => formatDate(c.dataVenda) },
            { header: 'Cliente', cell: (c) => c.cliente?.nome ?? '-' },
            {
              header: 'Lote',
              cell: (c) =>
                c.lote ? `Q${c.lote.quadra?.nome ?? ''} • Lote ${c.lote.numero}` : '-',
            },
            { header: 'Valor', cell: (c) => formatMoney(c.valorTotal) },
            { header: 'Parcelas', cell: (c) => c.numParcelas },
            { header: 'Status', cell: (c) => <StatusBadge status={c.status} /> },
            {
              header: '',
              cell: (c) => (
                <Link
                  to={`/contratos/${c.id}`}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Ver detalhes
                </Link>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
