import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Apply the "Guard" middleware to all routes here
// This ensures only logged-in users can access these endpoints
router.use(authenticateToken);

router.get('/', getTasks);          // GET /tasks
router.post('/', createTask);       // POST /tasks
router.patch('/:id', updateTask);   // PATCH /tasks/:id
router.delete('/:id', deleteTask);  // DELETE /tasks/:id

export default router;
