import { Router, type Response } from 'express';
import { TeacherService } from '../services/TeacherService.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/classes', authMiddleware(['teacher', 'admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: '未登录' });
    return;
  }
  const classes = await TeacherService.getTeacherClasses(req.user.id);
  res.json(classes);
});

router.get('/stats', authMiddleware(['teacher', 'admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: '未登录' });
    return;
  }
  const stats = await TeacherService.getTeacherStats(req.user.id);
  res.json(stats);
});

router.get('/class/:id/stats', authMiddleware(['teacher', 'admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const stats = await TeacherService.getClassStats(id);
  if ('error' in stats) {
    res.status(404).json({ error: stats.error });
    return;
  }
  res.json(stats);
});

router.get('/class/:id/uncollected', authMiddleware(['teacher', 'admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const orders = await TeacherService.getUncollectedOrders(id);
  if ('error' in orders) {
    res.status(404).json({ error: orders.error });
    return;
  }
  res.json(orders);
});

router.get('/class/:id/parents', authMiddleware(['teacher', 'admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const result = await TeacherService.getClassParents(id);
  if ('error' in result) {
    res.status(404).json({ error: result.error });
    return;
  }
  res.json(result);
});

export default router;
