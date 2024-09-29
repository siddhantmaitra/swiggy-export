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
	const response = await fetch(url, options);
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
export let requestCookies : string;