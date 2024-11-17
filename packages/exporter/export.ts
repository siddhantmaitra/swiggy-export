import { constOpts, hitURL, SWIGGY_ORDER_URL } from "./utils";
import {writeFileSync,mkdirSync,existsSync } from 'fs';

let offSetID : string = "";
let timeoutID: Timer;
const folderName : string = "exportdata";

export async function exportData(cookies : string){
	let options = structuredClone(constOpts);
	
	const headers = new Headers(options.headers);
	headers.set("Cookie",cookies);
	headers.set("Content-Type","application/json");

	options.headers = headers;
	
	let response = await hitURL(`${SWIGGY_ORDER_URL}${offSetID}`, options);

	let res = await response.json();
	console.log("Response from Swiggy: ", res?.data);
	
	let orderArray = await res.data?.orders;
	
	console.log("orderArray creation done. Length is ", orderArray.length);

	if (res && (res.statusCode === 0) && orderArray?.length > 0) {
		offSetID = orderArray[orderArray.length - 1]?.order_id; //use .at(-1)?
		
		console.log(`New offset ID: ${offSetID}\n`);

		try {
			if (!existsSync(folderName)) {
			  mkdirSync(folderName);
			}
		  } catch (err) {
			console.error(err);
		  }
		writeFileSync(`${folderName}/orders_${offSetID}.json`, JSON.stringify(orderArray, null, 2));

		timeoutID = setTimeout(() =>{
			exportData(cookies);
		}, 5000);

	} else {
		clearTimeout(timeoutID);
		console.log(`Order fetch stopped`);
	}
}