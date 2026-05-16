import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { Select } from '../../components/Select';
import { api, extractApiError } from '../../lib/api';
import { formatMoney } from '../../lib/format';
import { Cliente, Lote } from '../../types';

export function ContratoForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedLoteId = searchParams.get('loteId') ?? '';

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [loteId, setLoteId] = useState(preselectedLoteId);
  const [valorTotal, setValorTotal] = useState('');
  const [entrada, setEntrada] = useState('');
  const [numParcelas, setNumParcelas] = useState('12');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Cliente[]>('/clientes').then((res) => setClientes(res.data));
    api.get<Lote[]>('/lotes').then((res) => {
      setLotes(res.data.filter((l) => l.status !== 'VENDIDO'));
    });
  }, []);

  useEffect(() => {
    const lote = lotes.find((l) => l.id === loteId);
    if (lote && !valorTotal) {
      setValorTotal(String(lote.valor));
    }
  }, [loteId, lotes]);

  const clienteOptions = useMemo(
    () => clientes.map((c) => ({ value: c.id, label: `${c.nome} — ${c.cpf}` })),
    [clientes],
  );

  const loteOptions = useMemo(
    () =>
      lotes.map((l) => ({
        value: l.id,
        label: `Q${l.quadra?.nome ?? ''} • Lote ${l.numero} — ${formatMoney(l.valor)} (${l.status})`,
      })),
    [lotes],
  );

  const preview = useMemo(() => {
    const vt = Number(valorTotal);
    const en = Number(entrada);
    const n = Number(numParcelas);
    if (!vt || !n || n < 1 || vt < 0 || en < 0 || en > vt) return null;
    const saldo = vt - en;
    const valorParcela = saldo / n;
    return { saldo, valorParcela };
  }, [valorTotal, entrada, numParcelas]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/contratos', {
        clienteId,
        loteId,
        valorTotal: Number(valorTotal),
        entrada: Number(entrada),
        numParcelas: Number(numParcelas),
      });
      navigate(`/contratos/${data.id}`);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Nova venda" subtitle="Criar contrato com geração automática de parcelas" back />

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-md border border-slate-200 bg-white p-5"
      >
        <Select
          label="Cliente"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          options={clienteOptions}
          placeholder="Selecione um cliente"
          required
        />
        <Select
          label="Lote"
          value={loteId}
          onChange={(e) => setLoteId(e.target.value)}
          options={loteOptions}
          placeholder="Selecione um lote disponível ou reservado"
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Valor total (R$)"
            type="number"
            step="0.01"
            min="0"
            value={valorTotal}
            onChange={(e) => setValorTotal(e.target.value)}
            required
          />
          <Input
            label="Entrada (R$)"
            type="number"
            step="0.01"
            min="0"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            required
          />
          <Input
            label="Nº de parcelas"
            type="number"
            min="1"
            max="360"
            value={numParcelas}
            onChange={(e) => setNumParcelas(e.target.value)}
            required
          />
        </div>

        {preview && (
          <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
            <p>
              Saldo financiado: <strong>{formatMoney(preview.saldo)}</strong>
            </p>
            <p>
              {numParcelas} parcelas de aproximadamente{' '}
              <strong>{formatMoney(preview.valorParcela)}</strong>
            </p>
          </div>
        )}

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
            {loading ? 'Salvando...' : 'Confirmar venda'}
          </Button>
        </div>
      </form>
    </div>
  );
}
