import { Hono } from 'hono';
import * as exporter from 'exporter';
import SwiggyError from 'exporter/SwiggyError';

const app = new Hono();

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
