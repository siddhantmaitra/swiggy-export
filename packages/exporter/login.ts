
import { createInterface } from 'node:readline';
import {writeFileSync, } from 'fs';


const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
});

async function askInput(query : string) {
	return new Promise(resolve => rl.question(query, resolve));
}

const userAgent = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";


const constOpts : RequestInit = {
	headers: {
		"User-Agent": userAgent,
		Connection: "keep-alive"
	},
	method: "GET"
}


const SWIGGY_BASE_URL  = "https://www.swiggy.com";
const SWIGGY_GENERATE_OTP_URL = `${SWIGGY_BASE_URL}/dapi/auth/sms-otp`;
const SWIGGY_LOGIN_URL = `${SWIGGY_BASE_URL}/dapi/auth/otp-verify`;
const SWIGGY_ORDER_URL = `${SWIGGY_BASE_URL}/mapi/order/all?order_id=`

let csrf : string;
let requestCookies : string;
let mobileNumber: string = "8335852033";

// let reqHeaders = new Headers();

// reqHeaders.set("User-agent",userAgent);
// reqHeaders.set("Connection","keep-alive");

// Global cookie jar using a Set
const cookieJar : Set<String> = new Set();

async function buildCookieHeader(response : Response, cookieNameToRemove : string | null = null) {
	// console.log("BEFORE buildCookieHeader:  ", cookieJar);
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

	const cookieHeader = Array.from(cookieJar).join('; ');

	// console.log("AFTER buildCookieHeader:  ", cookieJar);

	return cookieHeader;
}

async function hitURL(url : string, options : RequestInit) {
	const response = await fetch(url, options);
	if (!response.ok) {
		const message = `An error has occured: ${response.status}`;
		throw new Error(message);
	}
	return response;
}

async function visitSwiggy() {
	const response = await hitURL(SWIGGY_BASE_URL, constOpts);
	requestCookies = await buildCookieHeader(response);
	const res = await response.text();
	let regex = /window\._csrfToken = "[^"]*"/i;
	let matches = res.match(regex)
	if(matches != null){
		csrf= matches[0].split('"')[1]
	}else{
		throw new Error("Unable to find csrf token");
	}
	console.log("Visited Swiggy; Got csrf token");
}

async function generateOTP() {
	let options  = structuredClone(constOpts);
	
	options.method = 'POST';

	let headers = new Headers(options.headers);
	headers.set("Cookie", requestCookies);
	headers.set("Content-Type","application/json");
	options.headers = headers;
	
	if (mobileNumber) {
		options.body = JSON.stringify({
			"mobile": mobileNumber,
			"_csrf": csrf
		});
	} else {
		throw new Error("Mobile number is not set in env");
	}
	console.log("Hitting otp gen url ...");
	await hitURL(SWIGGY_GENERATE_OTP_URL, options);
}

async function performLogin() {
	let options = structuredClone(constOpts);
	const otp = await askInput('\nPlease enter the OTP: ');

	options.body = JSON.stringify({
		"otp": otp,
		"_csrf": csrf
	});

	options.method = 'POST';
	let headers = new Headers(options.headers);

	headers.set("Cookie", requestCookies);
	headers.set("Content-Type","application/json");
	options.headers = headers;

	console.log("Hitting login url ...");

	const response = await hitURL(SWIGGY_LOGIN_URL, options);

	// update them cookies and remove tid coz we logged in
	requestCookies = await buildCookieHeader(response, '_guest_tid');
	console.log(response.ok ?"Logged In" : "Login failed");
}

export async function login() {
	await visitSwiggy();
	await generateOTP();
	await performLogin();
}


