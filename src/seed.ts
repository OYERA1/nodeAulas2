import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
	await prisma.transactions.upsert({
		where: { id: 'clvgzezwk000008l9b0ug3v11' },
		create: { title: 'Salary', amount: 1000.1, id: '1', sessionId: '1' },
		update: {},
	})
}

main()
