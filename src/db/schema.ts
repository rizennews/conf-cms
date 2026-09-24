import { pgTable, text, timestamp, boolean, integer, serial } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('emailVerified').notNull(),
	image: text('image'),
	createdAt: timestamp('createdAt').notNull(),
	updatedAt: timestamp('updatedAt').notNull(),
	// CMS Custom Fields
	role: text('role').notNull().default('branch_head'), // super_admin, admin, data_team, branch_head
	branchId: text('branchId').references(() => branches.id), // Which branch the leader belongs to
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp('expiresAt').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('createdAt').notNull(),
	updatedAt: timestamp('updatedAt').notNull(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	userId: text('userId').notNull().references(()=> user.id)
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	userId: text('userId').notNull().references(()=> user.id),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	idToken: text('idToken'),
	accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
	refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('createdAt').notNull(),
	updatedAt: timestamp('updatedAt').notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expiresAt').notNull(),
	createdAt: timestamp('createdAt'),
	updatedAt: timestamp('updatedAt')
});

// ----------------------------------------------------
// CMS Specific Tables
// ----------------------------------------------------

export const branches = pgTable("branches", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  deadline: timestamp("deadline"),
  isActive: boolean("is_active").default(true).notNull(),
  isMainEvent: boolean("is_main_event").default(false).notNull(),
  customFields: text("custom_fields"), // Storing JSON string for custom form fields e.g. [{label: "T-Shirt Size", type: "text"}]
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  fullName: text("full_name"),
  email: text("email"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  ageRange: text("age_range"),
  isMember: boolean("is_member"),
  isFirstTime: boolean("is_first_time"),
  branchId: text("branch_id").notNull().references(() => branches.id),
  heardFrom: text("heard_from"),
  invitees: text("invitees"),
  customData: text("custom_data"), // JSON string of the user's answers to the customFields
  
  // Link to a specific dynamic event
  eventId: text("event_id").references(() => events.id),
  // New check-in status
  status: text("status").notNull().default("registered"), // 'registered' | 'checked-in'
});
