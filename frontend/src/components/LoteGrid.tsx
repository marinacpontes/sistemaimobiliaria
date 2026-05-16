import { Lote, LoteStatus } from '../types';

interface Props {
  lotes: Lote[];
  onSelect?: (lote: Lote) => void;
}

const colorByStatus: Record<LoteStatus, string> = {
  DISPONIVEL: 'bg-emerald-500 hover:bg-emerald-600 border-emerald-700',
  RESERVADO: 'bg-amber-400 hover:bg-amber-500 border-amber-600',
  VENDIDO: 'bg-red-500 hover:bg-red-600 border-red-700',
};

export function LoteGrid({ lotes, onSelect }: Props) {
  if (lotes.length === 0) {
    return <p className="text-sm text-slate-500">Nenhum lote cadastrado nesta quadra.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3 text-xs">
        <Legend color="bg-emerald-500" label="Disponível" />
        <Legend color="bg-amber-400" label="Reservado" />
        <Legend color="bg-red-500" label="Vendido" />
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {lotes.map((lote) => (
          <button
            key={lote.id}
            type="button"
            onClick={() => onSelect?.(lote)}
            className={`aspect-square rounded-md border-2 text-white shadow-sm transition ${colorByStatus[lote.status]}`}
            title={`Lote ${lote.numero} — ${lote.status}`}
          >
            <span className="text-sm font-semibold">{lote.numero}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm ${color}`} />
      <span className="text-slate-600">{label}</span>
    </span>
  );
}
