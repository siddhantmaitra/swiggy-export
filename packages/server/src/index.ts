import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { logger } from 'hono/logger';
import SwiggyError from 'exporter/SwiggyError';
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
	const e = {
		status: 'Failure',
		error: err.message,
		code: 500,
		cause: err?.cause,
		txnID: c.req.header('X-Txn-ID') || null,
		sessionID: getCookie(c, 'sessionID') || null,
	};
	if (err instanceof SwiggyError) {
		console.error(`[Error] ${err.message} | ${err.reason}`);
		e.code = err.statusCode;
		e.cause = err?.reason ?? null;
		return c.json(err.statusCode === 400 ? 400 : 500);
	}
	console.error(`[Error] ${err.message} | ${err.cause}`);
	// Generic error handler for other error types
	return c.json(e, 500);
});

if (process.env.NODE_ENV !== 'production') {
	const setupDocs = async () => {
		let openapiJson = await import('../public/openapi.json');
		let apiReference = await import('@scalar/hono-api-reference').then((module) => module.apiReference);
		//OpenAPI
		app.get('/', apiReference({ spec: { content: openapiJson } }));
	};
	setupDocs();
}

export default {
	port: Number(process.env.SERVER_PORT) || 4325,
	fetch: app.fetch,
};
