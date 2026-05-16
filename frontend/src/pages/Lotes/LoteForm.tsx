import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { Select } from '../../components/Select';
import { api, extractApiError } from '../../lib/api';
import { Lote, LoteStatus, Quadra } from '../../types';

const statusOptions: Array<{ value: LoteStatus; label: string }> = [
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'RESERVADO', label: 'Reservado' },
  { value: 'VENDIDO', label: 'Vendido' },
];

export function LoteForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [searchParams] = useSearchParams();
  const preselectedQuadra = searchParams.get('quadraId');
  const navigate = useNavigate();

  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [quadraId, setQuadraId] = useState(preselectedQuadra ?? '');
  const [numero, setNumero] = useState('');
  const [metragem, setMetragem] = useState('');
  const [valor, setValor] = useState('');
  const [status, setStatus] = useState<LoteStatus>('DISPONIVEL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Quadra[]>('/quadras').then((res) => setQuadras(res.data));
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    api
      .get<Lote>(`/lotes/${id}`)
      .then((res) => {
        setQuadraId(res.data.quadraId);
        setNumero(res.data.numero);
        setMetragem(String(res.data.metragem));
        setValor(String(res.data.valor));
        setStatus(res.data.status);
      })
      .catch((e) => setError(extractApiError(e)));
  }, [isEdit, id]);

  const quadraOptions = useMemo(
    () => quadras.map((q) => ({ value: q.id, label: `Quadra ${q.nome}` })),
    [quadras],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit && id) {
        await api.put(`/lotes/${id}`, {
          numero,
          metragem: Number(metragem),
          valor: Number(valor),
          status,
        });
      } else {
        await api.post('/lotes', {
          quadraId,
          numero,
          metragem: Number(metragem),
          valor: Number(valor),
        });
      }
      navigate(`/quadras/${quadraId}`);
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm('Excluir este lote?')) return;
    try {
      await api.delete(`/lotes/${id}`);
      navigate(`/quadras/${quadraId}`);
    } catch (err) {
      setError(extractApiError(err));
    }
  }

  return (
    <div className="max-w-xl">
      <PageHeader title={isEdit ? 'Editar lote' : 'Novo lote'} back />
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-md border border-slate-200 bg-white p-5"
      >
        <Select
          label="Quadra"
          value={quadraId}
          onChange={(e) => setQuadraId(e.target.value)}
          options={quadraOptions}
          placeholder="Selecione uma quadra"
          required
          disabled={isEdit}
        />
        <Input
          label="Número do lote"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          required
        />
        <Input
          label="Metragem (m²)"
          type="number"
          step="0.01"
          min="0"
          value={metragem}
          onChange={(e) => setMetragem(e.target.value)}
          required
        />
        <Input
          label="Valor (R$)"
          type="number"
          step="0.01"
          min="0"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
        />
        {isEdit && (
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as LoteStatus)}
            options={statusOptions}
          />
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-between">
          <div>
            {isEdit && (
              <Button type="button" variant="danger" onClick={handleDelete}>
                Excluir
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
