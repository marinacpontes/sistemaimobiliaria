import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { LoteGrid } from '../../components/LoteGrid';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { api, extractApiError } from '../../lib/api';
import { formatMoney } from '../../lib/format';
import { Lote, Quadra } from '../../types';

export function QuadraDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quadra, setQuadra] = useState<Quadra | null>(null);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Lote | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [q, ls] = await Promise.all([
        api.get<Quadra>(`/quadras/${id}`),
        api.get<Lote[]>(`/quadras/${id}/lotes`),
      ]);
      setQuadra(q.data);
      setLotes(ls.data);
    } catch (e) {
      setError(extractApiError(e));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReservar() {
    if (!selected) return;
    setBusy(true);
    setActionError(null);
    try {
      await api.post(`/lotes/${selected.id}/reservar`);
      setSelected(null);
      await load();
    } catch (e) {
      setActionError(extractApiError(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleCancelarReserva() {
    if (!selected) return;
    setBusy(true);
    setActionError(null);
    try {
      await api.post(`/lotes/${selected.id}/cancelar-reserva`);
      setSelected(null);
      await load();
    } catch (e) {
      setActionError(extractApiError(e));
    } finally {
      setBusy(false);
    }
  }

  function handleVender() {
    if (!selected) return;
    navigate(`/contratos/novo?loteId=${selected.id}`);
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </div>
    );
  }
  if (!quadra) return <p className="text-slate-500">Carregando...</p>;

  return (
    <div>
      <PageHeader
        back
        title={`Quadra ${quadra.nome}`}
        actions={
          <>
            <Link to={`/quadras/${quadra.id}/editar`}>
              <Button variant="secondary">Editar</Button>
            </Link>
            <Link to={`/lotes/novo?quadraId=${quadra.id}`}>
              <Button>Novo lote</Button>
            </Link>
          </>
        }
      />

      <LoteGrid lotes={lotes} onSelect={(l) => setSelected(l)} />

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Lote ${selected.numero}` : ''}
        footer={
          selected && (
            <>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Fechar
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(`/lotes/${selected.id}/editar`)}
              >
                Editar lote
              </Button>
              {selected.status === 'DISPONIVEL' && (
                <>
                  <Button variant="secondary" onClick={handleReservar} disabled={busy}>
                    Reservar
                  </Button>
                  <Button onClick={handleVender}>Vender</Button>
                </>
              )}
              {selected.status === 'RESERVADO' && (
                <>
                  <Button variant="secondary" onClick={handleCancelarReserva} disabled={busy}>
                    Cancelar reserva
                  </Button>
                  <Button onClick={handleVender}>Vender</Button>
                </>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <StatusBadge status={selected.status} />
            </div>
            <p>
              <span className="font-medium">Metragem:</span> {selected.metragem} m²
            </p>
            <p>
              <span className="font-medium">Valor:</span> {formatMoney(selected.valor)}
            </p>
            {actionError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {actionError}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
