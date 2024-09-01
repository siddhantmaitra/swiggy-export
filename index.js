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

let __SW = null;
let csrf = null;
let COOKIES;




async function handleSetCookies(response, cookieNameToRemove = null) {
    // Get the Set-Cookie headers using the built-in method
    const setCookies = response.headers.getSetCookie();

    if (!setCookies || setCookies.length === 0) {
        return '';
    }

    // Process each cookie
    let cookiesArray = setCookies.map(cookie => cookie.split(';')[0]);

    // Remove the specified cookie by name if provided
    if (cookieNameToRemove) {
        cookiesArray = cookiesArray.filter(cookie => !cookie.startsWith(`${cookieNameToRemove}=`));
    }

    // Join the cookies into a single string for the Cookie header
    const cookieHeader = cookiesArray.join('; ');

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
	COOKIES = await handleSetCookies(response);
	console.log("LOOK COOKIES ",COOKIES);
	const res = await response.text();
	let regex = /window\._csrfToken = "[^"]*"/i;
	csrf = res.match(regex)[0].split('"')[1]

}


async function getOTP() {
	let options = structuredClone(constOpts);
	options.method = 'POST';
	options.headers["Cookie"] = COOKIES;
	options.headers["Content-Type"] = 'application/json';
	if(mobileNumber){
		options.body = JSON.stringify({
			"mobile": mobileNumber,
			"_csrf": csrf
		});
	}else{
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
	// Await the user's input for OTP
	// await visitSwiggy();
	const otp = await askQuestion('Please enter the OTP: ');

	options.body = JSON.stringify({
		"otp": otp,
		"_csrf": csrf
	});
	
	options.method = 'POST';
	options.headers["Cookie"] = COOKIES;
	options.headers["Content-Type"] = 'application/json';
	
	console.log("OPTION OBJ FOR LOGIN: ",options)
	//   console.log(options);
	const response = await hitURL(SWIGGY_LOGIN_URL, options);

	console.log("LOGIN : ", await response.json());

	// visitSwiggy();

}

async function main() {
	await visitSwiggy();
	await getOTP();
	await performLogin();
}



main();
