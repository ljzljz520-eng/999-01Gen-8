import { Router, type Request, type Response } from 'express';
import { ProductRepository } from '../db/repositories.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { category } = req.query;
  if (category && typeof category === 'string') {
    const products = ProductRepository.findByCategory(category as 'summer' | 'winter' | 'sport');
    res.json(products);
    return;
  }
  const products = ProductRepository.findAll();
  res.json(products);
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const product = ProductRepository.findById(id);
  if (!product) {
    res.status(404).json({ error: '商品不存在' });
    return;
  }
  res.json(product);
});

export default router;
