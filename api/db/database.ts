import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { User, Class, Product, Order, ExceptionRecord } from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface Database {
  users: User[];
  classes: Class[];
  products: Product[];
  orders: Order[];
  exceptions: ExceptionRecord[];
  nextIds: {
    users: number;
    classes: number;
    products: number;
    orders: number;
    exceptions: number;
  };
}

const initialData: Database = {
  users: [
    { id: 1, role: 'admin', name: '系统管理员', phone: '13800000000', password: 'admin123', createdAt: '2024-01-01 00:00:00' },
    { id: 2, role: 'distributor', name: '张发放', phone: '13800000001', password: '123456', createdAt: '2024-01-01 00:00:00' },
    { id: 3, role: 'distributor', name: '李发放', phone: '13800000002', password: '123456', createdAt: '2024-01-01 00:00:00' },
    { id: 4, role: 'teacher', name: '王老师', phone: '13800000003', password: '123456', classId: 1, className: '一年级1班', createdAt: '2024-01-01 00:00:00' },
    { id: 5, role: 'teacher', name: '赵老师', phone: '13800000004', password: '123456', classId: 2, className: '一年级2班', createdAt: '2024-01-01 00:00:00' },
    { id: 6, role: 'finance', name: '刘财务', phone: '13800000005', password: '123456', createdAt: '2024-01-01 00:00:00' },
    { id: 7, role: 'parent', name: '陈家长', phone: '13800000006', classId: 1, className: '一年级1班', createdAt: '2024-01-01 00:00:00' },
    { id: 8, role: 'parent', name: '周家长', phone: '13800000007', classId: 1, className: '一年级1班', createdAt: '2024-01-01 00:00:00' },
    { id: 9, role: 'parent', name: '吴家长', phone: '13800000008', classId: 2, className: '一年级2班', createdAt: '2024-01-01 00:00:00' },
    { id: 10, role: 'parent', name: '郑家长', phone: '13800000009', classId: 2, className: '一年级2班', createdAt: '2024-01-01 00:00:00' },
  ],
  classes: [
    { id: 1, name: '一年级1班', grade: 1, teacherId: 4, studentCount: 45 },
    { id: 2, name: '一年级2班', grade: 1, teacherId: 5, studentCount: 42 },
    { id: 3, name: '二年级1班', grade: 2, studentCount: 48 },
    { id: 4, name: '二年级2班', grade: 2, studentCount: 46 },
    { id: 5, name: '三年级1班', grade: 3, studentCount: 50 },
  ],
  products: [
    { id: 1, name: '夏季校服套装', description: '短袖上衣+短裤，透气舒适', price: 180.00, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=summer%20school%20uniform%20set%20tshirt%20shorts%20blue%20white&image_size=square', sizes: ['110', '120', '130', '140', '150', '160', '170'], category: 'summer' },
    { id: 2, name: '冬季校服套装', description: '长袖上衣+长裤，保暖加厚', price: 280.00, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=winter%20school%20uniform%20set%20jacket%20pants%20dark%20blue&image_size=square', sizes: ['110', '120', '130', '140', '150', '160', '170'], category: 'winter' },
    { id: 3, name: '运动校服套装', description: '运动上衣+运动裤，轻便舒适', price: 220.00, image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sport%20school%20uniform%20set%20jersey%20pants%20athletic&image_size=square', sizes: ['110', '120', '130', '140', '150', '160', '170'], category: 'sport' },
  ],
  orders: [
    { id: 1, orderNo: '202406010001', pickupCode: 'XF000001', parentId: 7, parentName: '陈家长', studentName: '小明', classId: 1, className: '一年级1班', productId: 1, productName: '夏季校服套装', size: '130', quantity: 2, amount: 360.00, status: 'paid', createdAt: '2024-06-01 10:00:00', updatedAt: '2024-06-01 10:00:00' },
    { id: 2, orderNo: '202406010002', pickupCode: 'XF000002', parentId: 7, parentName: '陈家长', studentName: '小明', classId: 1, className: '一年级1班', productId: 2, productName: '冬季校服套装', size: '130', quantity: 1, amount: 280.00, status: 'distributed', createdAt: '2024-06-01 10:05:00', updatedAt: '2024-06-02 14:30:00', distributedAt: '2024-06-02 14:30:00', distributorId: 2 },
    { id: 3, orderNo: '202406010003', pickupCode: 'XF000003', parentId: 8, parentName: '周家长', studentName: '小红', classId: 1, className: '一年级1班', productId: 1, productName: '夏季校服套装', size: '120', quantity: 1, amount: 180.00, status: 'paid', createdAt: '2024-06-01 11:00:00', updatedAt: '2024-06-01 11:00:00' },
    { id: 4, orderNo: '202406010004', pickupCode: 'XF000004', parentId: 8, parentName: '周家长', studentName: '小红', classId: 1, className: '一年级1班', productId: 3, productName: '运动校服套装', size: '120', quantity: 1, amount: 220.00, status: 'pending', createdAt: '2024-06-01 11:05:00', updatedAt: '2024-06-01 11:05:00' },
    { id: 5, orderNo: '202406010005', pickupCode: 'XF000005', parentId: 9, parentName: '吴家长', studentName: '小刚', classId: 2, className: '一年级2班', productId: 1, productName: '夏季校服套装', size: '140', quantity: 2, amount: 360.00, status: 'distributed', createdAt: '2024-06-01 12:00:00', updatedAt: '2024-06-02 15:00:00', distributedAt: '2024-06-02 15:00:00', distributorId: 3 },
    { id: 6, orderNo: '202406010006', pickupCode: 'XF000006', parentId: 10, parentName: '郑家长', studentName: '小美', classId: 2, className: '一年级2班', productId: 2, productName: '冬季校服套装', size: '110', quantity: 1, amount: 280.00, status: 'paid', createdAt: '2024-06-01 13:00:00', updatedAt: '2024-06-01 13:00:00' },
  ],
  exceptions: [],
  nextIds: {
    users: 11,
    classes: 6,
    products: 4,
    orders: 7,
    exceptions: 1,
  },
};

let db: Database;

function loadDatabase(): Database {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load database, using initial data:', e);
      return JSON.parse(JSON.stringify(initialData));
    }
  } else {
    const initial = JSON.parse(JSON.stringify(initialData));
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function saveDatabase() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

db = loadDatabase();

export function getDatabase() {
  return db;
}

export function persist() {
  saveDatabase();
}

export function resetDatabase() {
  db = JSON.parse(JSON.stringify(initialData));
  saveDatabase();
}

export function getNextId(table: keyof Database['nextIds']): number {
  return db.nextIds[table]++;
}
