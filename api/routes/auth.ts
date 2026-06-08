import { Router, type Request, type Response } from 'express';
import { AuthService } from '../services/AuthService.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const result = await AuthService.login(req.body);
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json(result);
});

router.post('/send-sms', async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.body;
  if (!phone) {
    res.status(400).json({ error: '请输入手机号' });
    return;
  }
  const result = await AuthService.sendSms(phone);
  res.json(result);
});

router.post('/logout', authMiddleware(), async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: '登出成功' });
});

router.get('/me', authMiddleware(), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: '未登录' });
    return;
  }
  const user = await AuthService.getCurrentUser(req.user.id);
  if (!user) {
    res.status(404).json({ error: '用户不存在' });
    return;
  }
  res.json(user);
});

export default router;
