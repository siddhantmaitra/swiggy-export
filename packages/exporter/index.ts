import { exportData } from "./export";
import { login } from "./login";


async function main(){
	const cookies = await login();
	console.log("Cookies from login: ",cookies);
	await exportData(cookies);
}

main();