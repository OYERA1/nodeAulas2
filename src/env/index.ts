import { config } from 'dotenv'
import { z } from 'zod'

const envSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
	DATABASE_CLIENT: z.enum(['postgresql', 'sqlite']),
	DATABASE_URL: z.string(),
	PORT: z.coerce.number().default(3000),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
	console.error('invalid environment variables!', _env.error.format())
	throw new Error('invalid environment variables!')
}

export const env = _env.data
