import * as sw from "./utils";


let csrf : string;
let requestCookies : string;
const mobileNumber = process.env.MOBILE_NUMBER;

async function visitSwiggy() {
	const response = await sw.hitURL(sw.SWIGGY_BASE_URL, sw.constOpts);
	requestCookies = await sw.buildCookieHeader(response);
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
	let options  = structuredClone(sw.constOpts);
	
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
	const val = await sw.hitURL(sw.SWIGGY_GENERATE_OTP_URL, options);
}

async function performLogin() {
	let options = structuredClone(sw.constOpts);
	const otp = await sw.askInput('\nPlease enter the OTP: ');

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

	const response = await sw.hitURL(sw.SWIGGY_LOGIN_URL, options);

	// update them cookies and remove tid coz we logged in
	requestCookies = await sw.buildCookieHeader(response, '_guest_tid');
	console.log(response.ok ?"Logged In" : "Login failed");
	// console.log(response);
	
	return requestCookies;
}

export async function login() {
	await visitSwiggy();
	await generateOTP();
	return await performLogin();
}


