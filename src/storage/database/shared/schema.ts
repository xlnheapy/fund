import { pgTable, serial, timestamp, varchar, numeric, index } from "drizzle-orm/pg-core"

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const fundTest = pgTable("fund_test", {
	id: serial("id").primaryKey(),
	fundName: varchar("fund_name", { length: 128 }).notNull(),
	fundCode: varchar("fund_code", { length: 20 }).notNull(),
	fundType: varchar("fund_type", { length: 32 }).notNull(),
	navDate: varchar("nav_date", { length: 16 }),
	nav: numeric("nav", { precision: 10, scale: 4 }),
	shouyi: numeric("shouyi", { precision: 8, scale: 4 }),
	fundUrl: varchar("fund_url", { length: 512 }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index("fund_test_code_idx").on(table.fundCode),
	index("fund_test_type_idx").on(table.fundType),
]);