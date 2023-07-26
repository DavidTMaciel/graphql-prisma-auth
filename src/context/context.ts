import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export interface context{
    prisma: PrismaClient;
}

export const context: context ={
    prisma,
}
