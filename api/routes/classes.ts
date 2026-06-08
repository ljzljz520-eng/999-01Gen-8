import { Router, type Request, type Response } from 'express';
import { ClassRepository } from '../db/repositories.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware(), async (req: Request, res: Response): Promise<void> => {
  const classes = ClassRepository.findAll();
  res.json(classes);
});

router.get('/:id', authMiddleware(), async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const cls = ClassRepository.findById(id);
  if (!cls) {
    res.status(404).json({ error: '班级不存在' });
    return;
  }
  res.json(cls);
});

export default router;
