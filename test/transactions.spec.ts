import {
	expect,
	test,
	beforeAll,
	afterAll,
	describe,
	it,
	afterEach,
} from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { env } from '../src/env'
import { prisma } from '../src/lib/utils'

describe('Transactions routes', () => {
	beforeAll(async () => {
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	afterEach(async () => {
		await prisma.transactions.deleteMany({
			where: {
				title: ''.startsWith('Test') ? 'test' : undefined,
			},
		})
	})

	it('should be able to can create a new transaction', async () => {
		await request(app.server)
			.post('/transactions')
			.send({
				title: 'Test Transaction',
				amount: 5000,
				type: 'credit',
			})
			.expect(201)
	})

	it('should return a list of transactions', async () => {
		const response = await request(app.server).post('/transactions').send({
			title: 'Test Transaction',
			amount: 5000,
			type: 'credit',
		})

		const cookies = response.get('Set-Cookie')

		if (!cookies) return expect(cookies).toBeDefined()

		const listTransactionsResponse = await request(app.server)
			.get('/transactions')
			.set('Cookie', cookies)
			.expect(200)

		expect(listTransactionsResponse.body.transactions).toEqual([
			expect.objectContaining({
				title: 'Test Transaction',
				amount: 5000,
			}),
		])
	})

	it('should return a especific transaction', async () => {
		const response = await request(app.server).post('/transactions').send({
			title: 'Test Transaction',
			amount: 5000,
			type: 'credit',
		})

		const cookies = response.get('Set-Cookie')

		if (!cookies) return expect(cookies).toBeDefined()

		const transaction = await request(app.server)
			.get('/transactions/')
			.set('Cookie', cookies)
			.expect(200)

		const transactionId = transaction.body.transactions[0].id

		const getTransactionResponse = await request(app.server)
			.get(`/transactions/${transactionId}`)
			.set('Cookie', cookies)
			.expect(200)

		expect(getTransactionResponse.body.transaction).toEqual(
			expect.objectContaining({
				title: 'Test Transaction',
				amount: 5000,
			}),
		)
	})

	it('should return a summary of transactions', async () => {
		const post1 = await request(app.server).post('/transactions').send({
			title: 'Test Transaction',
			amount: 5000,
			type: 'credit',
		})

		const cookies = post1.get('Set-Cookie')

		if (!cookies) return expect(cookies).toBeDefined()

		await request(app.server)
			.post('/transactions')
			.set('Cookie', cookies)
			.send({
				title: 'Test debit',
				amount: 2000,
				type: 'debit',
			})

		const summaryResponse = await request(app.server)
			.get('/transactions/summary')
			.set('Cookie', cookies)
			.expect(200)

		expect(summaryResponse.body.summary).toEqual(
			expect.objectContaining({
				amount: 3000,
			}),
		)
	})
})
