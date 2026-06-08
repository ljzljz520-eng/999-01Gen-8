import { Router, type Request, type Response } from 'express';
import { FinanceService } from '../services/FinanceService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/summary', authMiddleware(['finance', 'admin']), async (req: Request, res: Response): Promise<void> => {
  const summary = await FinanceService.getSummary();
  res.json(summary);
});

router.get('/reports/class', authMiddleware(['finance', 'admin']), async (req: Request, res: Response): Promise<void> => {
  const report = await FinanceService.getClassReport();
  res.json(report);
});

router.get('/reports/category', authMiddleware(['finance', 'admin']), async (req: Request, res: Response): Promise<void> => {
  const report = await FinanceService.getCategoryReport();
  res.json(report);
});

router.get('/reports/status', authMiddleware(['finance', 'admin']), async (req: Request, res: Response): Promise<void> => {
  const report = await FinanceService.getStatusReport();
  res.json(report);
});

router.get('/reports/monthly', authMiddleware(['finance', 'admin']), async (req: Request, res: Response): Promise<void> => {
  const report = await FinanceService.getMonthlyReport();
  res.json(report);
});

router.get('/export', authMiddleware(['finance', 'admin']), async (req: Request, res: Response): Promise<void> => {
  const data = await FinanceService.exportData();
  res.json(data);
});

export default router;
