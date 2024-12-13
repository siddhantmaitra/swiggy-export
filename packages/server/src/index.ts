import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { logger } from 'hono/logger';
import * as exporter from 'exporter';
import SwiggyError from 'exporter/SwiggyError';
import { apiReference } from '@scalar/hono-api-reference';
import openapiJson from '../public/openapi.json';

const app = new Hono();
app.use(logger());

//OpenAPI
app.get('/', apiReference({ spec: { content: openapiJson } }));
app.get('/openapi', (c) => c.json(openapiJson));

// Grab CSRF token and cookies for subsequent requests.
app.get('/login', async (c) => {
	const ua = c.req.header('User-Agent') ?? '';

	const data = await exporter.visitSwiggy(ua);
	if (Object.keys(data).length) {
		setCookie(c, 'request-cookies', data.requestCookies, { path: '/', httpOnly: true });
		setCookie(c, 'request-csrf', data.csrf, { path: '/login', httpOnly: true });
		return c.json({ status: 'Success', code: 0, message: 'Acquired CSRF token', data: data }, 200);
	}
	return c.json('Failed to get CSRF token from swiggy.com', 500);
});

// Generate otp
app.post('/login/otp', async (c) => {
	const ua = c.req.header('User-Agent') ?? '';
	const body = await c.req.json();
	const csrf = getCookie(c, 'request-csrf');
	const requestCookies = getCookie(c, 'request-cookies');

	if (!requestCookies || !csrf) {
		throw new SwiggyError('csrf or requestCookies are invalid', 400);
	} else {
		await exporter.generateOTP(ua, body.mobileNumber, requestCookies, csrf);
		return c.json(
			{ status: 'Success', code: 0, message: 'Generated OTP Successfully', data: { csrf, requestCookies } },
			200
		);
	}
});

// Login user
app.post('/login/auth', async (c) => {
	const ua = c.req.header('User-Agent') ?? '';
	const body = await c.req.json();
	const csrf = getCookie(c, 'request-csrf');
	let requestCookies = getCookie(c, 'request-cookies');

	if (!requestCookies || !csrf) {
		throw new SwiggyError('csrf or requestCookies are invalid', 400);
	} else {
		requestCookies = await exporter.performLogin(ua, body.otp, requestCookies, csrf);
		setCookie(c, 'request-cookies', requestCookies, { path: '/', httpOnly: true });
		return c.json(
			{ status: 'Success', code: 0, message: 'Logged in Sucessfully', data: { csrf, requestCookies } },
			200
		);
	}
});

app.post('/orders', async (c) => {
	const ua = c.req.header('User-Agent') ?? '';
	const { lastOrderID, offSetID } = await c.req.json();

	let requestCookies = getCookie(c, 'request-cookies');

	if (!requestCookies) {
		throw new SwiggyError('requestCookies are invalid', 400);
	}
	const data = await exporter.exportNewData(lastOrderID, requestCookies, ua, offSetID);

	return c.json({ status: 'Success', code: 0, message: 'Fetched Orders Sucessfully', data: data }, 200);
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

export default app;
