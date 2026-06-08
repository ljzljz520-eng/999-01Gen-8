import { ClassRepository, OrderRepository, UserRepository } from '../db/repositories.js';
import type { Class, ClassStats, Order, TeacherStats } from '../../shared/types.js';

export const TeacherService = {
  async getTeacherClasses(teacherId: number): Promise<Class[]> {
    return ClassRepository.findByTeacher(teacherId);
  },

  async getTeacherStats(teacherId: number): Promise<TeacherStats> {
    const classes = ClassRepository.findByTeacher(teacherId);
    const totalClasses = classes.length;
    let totalStudents = 0;
    let distributed = 0;
    let pending = 0;

    for (const cls of classes) {
      totalStudents += cls.studentCount;
      const orders = OrderRepository.findByClass(cls.id);
      distributed += orders.filter(o => o.status === 'distributed' || o.status === 'exchanged').length;
      pending += orders.filter(o => o.status === 'pending' || o.status === 'paid').length;
    }

    return {
      totalClasses,
      totalStudents,
      distributed,
      pending,
    };
  },

  async getClassStats(classId: number): Promise<ClassStats | { error: string }> {
    const cls = ClassRepository.findById(classId);
    if (!cls) {
      return { error: '班级不存在' };
    }

    const orders = OrderRepository.findByClass(classId);
    const totalOrders = orders.length;
    const distributedCount = orders.filter(o => o.status === 'distributed' || o.status === 'exchanged').length;
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const uncollectedCount = totalOrders - distributedCount;
    const rate = totalOrders > 0 ? Math.round((distributedCount / totalOrders) * 100) : 0;

    return {
      classId: cls.id,
      className: cls.name,
      totalOrders,
      distributedCount,
      pendingCount,
      uncollectedCount,
      rate,
    };
  },

  async getUncollectedOrders(classId: number): Promise<Order[] | { error: string }> {
    const cls = ClassRepository.findById(classId);
    if (!cls) {
      return { error: '班级不存在' };
    }

    return OrderRepository.findUncollectedByClass(classId);
  },

  async getAllClassStats(teacherId: number): Promise<ClassStats[]> {
    const classes = ClassRepository.findByTeacher(teacherId);
    const stats: ClassStats[] = [];

    for (const cls of classes) {
      const classStats = await this.getClassStats(cls.id);
      if (!('error' in classStats)) {
        stats.push(classStats);
      }
    }

    return stats;
  },

  async getClassParents(classId: number) {
    const cls = ClassRepository.findById(classId);
    if (!cls) {
      return { error: '班级不存在' };
    }

    const parents = UserRepository.findParentsByClass(classId);
    const orders = OrderRepository.findByClass(classId);

    return parents.map(parent => {
      const parentOrders = orders.filter(o => o.parentId === parent.id);
      return {
        parent,
        orders: parentOrders,
        studentNames: [...new Set(parentOrders.map(o => o.studentName))],
      };
    });
  },
};
