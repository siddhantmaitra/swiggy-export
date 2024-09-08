import { sqliteTable, text} from "drizzle-orm/sqlite-core";

export const restaurants = sqliteTable("restaurants", {
  resID: text("restaurant_id").primaryKey(),
  resName: text("restaurant_name"),
  resCity: text("restaurant_city"),
});