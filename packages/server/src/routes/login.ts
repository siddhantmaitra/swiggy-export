import SwiggyError from 'exporter/SwiggyError';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import * as exporter from 'exporter';

const loginRoutes = new Hono();

// Grab CSRF token and cookies for subsequent requests.
loginRoutes.get('/', async (c) => {
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
loginRoutes.post('/otp', async (c) => {
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
loginRoutes.post('/auth', async (c) => {
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

export default loginRoutes;
