import { exportData } from "./export";
import { login } from "./login";


async function main(){
	const cookies = await login();
	await exportData(cookies);
}

main();