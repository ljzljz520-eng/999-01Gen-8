import { UserRepository, ClassRepository } from '../db/repositories.js';
import { generateToken } from '../middleware/auth.js';
import type { LoginRequest, LoginResponse, User } from '../../shared/types.js';

export const AuthService = {
  async login(request: LoginRequest): Promise<LoginResponse | { error: string }> {
    const { role, phone, password, code } = request;

    const user = UserRepository.findByPhone(phone);
    if (!user) {
      return { error: '用户不存在' };
    }

    if (user.role !== role) {
      return { error: '角色不匹配' };
    }

    if (role === 'parent') {
      if (code !== '123456') {
        return { error: '验证码错误' };
      }
    } else {
      if (!password || user.password !== password) {
        return { error: '密码错误' };
      }
    }

    const safeUser: User = {
      id: user.id,
      role: user.role,
      name: user.name,
      phone: user.phone,
      classId: user.classId,
      className: user.className,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    const token = generateToken(safeUser);

    return { token, user: safeUser };
  },

  async sendSms(phone: string): Promise<{ success: boolean; message: string }> {
    console.log(`发送验证码到 ${phone}: 123456`);
    return { success: true, message: '验证码已发送，测试验证码为 123456' };
  },

  async getCurrentUser(userId: number): Promise<User | undefined> {
    const user = UserRepository.findById(userId);
    if (!user) return undefined;
    
    const result: User = {
      id: user.id,
      role: user.role,
      name: user.name,
      phone: user.phone,
      classId: user.classId,
      className: user.className,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    if (result.classId) {
      const cls = ClassRepository.findById(result.classId);
      if (cls) {
        result.className = cls.name;
      }
    }

    return result;
  },
};
