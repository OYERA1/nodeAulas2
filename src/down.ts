import { prisma } from './lib/utils'

export const down = async () => {
	await prisma.transactions.deleteMany()
}

down()