import { createInterface } from 'node:readline';

export const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
});

export async function askInput(query : string) {
	return new Promise(resolve => rl.question(query, resolve));
}

const userAgent = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";


export const constOpts : RequestInit = {
	headers: {
		"User-Agent": userAgent,
		Connection: "keep-alive"
	},
	method: "GET"
}

export async function hitURL(url : string, options : RequestInit) {
	console.log("Request Hit url: " ,url);
	console.log("Request headers: ", options.headers);
	console.log("Request payload: ", options.body);

	const response = await fetch(url, options);
	
	console.log("Response status:  ", response.status , response.statusText);
	console.log("Response headers: ", response.headers);
	// console.log("Response body: ", await response.text())

	if (!response.ok) {
		const message = `An error has occured: ${response.status}`;
		throw new Error(message);
	}
	return response;
}

export const SWIGGY_BASE_URL  = "https://www.swiggy.com";
export const SWIGGY_GENERATE_OTP_URL = `${SWIGGY_BASE_URL}/dapi/auth/sms-otp`;
export const SWIGGY_LOGIN_URL = `${SWIGGY_BASE_URL}/dapi/auth/otp-verify`;
export const SWIGGY_ORDER_URL = `${SWIGGY_BASE_URL}/mapi/order/all?order_id=`


// Global cookie jar using a Set
const cookieJar : Set<String> = new Set();

export async function buildCookieHeader(response : Response, cookieNameToRemove : string | null = null) {
	const setCookies : string[] = response.headers.getSetCookie();

	if (!setCookies || setCookies.length === 0) {
		return '';
	}

	setCookies.forEach((cookie) => {
		const cookieValue = cookie.split(';')[0];
		cookieJar.add(cookieValue);
	});

	if (cookieNameToRemove) {
		cookieJar.forEach(cookie => {
			if (cookie.startsWith(`${cookieNameToRemove}=`)) {
				cookieJar.delete(cookie);
			}
		});
	}
	return Array.from(cookieJar).join('; ');
}
