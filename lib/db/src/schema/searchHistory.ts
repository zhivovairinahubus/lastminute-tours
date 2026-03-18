import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const searchHistoryTable = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  departureCity: varchar("departure_city", { length: 200 }).notNull(),
  budget: integer("budget").notNull(),
  adults: integer("adults").notNull().default(2),
  searchedAt: timestamp("searched_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SearchHistory = typeof searchHistoryTable.$inferSelect;
export type InsertSearchHistory = typeof searchHistoryTable.$inferInsert;
