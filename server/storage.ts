import { 
  users, halls, reviews, complaints,
  type User, type InsertUser, type Hall, type InsertHall,
  type Review, type InsertReview, type Complaint, type InsertComplaint,
  type DailyStats, type WeeklyStats
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Halls
  getHall(hallCode: string): Promise<Hall | undefined>;
  getAllHalls(): Promise<Hall[]>;
  createHall(hall: InsertHall): Promise<Hall>;
  
  // Reviews
  getReview(id: string): Promise<Review | undefined>;
  getReviewByUserAndDate(userId: string, date: string): Promise<Review | undefined>;
  getReviewsByHall(hallCode: string, limit?: number): Promise<Review[]>;
  getReviewsByUser(userId: string): Promise<Review[]>;
  createReview(userId: string, review: InsertReview): Promise<Review>;
  updateReview(id: string, review: Partial<InsertReview>): Promise<Review>;
  getDailyStats(hallCode: string, date: string): Promise<DailyStats>;
  getWeeklyStats(hallCode: string): Promise<WeeklyStats[]>;
  
  // Complaints
  createComplaint(userId: string, complaint: InsertComplaint): Promise<Complaint>;
  getComplaintsByHall(hallCode: string, limit?: number): Promise<Complaint[]>;
  getComplaintsByUser(userId: string): Promise<Complaint[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Halls
  async getHall(hallCode: string): Promise<Hall | undefined> {
    const [hall] = await db.select().from(halls).where(eq(halls.hallCode, hallCode));
    return hall || undefined;
  }

  async getAllHalls(): Promise<Hall[]> {
    return db.select().from(halls);
  }

  async createHall(insertHall: InsertHall): Promise<Hall> {
    const [hall] = await db.insert(halls).values(insertHall).returning();
    return hall;
  }

  // Reviews
  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }

  async getReviewByUserAndDate(userId: string, date: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews)
      .where(and(
        eq(reviews.userId, userId),
        eq(reviews.reviewDate, date)
      ));
    return review || undefined;
  }

  async getReviewsByHall(hallCode: string, limit: number = 10): Promise<Review[]> {
    return db.select().from(reviews)
      .where(eq(reviews.hallCode, hallCode))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return db.select().from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.reviewDate));
  }

  async createReview(userId: string, insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values({
      ...insertReview,
      userId,
    }).returning();
    return review;
  }

  async updateReview(id: string, updateData: Partial<InsertReview>): Promise<Review> {
    const [review] = await db.update(reviews)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return review;
  }

  async getDailyStats(hallCode: string, date: string): Promise<DailyStats> {
    const result = await db.select({
      breakfast: sql<number>`AVG(${reviews.breakfastRating})::float`,
      lunch: sql<number>`AVG(${reviews.lunchRating})::float`,
      snacks: sql<number>`AVG(${reviews.snacksRating})::float`,
      dinner: sql<number>`AVG(${reviews.dinnerRating})::float`,
      totalReviews: sql<number>`COUNT(*)::int`,
    }).from(reviews)
      .where(and(
        eq(reviews.hallCode, hallCode),
        eq(reviews.reviewDate, date)
      ));

    return result[0] || { breakfast: null, lunch: null, snacks: null, dinner: null, totalReviews: 0 };
  }

  async getWeeklyStats(hallCode: string): Promise<WeeklyStats[]> {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const result = await db.select({
      date: reviews.reviewDate,
      breakfast: sql<number>`AVG(${reviews.breakfastRating})::float`,
      lunch: sql<number>`AVG(${reviews.lunchRating})::float`,
      snacks: sql<number>`AVG(${reviews.snacksRating})::float`,
      dinner: sql<number>`AVG(${reviews.dinnerRating})::float`,
    }).from(reviews)
      .where(and(
        eq(reviews.hallCode, hallCode),
        gte(reviews.reviewDate, sevenDaysAgo.toISOString().split("T")[0]),
        lte(reviews.reviewDate, today.toISOString().split("T")[0])
      ))
      .groupBy(reviews.reviewDate)
      .orderBy(desc(reviews.reviewDate));

    return result;
  }

  // Complaints
  async createComplaint(userId: string, insertComplaint: InsertComplaint): Promise<Complaint> {
    const [complaint] = await db.insert(complaints).values({
      ...insertComplaint,
      userId,
    }).returning();
    return complaint;
  }

  async getComplaintsByHall(hallCode: string, limit: number = 10): Promise<Complaint[]> {
    return db.select().from(complaints)
      .where(eq(complaints.hallCode, hallCode))
      .orderBy(desc(complaints.createdAt))
      .limit(limit);
  }

  async getComplaintsByUser(userId: string): Promise<Complaint[]> {
    return db.select().from(complaints)
      .where(eq(complaints.userId, userId))
      .orderBy(desc(complaints.createdAt));
  }
}

export const storage = new DatabaseStorage();
