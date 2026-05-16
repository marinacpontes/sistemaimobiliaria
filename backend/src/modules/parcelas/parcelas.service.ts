import { ContratoStatus, ParcelaStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ConflictError, NotFoundError } from '../../shared/errors';

const MS_DIA = 24 * 60 * 60 * 1000;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

async function marcarAtrasadas() {
  await prisma.parcela.updateMany({
    where: {
      status: ParcelaStatus.PENDENTE,
      vencimento: { lt: new Date() },
    },
    data: { status: ParcelaStatus.ATRASADO },
  });
}

export const parcelasService = {
  async listByContrato(contratoId: string) {
    const contrato = await prisma.contrato.findUnique({ where: { id: contratoId } });
    if (!contrato) throw new NotFoundError('Contrato não encontrado');
    await marcarAtrasadas();
    return prisma.parcela.findMany({
      where: { contratoId },
      orderBy: { numero: 'asc' },
    });
  },

  async pay(id: string) {
    const parcela = await prisma.parcela.findUnique({
      where: { id },
      include: { contrato: { include: { parcelas: true } } },
    });
    if (!parcela) throw new NotFoundError('Parcela não encontrada');
    if (parcela.status === ParcelaStatus.PAGO) {
      throw new ConflictError('Parcela já está paga');
    }

    const valorBase = Number(parcela.valor);
    const hoje = new Date();
    let multa = 0;
    if (parcela.vencimento < hoje) {
      const diasAtraso = Math.floor((hoje.getTime() - parcela.vencimento.getTime()) / MS_DIA);
      multa = round2(valorBase * 0.02 + valorBase * 0.001 * diasAtraso);
    }
    const valorPago = round2(valorBase + multa);

    return prisma.$transaction(async (tx) => {
      const atualizada = await tx.parcela.update({
        where: { id },
        data: {
          status: ParcelaStatus.PAGO,
          pagoEm: hoje,
          valorPago,
          multa: multa > 0 ? multa : null,
        },
      });

      const pendentes = await tx.parcela.count({
        where: {
          contratoId: parcela.contratoId,
          status: { not: ParcelaStatus.PAGO },
        },
      });
      if (pendentes === 0) {
        await tx.contrato.update({
          where: { id: parcela.contratoId },
          data: { status: ContratoStatus.QUITADO },
        });
      }
      return atualizada;
    });
  },
};
