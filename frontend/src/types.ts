export interface User {
  id: string;
  nome: string;
  email: string;
}

export type LoteStatus = 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO';
export type ContratoStatus = 'ATIVO' | 'QUITADO' | 'CANCELADO';
export type ParcelaStatus = 'PENDENTE' | 'PAGO' | 'ATRASADO';

export interface Quadra {
  id: string;
  nome: string;
  createdAt?: string;
  _count?: {
    lotes: number;
    lotesDisponiveis: number;
    lotesReservados: number;
    lotesVendidos: number;
  };
}

export interface Lote {
  id: string;
  numero: string;
  metragem: string | number;
  valor: string | number;
  status: LoteStatus;
  quadraId: string;
  reservaExpiraEm: string | null;
  quadra?: { id: string; nome: string };
  contrato?: { id: string; cliente: { id: string; nome: string } } | null;
}

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string | null;
  logradouro: string | null;
  numeroEndereco: string | null;
  bairro: string | null;
  complemento: string | null;
  cep: string | null;
  cidade: string | null;
  estado: string | null;
  createdAt: string;
  _count?: { contratos: number };
}

export interface Parcela {
  id: string;
  contratoId: string;
  numero: number;
  valor: string | number;
  vencimento: string;
  status: ParcelaStatus;
  pagoEm: string | null;
  valorPago: string | number | null;
  multa: string | number | null;
}

export interface Contrato {
  id: string;
  clienteId: string;
  loteId: string;
  vendedorId: string;
  valorTotal: string | number;
  entrada: string | number;
  numParcelas: number;
  dataVenda: string;
  status: ContratoStatus;
  cliente?: Cliente;
  lote?: Lote;
  vendedor?: { id: string; nome: string };
  parcelas?: Parcela[];
  _count?: { parcelas: number };
}

export interface DashboardStats {
  totalQuadras: number;
  totalLotes: number;
  lotesDisponiveis: number;
  lotesReservados: number;
  lotesVendidos: number;
  totalClientes: number;
  totalContratos: number;
  receitaPrevista: number;
  receitaRecebida: number;
}
