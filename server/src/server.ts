// server/src/server.ts

import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDatabase } from "./database";
import routes from "./routes/indexRoutes";
import { handleError } from "./utils/errorHandler";
import helmet from "helmet";
import morgan from "morgan";
import { apiLimiter } from './middleware/rateLimiter';


dotenv.config();

const app: Express = express();
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://soundtribe.vercel.app',
  'https://soundtribe-aq4rius-projects.vercel.app',
  'https://soundtribe-git-main-aq4rius-projects.vercel.app',
  'https://soundtribe.onrender.com'
];



app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use('/api/', apiLimiter);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use('/api', routes);

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).send("Server is running");
});


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  handleError(err, res);
});

const uri: string = process.env.MONGODB_URI || "mongodb://localhost:27017/soundtribe";
const port: number = parseInt(process.env.PORT || "3000", 10);

async function startServer(): Promise<void> {
  try {
    await connectToDatabase(uri);
    app.listen(port, () => {
      console.log(`Server is running on PORT: ${port}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
}

startServer();