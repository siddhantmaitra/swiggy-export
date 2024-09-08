import { createInterface } from 'node:readline';
import { readFileSync, writeFileSync, } from 'fs';


const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
});

const constOpts = {
	headers: {
		"User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
		Connection: "keep-alive"
	},
	method: "GET"
}


const SWIGGY_BASE_URL = "https://www.swiggy.com";

const SWIGGY_GENERATE_OTP_URL = `${SWIGGY_BASE_URL}/dapi/auth/sms-otp`;
const SWIGGY_LOGIN_URL = `${SWIGGY_BASE_URL}/dapi/auth/otp-verify`;
const SWIGGY_ORDER_URL = `${SWIGGY_BASE_URL}/mapi/order/all?order_id=`
const mobileNumber = process.env.MOBILE_NUMBER;

let csrf = null;
let requestCookies;
let offsetID = '';
let timeoutID;

// Global cookie jar using a Set
const cookieJar = new Set();

async function buildCookieHeader(response, cookieNameToRemove = null) {
	// console.log("BEFORE buildCookieHeader:  ", cookieJar);
	const setCookies = response.headers.getSetCookie();

	if (!setCookies || setCookies.length === 0) {
		return '';
	}

	setCookies.forEach(cookie => {
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

async function hitURL(url, options) {
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
	csrf = res.match(regex)[0].split('"')[1]

	console.log("Visited Swiggy; Got csrf token");
}

async function generateOTP() {
	let options = structuredClone(constOpts);
	options.method = 'POST';
	options.headers["Cookie"] = requestCookies;
	options.headers["Content-Type"] = 'application/json';
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
async function askQuestion(query) {
	return new Promise(resolve => rl.question(query, resolve));
}

async function performLogin() {
	let options = structuredClone(constOpts);
	const otp = await askQuestion('\nPlease enter the OTP: ');

	options.body = JSON.stringify({
		"otp": otp,
		"_csrf": csrf
	});

	options.method = 'POST';
	options.headers["Cookie"] = requestCookies;
	options.headers["Content-Type"] = 'application/json';

	// console.log("OPTION OBJ FOR LOGIN: ", options)
	  console.log("Hitting login url ...");
	const response = await hitURL(SWIGGY_LOGIN_URL, options);

	// update them cookies and remove tid coz we logged in
	requestCookies = await buildCookieHeader(response, '_guest_tid');
	console.log(response.ok ?"Logged In" : "Login failed");
	// console.log("LOGIN : ", await response.json());
	// console.log("HEADERS FROM LOGGING IN: ", response.headers);

}

async function fetchOrderInfo() {
	let options = structuredClone(constOpts);
	options.headers["Cookie"] = requestCookies;
	console.log("hit order url", `${SWIGGY_ORDER_URL}${offsetID}`);
	let response = await hitURL(`${SWIGGY_ORDER_URL}${offsetID}`, options);

	let res = await response.json();
	console.log("orderArray creation ... ")
	let orderArray = res.data?.orders;
	console.log("orderArray creation done. Length is "+ orderArray.length);

	if (res && (res.statusCode === 0) && orderArray?.length > 0) {
		offsetID = orderArray[orderArray.length - 1]?.order_id; //use .at(-1)?
		console.log(`New offset ID: ${offsetID}\n`);

		timeoutID = setTimeout(fetchOrderInfo, 5*1000);

		writeFileSync(`exportdata/orders_${offsetID}.json`, JSON.stringify(orderArray, null, 2));
	} else {
		clearTimeout(timeoutID);
		console.log(`Order fetch stopped`);
	}
}

async function main() {
	await visitSwiggy();
	await generateOTP();
	await performLogin();
	await fetchOrderInfo();
}

main();
