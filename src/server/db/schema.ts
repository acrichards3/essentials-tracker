import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `essentials-tracker_${name}`,
);

export const posts = createTable(
  "post",
  (d) => ({
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

// Essentials table - stores the items being tracked
export const essentials = createTable(
  "essential",
  (d) => ({
    category: d.varchar({ length: 100 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    icon: d.varchar({ length: 10 }).notNull().default("📦"),
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }).notNull(),
    unit: d.varchar({ length: 50 }).notNull(), // e.g., "per gallon", "per dozen", "per pound"
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("essential_name_idx").on(t.name),
    index("essential_category_idx").on(t.category),
  ],
);

// Price entries table - stores historical price data
export const priceEntries = createTable(
  "price_entry",
  (d) => ({
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    essentialId: d
      .integer()
      .notNull()
      .references(() => essentials.id, { onDelete: "cascade" }),
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    location: d.varchar({ length: 256 }), // optional: where the price was observed
    notes: d.text(), // optional: any additional notes
    price: d.numeric({ precision: 10, scale: 2 }).notNull(), // stores price as decimal
  }),
  (t) => [
    index("price_entry_essential_idx").on(t.essentialId),
    index("price_entry_created_at_idx").on(t.createdAt),
  ],
);

// Relations for essentials
export const essentialsRelations = relations(essentials, ({ many }) => ({
  priceEntries: many(priceEntries),
}));

// Relations for price entries
export const priceEntriesRelations = relations(priceEntries, ({ one }) => ({
  essential: one(essentials, {
    fields: [priceEntries.essentialId],
    references: [essentials.id],
  }),
}));

export const users = createTable("user", (d) => ({
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  image: d.varchar({ length: 255 }),
  name: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    access_token: d.text(),
    expires_at: d.integer(),
    id_token: d.text(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    scope: d.varchar({ length: 255 }),
    session_state: d.varchar({ length: 255 }),
    token_type: d.varchar({ length: 255 }),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);
