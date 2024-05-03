import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { transatcionsRoutes } from './routes/transactions/transactions'

export const app = fastify()

app.register(cookie)

app.register(transatcionsRoutes, {
	prefix: 'transactions',
})
