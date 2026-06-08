export type UserRole = 'parent' | 'distributor' | 'teacher' | 'finance' | 'admin';

export type OrderStatus = 'pending' | 'paid' | 'distributed' | 'exchanged' | 'cancelled';

export type ExceptionType = 'out_of_stock' | 'wrong_size' | 'exchange';

export interface User {
  id: number;
  role: UserRole;
  name: string;
  phone: string;
  password?: string;
  classId?: number;
  className?: string;
  avatar?: string;
  createdAt: string;
}

export interface Class {
  id: number;
  name: string;
  grade: number;
  teacherId?: number;
  studentCount: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes: string[];
  category: 'summer' | 'winter' | 'sport';
}

export interface Order {
  id: number;
  orderNo: string;
  pickupCode: string;
  parentId: number;
  parentName: string;
  studentName: string;
  classId: number;
  className: string;
  productId: number;
  productName: string;
  size: string;
  quantity: number;
  amount: number;
  status: OrderStatus;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  distributedAt?: string;
  distributorId?: number;
}

export interface ExceptionRecord {
  id: number;
  orderId: number;
  type: ExceptionType;
  description: string;
  originalSize?: string;
  newSize?: string;
  handlerId: number;
  handlerName: string;
  status: 'pending' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  studentName: string;
  className: string;
  remark?: string;
}

export interface ClassStats {
  classId: number;
  className: string;
  totalOrders: number;
  distributedCount: number;
  pendingCount: number;
  uncollectedCount: number;
  rate: number;
}

export interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  distributed: number;
  pending: number;
}

export interface FinanceSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  orderCount: number;
  averageAmount: number;
  totalOrders: number;
  distributedOrders: number;
  distributedAmount: number;
}

export interface ClassReport {
  classId: number;
  className: string;
  totalOrders: number;
  distributedOrders: number;
  totalAmount: number;
  distributedAmount: number;
}

export interface CategoryReport {
  categoryName: string;
  totalOrders: number;
  totalQuantity: number;
  totalAmount: number;
  percentage: number;
}

export type CreateExceptionRequest = ExceptionRequest;

export interface ReportData {
  name: string;
  value: number;
  amount?: number;
}

export interface LoginRequest {
  role: UserRole;
  phone: string;
  password?: string;
  code?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateOrderRequest {
  productId: number;
  size: string;
  quantity: number;
  studentName: string;
  classId: number;
}

export interface VerifyOrderRequest {
  isExchange?: boolean;
  remark?: string;
}

export interface ExceptionRequest {
  orderId: number;
  type: ExceptionType;
  description: string;
  originalSize?: string;
  newSize?: string;
}
