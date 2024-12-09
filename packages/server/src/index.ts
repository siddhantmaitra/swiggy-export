import { Hono } from 'hono';
import * as exporter from 'exporter';
import SwiggyError from 'exporter/SwiggyError';

const app = new Hono();

// Grab CSRF token and cookies for subsequent requests.
app.get('/login/tokens', async (c) => {
	const ua = c.req.header('User-Agent') ?? '';
	let data: any = {};
	data = await exporter.visitSwiggy('');
	if (Object.keys(data).length) {
		c.res.headers.set('Set-Cookie', `request_cookies=${data.requestCookies};`);
		c.res.headers.set('Set-Cookie', `request_csrf=${data.csrf};`);
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
