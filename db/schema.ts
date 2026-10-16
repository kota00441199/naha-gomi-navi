import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
// 日付とAPI試行回数だけを保存。写真・補足・回答は保存しない。
export const aiDailyUsage = sqliteTable("ai_daily_usage", {
  day: text("day").primaryKey(),
  used: integer("used").notNull(),
});
