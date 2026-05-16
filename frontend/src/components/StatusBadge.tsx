import { ContratoStatus, LoteStatus, ParcelaStatus } from '../types';

type AnyStatus = LoteStatus | ContratoStatus | ParcelaStatus;

const styles: Record<AnyStatus, string> = {
  DISPONIVEL: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  RESERVADO: 'bg-amber-100 text-amber-700 border-amber-200',
  VENDIDO: 'bg-red-100 text-red-700 border-red-200',
  ATIVO: 'bg-blue-100 text-blue-700 border-blue-200',
  QUITADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELADO: 'bg-slate-100 text-slate-600 border-slate-200',
  PENDENTE: 'bg-amber-100 text-amber-700 border-amber-200',
  PAGO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ATRASADO: 'bg-red-100 text-red-700 border-red-200',
};

const labels: Record<AnyStatus, string> = {
  DISPONIVEL: 'Disponível',
  RESERVADO: 'Reservado',
  VENDIDO: 'Vendido',
  ATIVO: 'Ativo',
  QUITADO: 'Quitado',
  CANCELADO: 'Cancelado',
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  ATRASADO: 'Atrasado',
};

interface Props {
  status: AnyStatus;
}

export function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
