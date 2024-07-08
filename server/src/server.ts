// server/src/server.ts

import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDatabase } from "./database";
import authRoutes from "./routes/authRoutes";
import userRoutes from './routes/userRoutes';
import genreRoutes from './routes/genreRoutes';
import artistProfileRoutes from './routes/artistProfileRoutes';
import jobPostingRoutes from './routes/jobPostingRoutes';

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/artist-profiles', artistProfileRoutes);
app.use('/api/job-postings', jobPostingRoutes);


const uri: string =
	process.env.MONGODB_URI || "mongodb://localhost:27017/soundtribe";
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

app.get("/health", (_req: Request, res: Response) => {
	res.status(200).send("Server is running");
});

startServer();
