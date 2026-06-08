import { OrderRepository, ClassRepository, ProductRepository } from '../db/repositories.js';
import type { FinanceSummary, ReportData, ClassReport, CategoryReport } from '../../shared/types.js';

export const FinanceService = {
  async getSummary(): Promise<FinanceSummary> {
    const orders = OrderRepository.findAll();
    
    const totalAmount = orders.reduce((sum, o) => sum + o.amount, 0);
    const paidAmount = orders
      .filter(o => o.status !== 'pending' && o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.amount, 0);
    const pendingAmount = orders
      .filter(o => o.status === 'pending')
      .reduce((sum, o) => sum + o.amount, 0);
    const orderCount = orders.length;
    const averageAmount = orderCount > 0 ? Math.round((totalAmount / orderCount) * 100) / 100 : 0;
    const totalOrders = orders.length;
    const distributedOrders = orders.filter(o => o.status === 'distributed' || o.status === 'exchanged').length;
    const distributedAmount = orders
      .filter(o => o.status === 'distributed' || o.status === 'exchanged')
      .reduce((sum, o) => sum + o.amount, 0);

    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      orderCount,
      averageAmount,
      totalOrders,
      distributedOrders,
      distributedAmount,
    };
  },

  async getClassReport(): Promise<ClassReport[]> {
    const classes = ClassRepository.findAll();
    const report: ClassReport[] = [];

    for (const cls of classes) {
      const orders = OrderRepository.findByClass(cls.id);
      const totalOrders = orders.length;
      const distributedOrders = orders.filter(o => o.status === 'distributed' || o.status === 'exchanged').length;
      const totalAmount = orders.reduce((sum, o) => sum + o.amount, 0);
      const distributedAmount = orders
        .filter(o => o.status === 'distributed' || o.status === 'exchanged')
        .reduce((sum, o) => sum + o.amount, 0);
      
      if (totalOrders > 0) {
        report.push({
          classId: cls.id,
          className: cls.name,
          totalOrders,
          distributedOrders,
          totalAmount,
          distributedAmount,
        });
      }
    }

    return report.sort((a, b) => b.totalAmount - a.totalAmount);
  },

  async getCategoryReport(): Promise<CategoryReport[]> {
    const orders = OrderRepository.findAll();
    const products = ProductRepository.findAll();
    const productMap = new Map(products.map(p => [p.id, p]));
    const categoryMap = new Map<string, { orders: number; quantity: number; amount: number }>();

    const categoryNames: Record<string, string> = {
      summer: '夏季校服',
      winter: '冬季校服',
      sport: '运动校服',
    };

    for (const order of orders) {
      const product = productMap.get(order.productId);
      const category = product?.category || 'summer';
      const existing = categoryMap.get(category) || { orders: 0, quantity: 0, amount: 0 };
      categoryMap.set(category, {
        orders: existing.orders + 1,
        quantity: existing.quantity + order.quantity,
        amount: existing.amount + order.amount,
      });
    }

    const totalAmount = orders.reduce((sum, o) => sum + o.amount, 0);

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      categoryName: categoryNames[category] || category,
      totalOrders: data.orders,
      totalQuantity: data.quantity,
      totalAmount: data.amount,
      percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 10000) / 10000 : 0,
    }));
  },

  async getStatusReport(): Promise<ReportData[]> {
    const orders = OrderRepository.findAll();
    const statusMap = new Map<string, number>();

    const statusNames: Record<string, string> = {
      pending: '待支付',
      paid: '已支付待领取',
      distributed: '已发放',
      exchanged: '已换货',
      cancelled: '已取消',
    };

    for (const order of orders) {
      const existing = statusMap.get(order.status) || 0;
      statusMap.set(order.status, existing + 1);
    }

    return Array.from(statusMap.entries()).map(([status, count]) => ({
      name: statusNames[status] || status,
      value: count,
    }));
  },

  async getMonthlyReport(): Promise<ReportData[]> {
    const orders = OrderRepository.findAll();
    const monthMap = new Map<string, number>();

    for (const order of orders) {
      const month = order.createdAt.substring(0, 7);
      const existing = monthMap.get(month) || 0;
      monthMap.set(month, existing + order.amount);
    }

    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        name: month,
        value: amount,
      }));
  },

  async exportData() {
    const orders = OrderRepository.findAll();
    const classes = ClassRepository.findAll();
    const classMap = new Map(classes.map(c => [c.id, c.name]));

    const headers = ['订单号', '取货码', '家长姓名', '学生姓名', '班级', '商品名称', '尺码', '数量', '金额', '状态', '下单时间', '发放时间'];
    
    const rows = orders.map(order => [
      order.orderNo,
      order.pickupCode,
      order.parentName,
      order.studentName,
      order.className,
      order.productName,
      order.size,
      order.quantity.toString(),
      order.amount.toFixed(2),
      this.getStatusText(order.status),
      order.createdAt,
      order.distributedAt || '',
    ]);

    return { headers, rows, classMap };
  },

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      pending: '待支付',
      paid: '已支付待领取',
      distributed: '已发放',
      exchanged: '已换货',
      cancelled: '已取消',
    };
    return map[status] || status;
  },
};
