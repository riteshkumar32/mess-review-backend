import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - IIT KGP students only
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  hall: varchar("hall", { length: 10 }).notNull().default("RK"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Halls table - scalable for future halls
export const halls = pgTable("halls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hallCode: varchar("hall_code", { length: 10 }).notNull().unique(),
  hallName: text("hall_name").notNull(),
  isActive: integer("is_active").notNull().default(1),
});

// Reviews table - daily meal reviews
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  hallCode: varchar("hall_code", { length: 10 }).notNull(),
  reviewDate: date("review_date").notNull(),
  breakfastRating: integer("breakfast_rating"),
  breakfastComment: text("breakfast_comment"),
  lunchRating: integer("lunch_rating"),
  lunchComment: text("lunch_comment"),
  snacksRating: integer("snacks_rating"),
  snacksComment: text("snacks_comment"),
  dinnerRating: integer("dinner_rating"),
  dinnerComment: text("dinner_comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userDateUnique: sql`CREATE UNIQUE INDEX IF NOT EXISTS "reviews_user_date_unique" ON "reviews" ("user_id", "review_date")`,
}));

// Complaints table - anonymous complaints/suggestions
export const complaints = pgTable("complaints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  hallCode: varchar("hall_code", { length: 10 }).notNull(),
  mealType: varchar("meal_type", { length: 20 }).notNull(),
  category: varchar("category", { length: 20 }).notNull(),
  text: text("text").notNull(),
  complaintDate: date("complaint_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  complaints: many(complaints),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  user: one(users, {
    fields: [complaints.userId],
    references: [users.id],
  }),
}));

// Validation schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email().refine(
    (email) => email.endsWith("@iitkgp.ac.in"),
    { message: "Only IIT Kharagpur students are allowed (@iitkgp.ac.in)" }
  ),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  breakfastRating: z.number().min(1).max(5).optional().nullable(),
  lunchRating: z.number().min(1).max(5).optional().nullable(),
  snacksRating: z.number().min(1).max(5).optional().nullable(),
  dinnerRating: z.number().min(1).max(5).optional().nullable(),
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  mealType: z.enum(["Breakfast", "Lunch", "Snacks", "Dinner", "General"]),
  category: z.enum(["Hygiene", "Taste", "Quantity", "Behaviour", "Other"]),
  text: z.string().min(10, "Complaint must be at least 10 characters"),
});

export const insertHallSchema = createInsertSchema(halls).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Hall = typeof halls.$inferSelect;
export type InsertHall = z.infer<typeof insertHallSchema>;

// API response types
export type AuthResponse = {
  user: Omit<User, "password">;
  token: string;
};

export type DailyStats = {
  breakfast: number | null;
  lunch: number | null;
  snacks: number | null;
  dinner: number | null;
  totalReviews: number;
};

export type WeeklyStats = {
  date: string;
  breakfast: number | null;
  lunch: number | null;
  snacks: number | null;
  dinner: number | null;
};
