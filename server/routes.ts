import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { 
  insertUserSchema, loginSchema, insertReviewSchema, insertComplaintSchema,
  type AuthResponse 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const JWT_SECRET = process.env.SESSION_SECRET;
if (!JWT_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

// Middleware to verify JWT token
interface AuthRequest extends Request {
  user?: { id: string; email: string; hall: string };
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; hall: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Rate limiter for complaints (per IP)
const complaintLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 complaints per hour per IP
  message: { message: "Too many complaints. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 min
  message: { message: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/signup", authLimiter, async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if email domain is valid
      if (!data.email.endsWith("@iitkgp.ac.in")) {
        return res.status(400).json({ 
          message: "Only IIT Kharagpur students are allowed (@iitkgp.ac.in)" 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await storage.createUser({
        ...data,
        password: passwordHash,
      });

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, hall: user.hall },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const response: AuthResponse = {
        user: { id: user.id, name: user.name, email: user.email, hall: user.hall, createdAt: user.createdAt },
        token,
      };

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      // Find user
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Verify password
      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, hall: user.hall },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const response: AuthResponse = {
        user: { id: user.id, name: user.name, email: user.email, hall: user.hall, createdAt: user.createdAt },
        token,
      };

      res.json(response);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reviews routes
  app.get("/api/reviews/today", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const today = new Date().toISOString().split("T")[0];
      
      const review = await storage.getReviewByUserAndDate(userId, today);
      if (!review) {
        return res.status(404).json({ message: "No review found for today" });
      }
      
      res.json(review);
    } catch (error) {
      console.error("Get today's review error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/my", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const myReviews = await storage.getReviewsByUser(userId);
      res.json(myReviews);
    } catch (error) {
      console.error("Get my reviews error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/reviews", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const data = insertReviewSchema.parse(req.body);
      
      // Check if user already has a review for this date
      const existingReview = await storage.getReviewByUserAndDate(userId, data.reviewDate);
      if (existingReview) {
        return res.status(400).json({ message: "You've already submitted a review for this date" });
      }

      const review = await storage.createReview(userId, data);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Create review error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/reviews/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const reviewId = req.params.id;
      
      // Check if review exists and belongs to user
      const existingReview = await storage.getReview(reviewId);
      if (!existingReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      if (existingReview.userId !== userId) {
        return res.status(403).json({ message: "You can only edit your own reviews" });
      }
      
      // Check if it's still the same day
      const today = new Date().toISOString().split("T")[0];
      if (existingReview.reviewDate !== today) {
        return res.status(400).json({ message: "You can only edit today's review" });
      }

      const data = insertReviewSchema.partial().parse(req.body);
      const review = await storage.updateReview(reviewId, data);
      res.json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Update review error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Complaints routes
  app.post("/api/complaints", authMiddleware, complaintLimiter, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const data = insertComplaintSchema.parse(req.body);
      
      const complaint = await storage.createComplaint(userId, data);
      res.status(201).json(complaint);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Create complaint error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Hall routes
  app.get("/api/halls", authMiddleware, async (req, res) => {
    try {
      const allHalls = await storage.getAllHalls();
      res.json(allHalls);
    } catch (error) {
      console.error("Get halls error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/halls/:code/stats/today", authMiddleware, async (req, res) => {
    try {
      const hallCode = req.params.code;
      const today = new Date().toISOString().split("T")[0];
      
      const stats = await storage.getDailyStats(hallCode, today);
      res.json(stats);
    } catch (error) {
      console.error("Get daily stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/halls/:code/stats/weekly", authMiddleware, async (req, res) => {
    try {
      const hallCode = req.params.code;
      const stats = await storage.getWeeklyStats(hallCode);
      res.json(stats);
    } catch (error) {
      console.error("Get weekly stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/halls/:code/reviews/recent", authMiddleware, async (req, res) => {
    try {
      const hallCode = req.params.code;
      const reviews = await storage.getReviewsByHall(hallCode, 10);
      res.json(reviews);
    } catch (error) {
      console.error("Get recent reviews error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/halls/:code/complaints/recent", authMiddleware, async (req, res) => {
    try {
      const hallCode = req.params.code;
      const complaints = await storage.getComplaintsByHall(hallCode, 10);
      res.json(complaints);
    } catch (error) {
      console.error("Get recent complaints error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
