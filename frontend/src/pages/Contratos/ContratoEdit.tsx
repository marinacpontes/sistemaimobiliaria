import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { Select } from '../../components/Select';
import { api, extractApiError } from '../../lib/api';
import { formatMoney } from '../../lib/format';
import { Cliente, Contrato, ContratoStatus } from '../../types';

const statusOptions: Array<{ value: ContratoStatus; label: string }> = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'QUITADO', label: 'Quitado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

function toDateInput(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

export function ContratoEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [contrato, setContrato] = useState<Contrato | null>(null);

  const [clienteId, setClienteId] = useState('');
  const [dataVenda, setDataVenda] = useState('');
  const [status, setStatus] = useState<ContratoStatus>('ATIVO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.get<Contrato>(`/contratos/${id}`), api.get<Cliente[]>('/clientes')])
      .then(([cr, cs]) => {
        setContrato(cr.data);
        setClientes(cs.data);
        setClienteId(cr.data.clienteId);
        setDataVenda(toDateInput(cr.data.dataVenda));
        setStatus(cr.data.status);
      })
      .catch((e) => setError(extractApiError(e)));
  }, [id]);

  const clienteOptions = useMemo(
    () => clientes.map((c) => ({ value: c.id, label: `${c.nome} — ${c.cpf}` })),
    [clientes],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      await api.put(`/contratos/${id}`, {
        clienteId,
        dataVenda: new Date(dataVenda + 'T12:00:00').toISOString(),
        status,
      });
      navigate(`/contratos/${id}`);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }

  if (error && !contrato) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </div>
    );
  }
  if (!contrato) return <p className="text-slate-500">Carregando...</p>;

  return (
    <div className="max-w-xl">
      <PageHeader title="Editar contrato" back />
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-md border border-slate-200 bg-white p-5"
      >
        <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <p>
            <strong>Lote:</strong> Quadra {contrato.lote?.quadra?.nome ?? ''} • Lote{' '}
            {contrato.lote?.numero ?? ''}
          </p>
          <p>
            <strong>Valor:</strong> {formatMoney(contrato.valorTotal)} • Entrada{' '}
            {formatMoney(contrato.entrada)} • {contrato.numParcelas} parcelas
          </p>
          <p className="mt-1 text-slate-500">
            Valores financeiros e lote não são editáveis para preservar a integridade das parcelas.
            Para alterá-los, exclua e crie um novo contrato.
          </p>
        </div>

        <Select
          label="Cliente"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          options={clienteOptions}
          placeholder="Selecione..."
          required
        />

        <Input
          label="Data da venda"
          type="date"
          value={dataVenda}
          onChange={(e) => setDataVenda(e.target.value)}
          required
        />

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ContratoStatus)}
          options={statusOptions}
        />

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
