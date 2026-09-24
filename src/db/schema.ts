import {
  pgTable, pgEnum, text, integer, boolean, timestamp, index, uniqueIndex, primaryKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date());

export const roleEnum = pgEnum("role", ["MEMBER", "ADMIN"]);
export const tierEnum = pgEnum("tier", ["BASIC", "PREMIUM"]);
export const productKindEnum = pgEnum("product_kind", ["EBOOK", "VIDEO", "PACKAGE", "ADDON", "QUOTE"]);
export const orderStatusEnum = pgEnum("order_status", ["PENDING", "PAID", "FAILED", "REFUNDED"]);
export const bookingStatusEnum = pgEnum("booking_status", ["REQUESTED", "CONFIRMED", "CANCELLED"]);

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("MEMBER"),
  /** Admin-set override; null means the tier follows active subscriptions. */
  tierOverride: tierEnum("tier_override"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}).enableRLS();

export const sessions = pgTable("sessions", {
  id: id(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
}, (t) => [index("sessions_user_idx").on(t.userId)]).enableRLS();

export const services = pgTable("services", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}).enableRLS();

export const products = pgTable("products", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  kind: productKindEnum("kind").notNull(),
  description: text("description").notNull().default(""),
  /** One feature per line. */
  features: text("features").notNull().default(""),
  /** Null for quote-only items. */
  priceCents: integer("price_cents"),
  priceNote: text("price_note").notNull().default(""),
  allowInstallments: boolean("allow_installments").notNull().default(false),
  /** Download or streaming link for ebooks and videos (only shown to people with access). */
  contentUrl: text("content_url").notNull().default(""),
  /** Premium (Education Pass) members can open this item without buying it. */
  includedWithPremium: boolean("included_with_premium").notNull().default(false),
  membersOnly: boolean("members_only").notNull().default(false),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}).enableRLS();

export const plans = pgTable("plans", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  monthlyPriceCents: integer("monthly_price_cents").notNull(),
  /** Number of monthly payments; null for an open-ended plan. */
  termMonths: integer("term_months"),
  grantsPremium: boolean("grants_premium").notNull().default(false),
  published: boolean("published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}).enableRLS();

export const orders = pgTable("orders", {
  id: id(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  status: orderStatusEnum("status").notNull().default("PENDING"),
  totalCents: integer("total_cents").notNull(),
  /** 1 for a single payment; 3, 6 or 9 for installments. */
  installments: integer("installments").notNull().default(1),
  stripeSessionId: text("stripe_session_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [index("orders_user_idx").on(t.userId)]).enableRLS();

export const orderItems = pgTable("order_items", {
  id: id(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  quantity: integer("quantity").notNull().default(1),
}, (t) => [index("order_items_order_idx").on(t.orderId)]).enableRLS();

export const subscriptions = pgTable("subscriptions", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull().references(() => plans.id, { onDelete: "restrict" }),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  status: text("status").notNull(),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAt: timestamp("cancel_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [index("subscriptions_user_idx").on(t.userId)]).enableRLS();

export const bookings = pgTable("bookings", {
  id: id(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  serviceId: text("service_id").references(() => services.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  inquiry: text("inquiry").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  durationMin: integer("duration_min").notNull().default(30),
  status: bookingStatusEnum("status").notNull().default("REQUESTED"),
  calendarEventId: text("calendar_event_id"),
  createdAt: createdAt(),
}, (t) => [
  index("bookings_starts_idx").on(t.startsAt),
  // One active booking per time slot; cancelled bookings free the slot.
  uniqueIndex("bookings_active_slot_uq").on(t.startsAt).where(sql`${t.status} <> 'CANCELLED'`),
]).enableRLS();

export const contactMessages = pgTable("contact_messages", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  message: text("message").notNull(),
  handled: boolean("handled").notNull().default(false),
  createdAt: createdAt(),
}).enableRLS();

/** Editable copy blocks addressed by key, e.g. "home.tagline". */
export const contentBlocks = pgTable("content_blocks", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  body: text("body").notNull(),
  updatedAt: updatedAt(),
}).enableRLS();

export const teamMembers = pgTable("team_members", {
  id: id(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}).enableRLS();

/** Stripe webhook events already processed, so retries are idempotent. */
export const processedEvents = pgTable("processed_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  createdAt: createdAt(),
}).enableRLS();

/** Simple fixed-window rate limiting shared across server instances. */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").notNull(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  count: integer("count").notNull().default(0),
}, (t) => [primaryKey({ columns: [t.key, t.windowStart] })]).enableRLS();

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions), orders: many(orders), subscriptions: many(subscriptions), bookings: many(bookings),
}));
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }), items: many(orderItems),
}));
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  plan: one(plans, { fields: [subscriptions.planId], references: [plans.id] }),
}));
export const bookingsRelations = relations(bookings, ({ one }) => ({
  service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
