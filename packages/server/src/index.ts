import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { logger } from 'hono/logger';
import SwiggyError from 'exporter/SwiggyError';
// import { apiReference } from '@scalar/hono-api-reference';
// import openapiJson from '../public/openapi.json';
import loginRoutes from './routes/login';
import orderRoutes from './routes/swiggy-orders';

const app = new Hono();
app.use(logger());

app.route('/login', loginRoutes);
app.route('/orders', orderRoutes);

app.get('/health', (c) => {
	return c.json({
		status: 'ok',
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
	});
});

app.onError((err, c) => {
	console.error(`[Error] ${err.message}`);
	if (err instanceof SwiggyError) {
		return c.json(
			{
				status: 'Failure',
				error: err.message,
				code: err.statusCode,
				cause: err.reason || null,
				txnID: c.req.header('X-Txn-ID') || null,
				sessionID: getCookie(c, 'sessionID') || null,
			},
			err.statusCode === 400 ? 400 : 500
		);
	}

	// Generic error handler for other error types
	return c.json(
		{
			status: 'Failure',
			error: err.message,
			code: 500,
			cause: err?.cause || null,
			txnID: c.req.header('X-Txn-ID') || null,
			sessionID: getCookie(c, 'sessionID') || null,
		},
		500
	);
});

if (process.env.NODE_ENV === 'development') {
	const setupDocs = async () => {
		let openapiJson = await import('../public/openapi.json');
		let apiReference = await import('@scalar/hono-api-reference').then((module) => module.apiReference);
		//OpenAPI
		app.get('/', apiReference({ spec: { content: openapiJson } }));
	};
	setupDocs();
}

export default {
	port: Number(process.env.PORT) || 3000,
	fetch: app.fetch,
};

console.log(`Server started on http://localhost:${process.env.PORT || 3000}`);
