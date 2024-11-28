import * as sw from './utils';

export async function visitSwiggy(userAgent: string) {
	let csrf: string;
	let requestCookies: string;

	let options = structuredClone(sw.constOpts);
	let headers = new Headers(options.headers);
	headers.set('User-Agent', userAgent);
	headers.set('Content-Type', 'application/json');
	options.headers = headers;

	const response = await sw.hitURL(sw.SWIGGY_BASE_URL, options);
	requestCookies = await sw.buildCookieHeader(response);
	const res = await response.text();

	let regex = /window\._csrfToken = "[^"]*"/i;
	let matches = res.match(regex);

	if (matches != null) {
		csrf = matches[0].split('"')[1];
	} else {
		throw new Error('Unable to find csrf token');
	}

	console.log('Visited Swiggy; Got csrf token');
	return { csrf, requestCookies };
}

export async function generateOTP(userAgent: string, mobileNumber: string, requestCookies: string, csrf: string) {
	let options = structuredClone(sw.constOpts);

	options.method = 'POST';

	let headers = new Headers(options.headers);
	headers.set('Cookie', requestCookies);
	headers.set('Content-Type', 'application/json');
	headers.set('User-Agent', userAgent);
	options.headers = headers;

	if (mobileNumber) {
		options.body = JSON.stringify({
			mobile: mobileNumber,
			_csrf: csrf,
		});
	} else {
		throw new Error('Mobile number not provided.', { cause: { code: 400, message: 'Mobile number is necessary' } });
	}

	console.log('Hitting otp gen url ...');
	const val = await sw.hitURL(sw.SWIGGY_GENERATE_OTP_URL, options);
	const res = await val.json();

	if (res?.statusCode != 0) {
		throw new Error('Error in generating OTP.', { cause: { code: res.statusCode, message: res.statusMessage } });
	}
}

export async function performLogin(userAgent: string, otp: string, requestCookies: string, csrf: string) {
	let options = structuredClone(sw.constOpts);

	options.body = JSON.stringify({
		otp: otp,
		_csrf: csrf,
	});

	options.method = 'POST';
	let headers = new Headers(options.headers);

	headers.set('Cookie', requestCookies);
	headers.set('Content-Type', 'application/json');
	headers.set('User-Agent', userAgent);
	options.headers = headers;

	console.log('Hitting login url ...');

	const response = await sw.hitURL(sw.SWIGGY_LOGIN_URL, options);
	const res = await response.json();
	// update them cookies and remove tid coz we logged in
	requestCookies = await sw.buildCookieHeader(response, '_guest_tid');

	if (response.ok && res.statusCode === 0) {
		console.log('Login Succesful');
	} else {
		throw new Error('Login Failed.', { cause: { code: res.statusCode, message: res.statusMessage } });
	}
	return requestCookies;
}
