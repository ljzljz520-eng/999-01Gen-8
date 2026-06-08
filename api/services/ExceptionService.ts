import { ExceptionRepository, OrderRepository, UserRepository } from '../db/repositories.js';
import type { ExceptionRecord, ExceptionRequest, User } from '../../shared/types.js';

export const ExceptionService = {
  async createException(request: ExceptionRequest, handler: User): Promise<ExceptionRecord | { error: string }> {
    const order = OrderRepository.findById(request.orderId);
    if (!order) {
      return { error: '订单不存在' };
    }

    const exception = ExceptionRepository.create({
      orderId: request.orderId,
      type: request.type,
      description: request.description,
      originalSize: request.originalSize || order.size,
      newSize: request.newSize,
      handlerId: handler.id,
      handlerName: handler.name,
      status: 'pending',
      studentName: order.studentName,
      className: order.className,
      remark: request.description,
    });

    return exception;
  },

  async getExceptionList(status?: string): Promise<ExceptionRecord[]> {
    if (status) {
      return ExceptionRepository.findByStatus(status as 'pending' | 'resolved');
    }
    return ExceptionRepository.findAll();
  },

  async getExceptionById(id: number): Promise<ExceptionRecord | undefined> {
    return ExceptionRepository.findById(id);
  },

  async getExceptionsByOrder(orderId: number): Promise<ExceptionRecord[]> {
    return ExceptionRepository.findByOrder(orderId);
  },

  async resolveException(id: number, resolver: User): Promise<ExceptionRecord | { error: string }> {
    const exception = ExceptionRepository.findById(id);
    if (!exception) {
      return { error: '异常记录不存在' };
    }

    if (exception.status === 'resolved') {
      return { error: '异常已处理' };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updated = ExceptionRepository.update(id, {
      status: 'resolved',
      resolvedAt: now,
    });

    if (!updated) {
      return { error: '更新失败' };
    }

    return updated;
  },

  async getStats() {
    const all = ExceptionRepository.findAll();
    const pending = all.filter(e => e.status === 'pending').length;
    const resolved = all.filter(e => e.status === 'resolved').length;
    const outOfStock = all.filter(e => e.type === 'out_of_stock').length;
    const wrongSize = all.filter(e => e.type === 'wrong_size').length;
    const exchange = all.filter(e => e.type === 'exchange').length;

    return {
      total: all.length,
      pending,
      resolved,
      outOfStock,
      wrongSize,
      exchange,
    };
  },
};
