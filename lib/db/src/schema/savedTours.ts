import { jsonb, pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const savedToursTable = pgTable(
  "saved_tours",
  {
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    tourId: varchar("tour_id").notNull(),
    tourData: jsonb("tour_data").notNull(),
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.tourId] })]
);

export type SavedTour = typeof savedToursTable.$inferSelect;
export type InsertSavedTour = typeof savedToursTable.$inferInsert;
