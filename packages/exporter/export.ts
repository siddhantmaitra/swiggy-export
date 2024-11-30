import { constOpts, hitURL, SWIGGY_ORDER_URL } from './utils';

export async function exportNewData(
	lastOrderID: string | null,
	cookies: string,
	userAgent: string,
	offSetID: string = ''
) {
	const orders: ExtractedOrder[] = await exportData(cookies, userAgent, offSetID);

	if (lastOrderID) {
		const targetIndex = orders.findIndex((item: ExtractedOrder) => item.order_id === lastOrderID);

		if (targetIndex) {
			const precedingItems = orders.slice(0, targetIndex);
			return precedingItems;
		}
	}
	return orders;
}

async function exportData(cookies: string, userAgent: string, offSetID: string = '') {
	let options = structuredClone(constOpts);

	const headers = new Headers(options.headers);
	headers.set('Cookie', cookies);
	headers.set('Content-Type', 'application/json');
	headers.set('User-Agent', userAgent);

	options.headers = headers;

	let response = await hitURL(`${SWIGGY_ORDER_URL}${offSetID}`, options);
	let res = await response.json();

	let orderArray = (await res.data?.orders) || [];

	if (res.statusCode != 0) {
		throw new Error('Order fetch failed.', { cause: { code: res.statusCode, message: res.statusMessage } });
	}
	let processedOrders: ExtractedOrder[] = [];

	if (res && res.statusCode === 0 && orderArray?.length > 0) {
		offSetID = orderArray[orderArray.length - 1]?.order_id; //use .at(-1)?

		try {
			processedOrders = orderArray.map(extractOrderInfo);
		} catch (err: any) {
			throw new Error('Order object array creation failed', { cause: { code: 500, message: err.message } });
		}
	} else {
		console.log('Order fetch stopped.', { cause: { code: res.statusCode, message: res.statusMessage } });
	}
	return processedOrders;
}

function extractOrderInfo(order: any) {
	const renderingDetails = order.rendering_details.reduce((acc: any, detail: any) => {
		if (detail.type === 'display' || detail.type === 'summary') {
			acc[detail.key] = detail.value;
		}
		return acc;
	}, {});

	const extractedOrder: ExtractedOrder = {
		order_id: order.order_id,
		order_date: new Date(order.ordered_time_in_seconds * 1000).toISOString(),
		delivery_date: new Date(order.delivered_time_in_seconds * 1000).toISOString(),
		restaurant_id: order.restaurant_id,
		restaurant_name: order.restaurant_name,
		restaurant_city: order.restaurant_city_name,
		restaurant_cuisine: order.restaurant_cuisine,
		items: order.order_items.flatMap((item: OrderItem) => {
			let thing: Item = {
				name: item.name,
				price: item.base_price.toString(),
				quantity: item.quantity,
				variants: [],
				addons: []
			};
			if (item.variants.length > 0) {
				thing.variants = item.variants.map((variant) => ({
					name: variant.name,
					price: variant.price,
				}));
			}

			if (item.addons.length > 0) {
				thing.addons = item.addons.map((addon) => ({
					name: addon.name,
					price: addon.price,
				}));
			}

			return thing;
		}),
		coupon_applied: order.coupon_applied,
		order_status: order.order_status,
		is_long_distance: order.is_long_distance,
		on_time: order.on_time,
		rain_mode: order.rain_mode,
		is_veg: order.order_items.every((item: OrderItem) => item.is_veg === '1'),
		is_gourmet: order.is_gourmet,
		rating: {
			restaurant_rating: order.rating_meta.restaurant_rating.rating,
			delivery_rating: order.rating_meta.delivery_rating.rating,
		},
		item_total: renderingDetails.item_total,
		order_packing_charges: renderingDetails.order_packing_charges,
		platform_fees: renderingDetails.partial_platform_fees || renderingDetails.platform_fees,
		delivery_charges:
			renderingDetails.delivery_charges_swiggy_one === 'FREE' ? '0' : renderingDetails.delivery_charges_swiggy_one,
		discount_applied: renderingDetails.discount_applied_coupon || renderingDetails.discount_applied,
		total_taxes: renderingDetails.total_taxes,
		order_total: renderingDetails.order_total_string,
		// paymentMethod: order.paymentTransactions[0].paymentMethod,
		// paymentGateway: order.paymentTransactions[0].paymentGateway // this got removed :(
	};

	return extractedOrder;
}
