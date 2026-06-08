import { Router, type Request, type Response } from 'express';
import { ExceptionService } from '../services/ExceptionService.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware(['distributor', 'admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: '未登录' });
    return;
  }
  const result = await ExceptionService.createException(req.body, req.user);
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(201).json(result);
});

router.get('/', authMiddleware(['distributor', 'teacher', 'finance', 'admin']), async (req: Request, res: Response): Promise<void> => {
  const { status } = req.query;
  const exceptions = await ExceptionService.getExceptionList(status as string);
  res.json(exceptions);
});

router.get('/stats', authMiddleware(['distributor', 'admin']), async (req: Request, res: Response): Promise<void> => {
  const stats = await ExceptionService.getStats();
  res.json(stats);
});

router.get('/:id', authMiddleware(['distributor', 'teacher', 'finance', 'admin']), async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const exception = await ExceptionService.getExceptionById(id);
  if (!exception) {
    res.status(404).json({ error: '记录不存在' });
    return;
  }
  res.json(exception);
});

router.get('/order/:orderId', authMiddleware(['distributor', 'teacher', 'finance', 'admin']), async (req: Request, res: Response): Promise<void> => {
  const orderId = parseInt(req.params.orderId);
  const exceptions = await ExceptionService.getExceptionsByOrder(orderId);
  res.json(exceptions);
});

router.put('/:id/resolve', authMiddleware(['distributor', 'admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: '未登录' });
    return;
  }
  const id = parseInt(req.params.id);
  const result = await ExceptionService.resolveException(id, req.user);
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json(result);
});

export default router;
