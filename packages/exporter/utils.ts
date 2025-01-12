// const userAgent = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";

import SwiggyError from './SwiggyError';

export const constOpts: RequestInit = {
	headers: {
		Connection: 'keep-alive',
	},
	method: 'GET',
};

export async function hitURL(url: string, options: RequestInit) {
	console.log('Request URL: ', url);
	const response = await fetch(url, options);
	console.log('Response Status:  ', response.status, response.statusText);

	if (!response.ok) {
		throw new SwiggyError('Call to Swiggy failed', response.status, response.statusText);
	}
	return response;
}

export const SWIGGY_BASE_URL = 'https://www.swiggy.com';
export const SWIGGY_GENERATE_OTP_URL = `${SWIGGY_BASE_URL}/dapi/auth/sms-otp`;
export const SWIGGY_LOGIN_URL = `${SWIGGY_BASE_URL}/dapi/auth/otp-verify`;
export const SWIGGY_ORDER_URL = `${SWIGGY_BASE_URL}/dapi/order/all?order_id=`;

export async function buildCookieHeader(response: Response, cookieNameToRemove: string | null = null) {
	const cookieJar: Set<String> = new Set();
	const setCookies: string[] = response.headers.getSetCookie();

	if (!setCookies || setCookies.length === 0) {
		return '';
	}

	setCookies.forEach((cookie) => {
		const cookieValue = cookie.split(';')[0];
		cookieJar.add(cookieValue);
	});

	if (cookieNameToRemove) {
		cookieJar.forEach((cookie) => {
			if (cookie.startsWith(`${cookieNameToRemove}=`)) {
				cookieJar.delete(cookie);
			}
		});
	}
	return Array.from(cookieJar).join('; ');
}
