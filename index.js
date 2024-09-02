import { createInterface } from 'node:readline';

const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
});

const constOpts = {
	headers: {
		"User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
		// Connection: "keep-alive"
	},
	method: "GET"
}


const SWIGGY_BASE_URL = "https://www.swiggy.com";

const SWIGGY_GENERATE_OTP_URL = `${SWIGGY_BASE_URL}/dapi/auth/sms-otp`;
const SWIGGY_LOGIN_URL = `${SWIGGY_BASE_URL}/dapi/auth/otp-verify`;
const mobileNumber = process.env.MOBILE_NUMBER;

let csrf = null;
let requestCookies;

// Global cookie jar using a Set
const cookieJar = new Set();

async function buildCookieHeader(response, cookieNameToRemove = null) {
	console.log("BEFORE buildCookieHeader:  ", cookieJar);
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

	console.log("AFTER buildCookieHeader:  ", cookieJar);

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

	//   console.log(options);
	const response = await hitURL(SWIGGY_GENERATE_OTP_URL, options);

	console.log("OTP GENERATION: ", await response.json());
}
async function askQuestion(query) {
	return new Promise(resolve => rl.question(query, resolve));
}


async function performLogin() {
	let options = structuredClone(constOpts);
	const otp = await askQuestion('Please enter the OTP: ');

	options.body = JSON.stringify({
		"otp": otp,
		"_csrf": csrf
	});

	options.method = 'POST';
	options.headers["Cookie"] = requestCookies;
	options.headers["Content-Type"] = 'application/json';

	console.log("OPTION OBJ FOR LOGIN: ", options)
	//   console.log(options);
	const response = await hitURL(SWIGGY_LOGIN_URL, options);

	// update them cookies and remove tid coz we logged in
	requestCookies = await buildCookieHeader(response, '_guest_tid');

	console.log("LOGIN : ", await response.json());
	console.log("HEADERS FROM LOGGING IN: ", response.headers);

}

async function main() {
	await visitSwiggy();
	await generateOTP();
	await performLogin();
}

main();
