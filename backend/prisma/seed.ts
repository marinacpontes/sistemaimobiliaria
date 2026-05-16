import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  const passwordHash = await bcrypt.hash(env.ADMIN_SENHA, 10);

  await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: {
      nome: env.ADMIN_NOME,
      passwordHash,
    },
    create: {
      nome: env.ADMIN_NOME,
      email: env.ADMIN_EMAIL,
      passwordHash,
    },
  });

  console.log('Seed concluído!');
  console.log(`  Admin: ${env.ADMIN_EMAIL}`);
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
