import { Hono } from 'hono';
import * as exporter from 'exporter';
import { HTTPException } from 'hono/http-exception';

const app = new Hono();

// app.get('/', (c) => {
//   const ua = c.req.header('User-Agent') ?? "";
//   let data = {};
//   console.log(ua);
//   exporter.visitSwiggy(ua).then(res => data = res);

//   return c.text(JSON.stringify(data));
// })
app.get('/', async (c) => {
	const ua = c.req.header('User-Agent') ?? '';
	let data: any = {};

	try {
		data = await exporter.visitSwiggy('');
		c.res.headers.set('Set-Cookie', `request_cookies=${data.requestCookies};`);
		c.res.headers.set('Set-Cookie', `request_csrf=${data.csrf};`);
	} catch (err: any) {
		data = err.cause;
		throw new HTTPException(err.cause.code, err.cause);
	}

	return c.html(
		`<h1>Hello from swiggy-export!</h1><div><p>Received data for login: </p> <div>${JSON.stringify(data)}</div></div>`
	);
});

app.onError((err, c) => {
	if (err instanceof HTTPException) {
		console.error(`${err}`);
	}
	return c.text('Custom Error Message', 500);
});
export default app;
