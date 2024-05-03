import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/utils'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { checkSessionIdExists } from '../../middlewares/check-session-id-exists'

// Cookies <--------------> Formas de manter context entre requisições

const createTransactionSchema = z.object({
	title: z.string(),
	amount: z.number(),
	type: z.enum(['credit', 'debit']),
})

const getTransactionParamsSchema = z.object({
	id: z.string().length(25),
})

export const transatcionsRoutes = async (app: FastifyInstance) => {
	// GET /transactions

	app.get(
		'/',
		{
			preHandler: [checkSessionIdExists],
		},
		async (req, res) => {
			const sessionId = req.cookies.sessionId
			const transactions = await prisma.transactions.findMany({
				where: {
					sessionId,
				},
			})

			return {
				transactions: transactions.map((transaction) => {
					return {
						...transaction,
						amount: transaction.amount.toNumber(),
					}
				}),
			}
		},
	)

	app.get(
		'/:id',
		{
			preHandler: [checkSessionIdExists],
		},
		async (req) => {
			const { id } = getTransactionParamsSchema.parse(req.params)
			const transaction = await prisma.transactions.findUnique({
				where: {
					id,
				},
			})

			return {
				transaction: {
					...transaction,
					amount: transaction?.amount.toNumber(),
				},
			}
		},
	)

	// POST /transactions

	app.post('/', async (req, res) => {
		const { amount, title, type } = createTransactionSchema.parse(req.body)

		let sessionId = req.cookies.sessionId

		if (!sessionId) {
			sessionId = randomUUID()
			res.setCookie('sessionId', sessionId, {
				path: '/',
				maxAge: 60 * 60 * 60 * 24 * 7, // 7 dias
			})
		}

		await prisma.transactions.create({
			data: {
				amount: type === 'credit' ? amount : -amount,
				title,
				sessionId,
			},
		})

		return res.status(201).send()
	})

	// GET /transactions/summary
	app.get(
		'/summary',
		{
			preHandler: [checkSessionIdExists],
		},
		async (req) => {
			const sessionId = req.cookies.sessionId
			const { _sum: summary } = await prisma.transactions.aggregate({
				where: {
					sessionId,
				},
				_sum: {
					amount: true,
				},
			})

			return {
				summary: {
					amount: summary?.amount?.toNumber(),
				},
			}
		},
	)
}
