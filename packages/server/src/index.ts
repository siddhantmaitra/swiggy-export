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
app.post('login/otp', async (c) => {
	const ua = c.req.header('User-Agent') ?? '';
});

// Login user
app.post('login/auth', async (c) => {
	const ua = c.req.header('User-Agent') ?? '';
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
			error: 'Internal Server Error',
			message: err.message,
			cause: err.cause,
		},
		500
	);
});

export default app;
