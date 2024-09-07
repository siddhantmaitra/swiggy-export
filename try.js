import { readFileSync, writeFileSync,} from 'fs';
import { Database } from "bun:sqlite";

const db = new Database(":memory:");

const rawData = readFileSync('singleorder.json');
const orders = JSON.parse(rawData);

function extractOrderInfo(order) {
  const renderingDetails = order.rendering_details.reduce((acc, detail) => {
    if (detail.type === 'display' || detail.type === 'summary') {
      acc[detail.key] = detail.value;
    }
    return acc;
  }, {});

  const extractedOrder = {
    order_id: order.order_id,
    order_date: new Date(order.ordered_time_in_seconds * 1000).toISOString(),
    delivery_date: new Date(order.delivered_time_in_seconds * 1000).toISOString(),
    restaurant_id: order.restaurant_id,
    restaurant_name: order.restaurant_name,
    restaurant_city: order.restaurant_city_name,
    restaurant_cuisine: order.restaurant_cuisine,
    items: order.order_items.flatMap(item => {
      if (item.has_variantv2) {
        return item.variants.map(variant => ({
          name: `${item.name} - ${variant.name}`,
          price: variant.price
        }));
      } else {
        return [{
          name: item.name,
          base_price: item.base_price
        }];
      }
    }),
    coupon_applied: order.coupon_applied,
    order_status: order.order_status,
    is_long_distance: order.is_long_distance,
    on_time: order.on_time,
    rain_mode: order.rain_mode,
    is_veg: order.order_items.every(item => item.is_veg === "1"),
    is_gourmet: order.is_gourmet,
    rating_meta: {
      restaurant_rating: order.rating_meta.restaurant_rating.rating,
      delivery_rating: order.rating_meta.delivery_rating.rating
    },
    item_total: renderingDetails.item_total,
    order_packing_charges: renderingDetails.order_packing_charges,
    partial_platform_fees: renderingDetails.partial_platform_fees,
    delivery_charges: renderingDetails.delivery_charges_swiggy_one,
    discount_applied: renderingDetails.discount_applied_coupon,
    total_taxes: renderingDetails.total_taxes,
    order_total_string: renderingDetails.order_total_string,
    paymentMethod: order.paymentTransactions[0].paymentMethod,
    paymentGateway: order.paymentTransactions[0].paymentGateway
  };

  return extractedOrder;
}

const processedOrders = orders.map(extractOrderInfo);

writeFileSync('processed_orders.json', JSON.stringify(processedOrders, null, 2));

console.log('Processed orders have been saved to processed_orders.json');