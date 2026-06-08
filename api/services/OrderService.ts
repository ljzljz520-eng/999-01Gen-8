import { OrderRepository, ProductRepository, UserRepository, ClassRepository } from '../db/repositories.js';
import type { Order, CreateOrderRequest, VerifyOrderRequest, User } from '../../shared/types.js';

function generateOrderNo(): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString() + 
    (now.getMonth() + 1).toString().padStart(2, '0') + 
    now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${dateStr}${random}`;
}

function generatePickupCode(): string {
  const orders = OrderRepository.findAll();
  const maxNum = orders.reduce((max, o) => {
    const num = parseInt(o.pickupCode.replace('XF', ''));
    return num > max ? num : max;
  }, 0);
  return `XF${(maxNum + 1).toString().padStart(6, '0')}`;
}

export const OrderService = {
  async createOrder(userId: number, request: CreateOrderRequest): Promise<Order | { error: string }> {
    const user = UserRepository.findById(userId);
    if (!user) {
      return { error: '用户不存在' };
    }

    const product = ProductRepository.findById(request.productId);
    if (!product) {
      return { error: '商品不存在' };
    }

    if (!product.sizes.includes(request.size)) {
      return { error: '所选尺码不存在' };
    }

    const cls = ClassRepository.findById(request.classId);
    if (!cls) {
      return { error: '班级不存在' };
    }

    const orderNo = generateOrderNo();
    const pickupCode = generatePickupCode();
    const amount = product.price * request.quantity;

    const order = OrderRepository.create({
      orderNo,
      pickupCode,
      parentId: userId,
      parentName: user.name,
      studentName: request.studentName,
      classId: request.classId,
      className: cls.name,
      productId: product.id,
      productName: product.name,
      size: request.size,
      quantity: request.quantity,
      amount,
      status: 'paid',
    });

    return order;
  },

  async getOrderList(userId: number, userRole: string): Promise<Order[]> {
    if (userRole === 'parent') {
      return OrderRepository.findByParent(userId);
    }
    return OrderRepository.findAll();
  },

  async getOrderById(id: number): Promise<Order | undefined> {
    return OrderRepository.findById(id);
  },

  async getOrderByPickupCode(code: string): Promise<Order | undefined> {
    return OrderRepository.findByPickupCode(code);
  },

  async verifyOrder(orderId: number, distributor: User, request: VerifyOrderRequest): Promise<Order | { error: string }> {
    const order = OrderRepository.findById(orderId);
    if (!order) {
      return { error: '订单不存在' };
    }

    if (order.status === 'distributed' || order.status === 'exchanged') {
      return { error: '订单已核销' };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updateData: Partial<Order> = {
      status: request.isExchange ? 'exchanged' : 'distributed',
      distributedAt: now,
      distributorId: distributor.id,
      remark: request.remark,
    };

    const updatedOrder = OrderRepository.update(orderId, updateData);
    if (!updatedOrder) {
      return { error: '更新失败' };
    }

    return updatedOrder;
  },

  async exchangeOrder(orderId: number, newSize: string, distributor: User): Promise<Order | { error: string }> {
    const order = OrderRepository.findById(orderId);
    if (!order) {
      return { error: '订单不存在' };
    }

    const product = ProductRepository.findById(order.productId);
    if (!product) {
      return { error: '商品不存在' };
    }

    if (!product.sizes.includes(newSize)) {
      return { error: '新尺码不存在' };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updatedOrder = OrderRepository.update(orderId, {
      size: newSize,
      status: 'exchanged',
      distributedAt: now,
      distributorId: distributor.id,
      remark: `原尺码: ${order.size} → 新尺码: ${newSize}`,
    });

    if (!updatedOrder) {
      return { error: '更新失败' };
    }

    return updatedOrder;
  },
};
