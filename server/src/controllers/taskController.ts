import { Request, Response } from 'express';
import prisma from '../prisma';
import { z } from 'zod';

// 1. Define a custom interface directly here
interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

export const getTasks = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    
    // 1. Extract Query Parameters
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5; // Default to 5 tasks per page
    const skip = (page - 1) * limit;
    
    const status = req.query.status as string; // e.g., "PENDING"
    const search = req.query.search as string; // e.g., "front"

    // 2. Build the "Where" clause dynamically
    const whereClause: any = { userId };

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.title = {
        contains: search,
        // mode: 'insensitive' // Uncomment if you switch to PostgreSQL later
      };
    }

    // 3. Fetch Data + Total Count (for pagination)
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where: whereClause }),
    ]);

    // 4. Return Data with Pagination Info
    res.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
export const createTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, description } = taskSchema.parse(req.body);
    const userId = (req as AuthRequest).user?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId,
        status: 'PENDING',
      },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { title, description, status } = req.body;
    const userId = (req as AuthRequest).user?.userId;

    const existingTask = await prisma.task.findFirst({ where: { id, userId } });
    if (!existingTask) return res.status(404).json({ error: 'Task not found' });

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { title, description, status },
    });
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: 'Update failed' });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const userId = (req as AuthRequest).user?.userId;

    const existingTask = await prisma.task.findFirst({ where: { id, userId } });
    if (!existingTask) return res.status(404).json({ error: 'Task not found' });

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
};
