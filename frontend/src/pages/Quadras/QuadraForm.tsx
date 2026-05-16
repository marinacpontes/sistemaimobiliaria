import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { api, extractApiError } from '../../lib/api';
import { Quadra } from '../../types';

export function QuadraForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    api
      .get<Quadra>(`/quadras/${id}`)
      .then((res) => setNome(res.data.nome))
      .catch((e) => setError(extractApiError(e)));
  }, [isEdit, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit && id) {
        await api.put(`/quadras/${id}`, { nome });
      } else {
        await api.post('/quadras', { nome });
      }
      navigate('/quadras');
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm('Excluir esta quadra? Todos os lotes serão removidos junto.')) return;
    try {
      await api.delete(`/quadras/${id}`);
      navigate('/quadras');
    } catch (err) {
      setError(extractApiError(err));
    }
  }

  return (
    <div className="max-w-md">
      <PageHeader title={isEdit ? 'Editar quadra' : 'Nova quadra'} back />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-slate-200 bg-white p-5">
        <Input
          label="Nome da quadra"
          placeholder="Ex: A, B, 01"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

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
