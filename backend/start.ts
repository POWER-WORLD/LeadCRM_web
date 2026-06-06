import express, { Express } from 'express';
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDB from "./db/connection";
import leadRoutes from "./routes/leadRoutes";
import { errorHandler, notFound } from "./middleware/errorHandler";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
app.set("trust proxy", 1);

// Connect to MongoDB
connectDB();

// CORS configuration - FIXED: Added your specific frontend URL fallback
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://lead-crm-web.vercel.app", // Corrected fallback domain
  "http://localhost:3000"          
].filter(Boolean) as string[];      

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight requests globally
app.options('*', cors()); 

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", ...allowedOrigins],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later",
  },
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/leads", leadRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// ONLY listen if running locally, Vercel will handle production routing automatically
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running locally on port ${PORT}`);
  });
}

export default app;
