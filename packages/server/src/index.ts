import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import * as exporter from 'exporter';
import SwiggyError from 'exporter/SwiggyError';

const app = new Hono();

// Grab CSRF token and cookies for subsequent requests.
app.get('/login', async (c) => {
	const ua = c.req.header('User-Agent') ?? '';

	const data = await exporter.visitSwiggy(ua);
	if (Object.keys(data).length) {
		setCookie(c, 'request_cookies', data.requestCookies, { path: '/', httpOnly: true });
		setCookie(c, 'request_csrf', data.csrf, { path: '/login', httpOnly: true });
		return c.json({ status: 'Success', code: 0, data: data }, 200);
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
		requestCookies = await exporter.performLogin(ua, body.ss, requestCookies, csrf);
		return c.json(
			{ status: 'Success', code: 0, message: 'Logged in Sucessfully', data: { csrf, requestCookies } },
			200
		);
	}
});

app.onError((err, c) => {
	if (err instanceof SwiggyError) {
		return c.json(
			{
				status: 'Failure',
				error: err.message,
				code: err.statusCode,
				cause: err.reason || null,
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
		},
		500
	);
});

export default app;
