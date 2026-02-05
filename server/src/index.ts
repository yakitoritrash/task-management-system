import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes'; // <--- MAKE SURE THIS IS HERE

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes); // <--- AND THIS

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
