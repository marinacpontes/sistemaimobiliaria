import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { Table } from '../../components/Table';
import { api, extractApiError } from '../../lib/api';
import { formatDate, formatMoney } from '../../lib/format';
import { Contrato } from '../../types';

export function ContratoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await api.get<Contrato>(`/contratos/${id}`);
      setContrato(data);
    } catch (e) {
      setError(extractApiError(e));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function pagar(parcelaId: string) {
    setBusyId(parcelaId);
    setActionError(null);
    try {
      await api.post(`/parcelas/${parcelaId}/pagar`);
      await load();
    } catch (e) {
      setActionError(extractApiError(e));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (
      !confirm(
        'Excluir este contrato? Todas as parcelas serão removidas e o lote voltará a ficar disponível.',
      )
    )
      return;
    setDeleting(true);
    setActionError(null);
    try {
      await api.delete(`/contratos/${id}`);
      navigate('/contratos');
    } catch (e) {
      setActionError(extractApiError(e));
      setDeleting(false);
    }
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </div>
    );
  }
  if (!contrato) return <p className="text-slate-500">Carregando...</p>;

  return (
    <div>
      <PageHeader
        back
        title="Contrato"
        subtitle={`Venda registrada em ${formatDate(contrato.dataVenda)}`}
        actions={
          <>
            <Link to={`/contratos/${contrato.id}/editar`}>
              <Button variant="secondary">Editar</Button>
            </Link>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Info
          label="Cliente"
          value={
            contrato.cliente ? (
              <Link
                to={`/clientes/${contrato.cliente.id}`}
                className="text-primary-600 hover:underline"
              >
                {contrato.cliente.nome}
              </Link>
            ) : (
              '-'
            )
          }
        />
        <Info
          label="Lote"
          value={
            contrato.lote
              ? `Quadra ${contrato.lote.quadra?.nome ?? ''} • Lote ${contrato.lote.numero}`
              : '-'
          }
        />
        <Info label="Valor total" value={formatMoney(contrato.valorTotal)} />
        <Info label="Entrada" value={formatMoney(contrato.entrada)} />
        <Info label="Parcelas" value={String(contrato.numParcelas)} />
        <Info label="Status" value={<StatusBadge status={contrato.status} />} />
      </div>

      <h2 className="mb-2 text-sm font-semibold text-slate-700">Parcelas</h2>

      {actionError && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <Table
        data={contrato.parcelas ?? []}
        keyExtractor={(p) => p.id}
        columns={[
          { header: '#', cell: (p) => p.numero },
          { header: 'Vencimento', cell: (p) => formatDate(p.vencimento) },
          { header: 'Valor', cell: (p) => formatMoney(p.valor) },
          { header: 'Multa', cell: (p) => (p.multa ? formatMoney(p.multa) : '-') },
          { header: 'Pago em', cell: (p) => formatDate(p.pagoEm) },
          { header: 'Valor pago', cell: (p) => (p.valorPago ? formatMoney(p.valorPago) : '-') },
          { header: 'Status', cell: (p) => <StatusBadge status={p.status} /> },
          {
            header: '',
            cell: (p) =>
              p.status !== 'PAGO' ? (
                <Button size="sm" onClick={() => pagar(p.id)} disabled={busyId === p.id}>
                  {busyId === p.id ? '...' : 'Marcar pago'}
                </Button>
              ) : null,
          },
        ]}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-800">{value ?? '-'}</div>
    </div>
  );
}
