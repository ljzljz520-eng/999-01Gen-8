import { getDatabase, getNextId, persist } from './database.js';
import type { User, Class, Product, Order, ExceptionRecord, UserRole } from '../../shared/types.js';

export const UserRepository = {
  findAll(): User[] {
    return getDatabase().users.map(u => ({ ...u, password: undefined }));
  },

  findById(id: number): User | undefined {
    const user = getDatabase().users.find(u => u.id === id);
    return user ? { ...user, password: undefined } : undefined;
  },

  findByPhone(phone: string): User | undefined {
    return getDatabase().users.find(u => u.phone === phone);
  },

  findByPhoneAndPassword(phone: string, password: string): User | undefined {
    const user = getDatabase().users.find(u => u.phone === phone && u.password === password);
    return user ? { ...user, password: undefined } : undefined;
  },

  findByRole(role: UserRole): User[] {
    return getDatabase().users.filter(u => u.role === role).map(u => ({ ...u, password: undefined }));
  },

  findParentsByClass(classId: number): User[] {
    return getDatabase().users.filter(u => u.role === 'parent' && u.classId === classId).map(u => ({ ...u, password: undefined }));
  },

  create(user: Omit<User, 'id' | 'createdAt'>): User {
    const db = getDatabase();
    const id = getNextId('users');
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    db.users.push(newUser);
    persist();
    return { ...newUser, password: undefined };
  },

  update(id: number, data: Partial<User>): User | undefined {
    const db = getDatabase();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    db.users[index] = { ...db.users[index], ...data };
    persist();
    return { ...db.users[index], password: undefined };
  },
};

export const ClassRepository = {
  findAll(): Class[] {
    return [...getDatabase().classes];
  },

  findById(id: number): Class | undefined {
    return getDatabase().classes.find(c => c.id === id);
  },

  findByTeacher(teacherId: number): Class[] {
    return getDatabase().classes.filter(c => c.teacherId === teacherId);
  },

  findByGrade(grade: number): Class[] {
    return getDatabase().classes.filter(c => c.grade === grade);
  },
};

export const ProductRepository = {
  findAll(): Product[] {
    return [...getDatabase().products];
  },

  findById(id: number): Product | undefined {
    return getDatabase().products.find(p => p.id === id);
  },

  findByCategory(category: Product['category']): Product[] {
    return getDatabase().products.filter(p => p.category === category);
  },
};

export const OrderRepository = {
  findAll(): Order[] {
    return [...getDatabase().orders];
  },

  findById(id: number): Order | undefined {
    return getDatabase().orders.find(o => o.id === id);
  },

  findByPickupCode(code: string): Order | undefined {
    return getDatabase().orders.find(o => o.pickupCode === code);
  },

  findByParent(parentId: number): Order[] {
    return getDatabase().orders.filter(o => o.parentId === parentId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  findByClass(classId: number): Order[] {
    return getDatabase().orders.filter(o => o.classId === classId);
  },

  findByStatus(status: Order['status']): Order[] {
    return getDatabase().orders.filter(o => o.status === status);
  },

  findByClassAndStatus(classId: number, status: Order['status']): Order[] {
    return getDatabase().orders.filter(o => o.classId === classId && o.status === status);
  },

  findUncollectedByClass(classId: number): Order[] {
    return getDatabase().orders.filter(o => 
      o.classId === classId && o.status !== 'distributed' && o.status !== 'exchanged'
    );
  },

  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const db = getDatabase();
    const id = getNextId('orders');
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newOrder: Order = {
      ...order,
      id,
      createdAt: now,
      updatedAt: now,
    };
    db.orders.push(newOrder);
    persist();
    return newOrder;
  },

  update(id: number, data: Partial<Order>): Order | undefined {
    const db = getDatabase();
    const index = db.orders.findIndex(o => o.id === id);
    if (index === -1) return undefined;
    db.orders[index] = {
      ...db.orders[index],
      ...data,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    persist();
    return db.orders[index];
  },
};

export const ExceptionRepository = {
  findAll(): ExceptionRecord[] {
    return [...getDatabase().exceptions];
  },

  findById(id: number): ExceptionRecord | undefined {
    return getDatabase().exceptions.find(e => e.id === id);
  },

  findByOrder(orderId: number): ExceptionRecord[] {
    return getDatabase().exceptions.filter(e => e.orderId === orderId);
  },

  findByStatus(status: ExceptionRecord['status']): ExceptionRecord[] {
    return getDatabase().exceptions.filter(e => e.status === status);
  },

  create(exception: Omit<ExceptionRecord, 'id' | 'createdAt'>): ExceptionRecord {
    const db = getDatabase();
    const id = getNextId('exceptions');
    const newException: ExceptionRecord = {
      ...exception,
      id,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    db.exceptions.push(newException);
    persist();
    return newException;
  },

  update(id: number, data: Partial<ExceptionRecord>): ExceptionRecord | undefined {
    const db = getDatabase();
    const index = db.exceptions.findIndex(e => e.id === id);
    if (index === -1) return undefined;
    db.exceptions[index] = { ...db.exceptions[index], ...data };
    persist();
    return db.exceptions[index];
  },
};
