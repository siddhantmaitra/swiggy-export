import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const restaurants = sqliteTable('restaurants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  city: text('city').notNull(),
  cuisine: text('cuisine').notNull(),
});

export const orders = sqliteTable('orders', {
  orderId: text('order_id').primaryKey(),
  orderDate: integer('order_date').notNull(),
  deliveryDate: integer('delivery_date'),
  restaurantId: text('restaurant_id').references(() => restaurants.id),
  couponApplied: text('coupon_applied'),
  orderStatus: text('order_status').notNull(),
  isLongDistance: integer('is_long_distance').notNull(),
  onTime: integer('on_time').notNull(),
  rainMode: text('rain_mode').notNull(),
  isVeg: integer('is_veg').notNull(),
  isGourmet: integer('is_gourmet').notNull(),
  itemTotal: real('item_total').notNull(),
  orderPackingCharges: real('order_packing_charges').notNull(),
  platformFees: real('platform_fees').notNull(),
  deliveryCharges: text('delivery_charges').notNull(),
  discountApplied: real('discount_applied').notNull(),
  totalTaxes: real('total_taxes').notNull(),
  orderTotal: real('order_total').notNull(),
  paymentMethod: text('payment_method').notNull(),
  paymentGateway: text('payment_gateway').notNull(),
});

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey(),
  orderId: text('order_id').references(() => orders.orderId),
  name: text('name').notNull(),
  price: real('price').notNull(),
});

export const ratings = sqliteTable('ratings', {
  orderId: text('order_id').primaryKey().references(() => orders.orderId),
  restaurantRating: integer('restaurant_rating'),
  deliveryRating: integer('delivery_rating'),
});
