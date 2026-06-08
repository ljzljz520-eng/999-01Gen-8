import { Router, type Response } from 'express';
import { OrderService } from '../services/OrderService.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware(['parent', 'admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: '未登录' });
    return;
  }
  const result = await OrderService.createOrder(req.user.id, req.body);
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(201).json(result);
});

router.get('/', authMiddleware(), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: '未登录' });
    return;
  }
  const orders = await OrderService.getOrderList(req.user.id, req.user.role);
  res.json(orders);
});

router.get('/:id', authMiddleware(), async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const order = await OrderService.getOrderById(id);
  if (!order) {
    res.status(404).json({ error: '订单不存在' });
    return;
  }
  res.json(order);
});

router.get('/pickup/:code', authMiddleware(['distributor', 'admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { code } = req.params;
  const order = await OrderService.getOrderByPickupCode(code);
  if (!order) {
    res.status(404).json({ error: '订单不存在' });
    return;
  }
  res.json(order);
});

router.put('/:id/verify', authMiddleware(['distributor', 'admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: '未登录' });
    return;
  }
  const id = parseInt(req.params.id);
  const result = await OrderService.verifyOrder(id, req.user, req.body);
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json(result);
});

router.put('/:id/exchange', authMiddleware(['distributor', 'admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: '未登录' });
    return;
  }
  const id = parseInt(req.params.id);
  const { newSize } = req.body;
  const result = await OrderService.exchangeOrder(id, newSize, req.user);
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json(result);
});

export default router;
