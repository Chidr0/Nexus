import { PrismaClient } from '@prisma/client';

// Essa verificação evita que o Prisma tente instanciar no navegador
const prisma = typeof window === 'undefined' 
  ? (global.prisma || new PrismaClient()) 
  : {} as any;

if (typeof window === 'undefined') {
  global.prisma = prisma;
}

export default prisma;	