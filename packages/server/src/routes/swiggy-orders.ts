import SwiggyError from 'exporter/SwiggyError';
import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import * as exporter from 'exporter';

const orderRoutes = new Hono();

orderRoutes.post('/', async (c) => {
	const ua = c.req.header('User-Agent') ?? '';
	const { lastOrderID, offSetID } = await c.req.json();

	let requestCookies = getCookie(c, 'request-cookies');

	if (!requestCookies) {
		throw new SwiggyError('requestCookies are invalid', 400);
	}
	const data = await exporter.exportNewData(lastOrderID, requestCookies, ua, offSetID);

	return c.json({ status: 'Success', code: 0, message: 'Fetched Orders Sucessfully', data: data }, 200);
});

export default orderRoutes;
