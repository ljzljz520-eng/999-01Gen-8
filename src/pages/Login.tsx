import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { 
  User, 
  Phone, 
  Lock, 
  Shield, 
  GraduationCap, 
  ShoppingBag, 
  ScanLine, 
  Users, 
  BarChart3,
  ArrowRight,
  Loader2
} from 'lucide-react';
import type { UserRole } from '../../shared/types.js';

const roles: { value: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'parent', label: '家长', icon: <ShoppingBag size={24} />, description: '下单、查看取货码' },
  { value: 'distributor', label: '发放员', icon: <ScanLine size={24} />, description: '扫码核销、异常处理' },
  { value: 'teacher', label: '班主任', icon: <Users size={24} />, description: '查看班级领取情况' },
  { value: 'finance', label: '财务', icon: <BarChart3 size={24} />, description: '订单金额统计' },
  { value: 'admin', label: '管理员', icon: <Shield size={24} />, description: '系统管理、全量数据' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, sendSms, loading, error, clearError } = useAuthStore();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('parent');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleSendSms = async () => {
    if (!phone) {
      setSmsMessage('请输入手机号');
      return;
    }
    if (countdown > 0) return;
    
    const result = await sendSms(phone);
    setSmsSent(true);
    setSmsMessage(result.message);
    setCountdown(60);
    
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const request = selectedRole === 'parent' 
      ? { role: selectedRole, phone, code }
      : { role: selectedRole, phone, password };
    
    const success = await login(request);
    if (success) {
      const redirectPath = {
        parent: '/parent',
        distributor: '/scan',
        teacher: '/teacher',
        finance: '/finance',
        admin: '/admin',
      }[selectedRole];
      navigate(redirectPath);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">校服订单核销平台</h1>
          <p className="text-slate-500">便捷下单 · 高效核销 · 智能管理</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="hidden md:block bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-60 h-60 bg-blue-300 rounded-full blur-3xl" />
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-6">欢迎使用</h2>
                <div className="space-y-4">
                  {[
                    '家长在线下单，快速获取取货码',
                    '扫码核销，高效便捷',
                    '缺码错码，智能登记处理',
                    '班主任实时查看领取状态',
                    '财务数据一目了然',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-sm">✓</span>
                      </div>
                      <span className="text-blue-100">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-12 pt-8 border-t border-white/20">
                  <p className="text-sm text-blue-200">测试账号</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-blue-200">管理员</p>
                      <p className="text-white font-medium">13800000000 / admin123</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-blue-200">发放员</p>
                      <p className="text-white font-medium">13800000001 / 123456</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-blue-200">班主任</p>
                      <p className="text-white font-medium">13800000003 / 123456</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-blue-200">家长</p>
                      <p className="text-white font-medium">13800000006 / 验证码123456</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">登录账号</h3>
              
              <div className="mb-8">
                <p className="text-sm font-medium text-slate-600 mb-3">选择您的身份</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.value);
                        clearError();
                      }}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedRole === role.value
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                        selectedRole === role.value ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {role.icon}
                      </div>
                      <p className={`font-semibold text-sm ${
                        selectedRole === role.value ? 'text-blue-700' : 'text-slate-700'
                      }`}>{role.label}</p>
                      <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">手机号</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="请输入手机号"
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {selectedRole === 'parent' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">验证码</label>
                    <div className="flex space-x-3">
                      <div className="relative flex-1">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                          type="text"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="请输入验证码"
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendSms}
                        disabled={countdown > 0}
                        className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                          countdown > 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        {countdown > 0 ? `${countdown}s` : '获取验证码'}
                      </button>
                    </div>
                    {smsMessage && (
                      <p className="mt-2 text-sm text-blue-600">{smsMessage}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">密码</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="请输入密码"
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <span>登录</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
