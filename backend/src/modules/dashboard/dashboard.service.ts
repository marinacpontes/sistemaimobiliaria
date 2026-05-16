import { ContratoStatus, LoteStatus, ParcelaStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';

export const dashboardService = {
  async getStats() {
    await prisma.parcela.updateMany({
      where: { status: ParcelaStatus.PENDENTE, vencimento: { lt: new Date() } },
      data: { status: ParcelaStatus.ATRASADO },
    });
    await prisma.lote.updateMany({
      where: { status: LoteStatus.RESERVADO, reservaExpiraEm: { lt: new Date() } },
      data: { status: LoteStatus.DISPONIVEL, reservaExpiraEm: null },
    });

    const [
      totalLotes,
      lotesPorStatus,
      totalQuadras,
      totalClientes,
      totalContratos,
      contratosAgg,
      entradaAgg,
      pagoAgg,
    ] = await Promise.all([
      prisma.lote.count(),
      prisma.lote.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.quadra.count(),
      prisma.cliente.count(),
      prisma.contrato.count(),
      prisma.contrato.aggregate({
        _sum: { valorTotal: true },
        where: { status: { in: [ContratoStatus.ATIVO, ContratoStatus.QUITADO] } },
      }),
      prisma.contrato.aggregate({
        _sum: { entrada: true },
        where: { status: { in: [ContratoStatus.ATIVO, ContratoStatus.QUITADO] } },
      }),
      prisma.parcela.aggregate({
        _sum: { valorPago: true },
        where: { status: ParcelaStatus.PAGO },
      }),
    ]);

    const porStatus = (status: LoteStatus) =>
      lotesPorStatus.find((s) => s.status === status)?._count._all ?? 0;

    const receitaPrevista = Number(contratosAgg._sum.valorTotal ?? 0);
    const entradaRecebida = Number(entradaAgg._sum.entrada ?? 0);
    const parcelasPagas = Number(pagoAgg._sum.valorPago ?? 0);
    const receitaRecebida = entradaRecebida + parcelasPagas;

    return {
      totalQuadras,
      totalLotes,
      lotesDisponiveis: porStatus(LoteStatus.DISPONIVEL),
      lotesReservados: porStatus(LoteStatus.RESERVADO),
      lotesVendidos: porStatus(LoteStatus.VENDIDO),
      totalClientes,
      totalContratos,
      receitaPrevista,
      receitaRecebida,
    };
  },
};
