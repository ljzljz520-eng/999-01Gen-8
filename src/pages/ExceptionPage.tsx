import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import StatusBadge from '../components/StatusBadge.js';
import { 
  ArrowLeft, 
  AlertTriangle, 
  PackageX, 
  Ruler,
  CheckCircle,
  Loader2,
  User,
  GraduationCap,
  ArrowRight,
  FileText,
  Clock,
  CheckSquare,
  XSquare,
  Search
} from 'lucide-react';
import type { Order, ExceptionRecord, ExceptionType, CreateExceptionRequest } from '../../shared/types.js';

const TYPE_LABELS: Record<ExceptionType, { label: string; color: string }> = {
  out_of_stock: { label: '缺码', color: 'text-red-600 bg-red-50 border-red-200' },
  wrong_size: { label: '错码', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  exchange: { label: '换货', color: 'text-purple-600 bg-purple-50 border-purple-200' },
};

export default function ExceptionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { orderId?: number; type?: ExceptionType };
  
  const [tab, setTab] = useState<'register' | 'list'>(state?.orderId ? 'register' : 'list');
  const [orderId, setOrderId] = useState<number | ''>(state?.orderId || '');
  const [exceptionType, setExceptionType] = useState<ExceptionType>(state?.type || 'out_of_stock');
  const [remark, setRemark] = useState('');
  const [newSize, setNewSize] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [exceptions, setExceptions] = useState<ExceptionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (state?.orderId) {
      loadOrder(state.orderId);
    }
    loadExceptions();
  }, [state?.orderId]);

  const loadOrder = async (id: number) => {
    setSearching(true);
    setError('');
    try {
      const response = await api.get<Order>(`/orders/${id}`);
      setOrder(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || '订单不存在');
      setOrder(null);
    } finally {
      setSearching(false);
    }
  };

  const loadExceptions = async () => {
    setLoading(true);
    try {
      const response = await api.get<ExceptionRecord[]>('/exceptions');
      setExceptions(response.data);
    } catch (error) {
      console.error('加载异常列表失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchOrder = () => {
    if (orderId) {
      loadOrder(Number(orderId));
    }
  };

  const handleSubmit = async () => {
    if (!order) {
      setError('请先查询订单');
      return;
    }

    if (exceptionType === 'exchange' && !newSize.trim()) {
      setError('请输入新尺码');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const request: CreateExceptionRequest = {
        orderId: order.id,
        type: exceptionType,
        description: remark.trim() || `${TYPE_LABELS[exceptionType].label}登记`,
        newSize: newSize.trim() || undefined,
        originalSize: order.size,
      };
      await api.post('/exceptions', request);
      setSuccess(true);
      
      setTimeout(() => {
        reset();
        loadExceptions();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || '登记失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await api.put(`/exceptions/${id}/resolve`, { remark: '已处理' });
      loadExceptions();
    } catch (error) {
      console.error('处理异常失败', error);
    }
  };

  const reset = () => {
    setOrder(null);
    setOrderId('');
    setRemark('');
    setNewSize('');
    setSuccess(false);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>返回</span>
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-100">
          <div className="flex">
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                tab === 'register'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <AlertTriangle size={20} />
                <span>异常登记</span>
              </div>
            </button>
            <button
              onClick={() => setTab('list')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                tab === 'list'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FileText size={20} />
                <span>异常列表</span>
                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                  {exceptions.filter(e => e.status === 'pending').length}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          {tab === 'register' && (
            <div className="space-y-6">
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="text-green-500" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-green-800">登记成功！</h3>
                  <p className="text-green-600 mt-1">已记录异常信息，请等待后续处理</p>
                </div>
              )}

              {!success && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">订单ID</label>
                    <div className="flex space-x-3">
                      <input
                        type="number"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value as unknown as number)}
                        placeholder="请输入订单ID"
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchOrder()}
                      />
                      <button
                        onClick={handleSearchOrder}
                        disabled={searching || !orderId}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {searching ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <Search size={20} />
                        )}
                        <span>查询</span>
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                      <AlertTriangle className="text-red-500" size={20} />
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  {order && (
                    <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-800">订单信息</h4>
                        <StatusBadge status={order.status} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <User size={18} className="text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">学生姓名</p>
                            <p className="font-medium text-slate-800">{order.studentName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <GraduationCap size={18} className="text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">班级</p>
                            <p className="font-medium text-slate-800">{order.className}</p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-slate-700">{order.productName}</p>
                      
                      <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                          {order.size}码
                        </span>
                        <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg">
                          {order.quantity}套
                        </span>
                        <span className="text-orange-600 font-bold">¥{order.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {order && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">异常类型</label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['out_of_stock', 'wrong_size', 'exchange'] as ExceptionType[]).map((type) => (
                            <button
                              key={type}
                              onClick={() => setExceptionType(type)}
                              className={`py-4 px-4 rounded-xl border-2 transition-all ${
                                exceptionType === type
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {type === 'out_of_stock' && <PackageX size={24} className="mx-auto mb-2 text-red-500" />}
                              {type === 'wrong_size' && <Ruler size={24} className="mx-auto mb-2 text-orange-500" />}
                              {type === 'exchange' && <ArrowRight size={24} className="mx-auto mb-2 text-purple-500" />}
                              <p className={`font-semibold ${
                                exceptionType === type ? 'text-blue-600' : 'text-slate-700'
                              }`}>
                                {TYPE_LABELS[type].label}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {exceptionType === 'exchange' && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">新尺码</label>
                          <input
                            type="text"
                            value={newSize}
                            onChange={(e) => setNewSize(e.target.value.toUpperCase())}
                            placeholder="请输入新尺码（如：XL、170）"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-center text-xl font-bold"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">备注说明</label>
                        <textarea
                          value={remark}
                          onChange={(e) => setRemark(e.target.value)}
                          placeholder="请输入详细说明（可选）"
                          rows={3}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                        />
                      </div>

                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {submitting ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <>
                            <AlertTriangle size={22} />
                            <span>提交异常登记</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'list' && (
            <div>
              {loading && exceptions.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              ) : exceptions.length === 0 ? (
                <div className="text-center py-16">
                  <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">暂无异常记录</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exceptions.map((ex) => (
                    <div key={ex.id} className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${TYPE_LABELS[ex.type].color}`}>
                            {TYPE_LABELS[ex.type].label}
                          </span>
                          {ex.status === 'resolved' ? (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-600 border border-green-200 flex items-center space-x-1">
                              <CheckSquare size={14} />
                              <span>已处理</span>
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-600 border border-amber-200 flex items-center space-x-1">
                              <Clock size={14} />
                              <span>待处理</span>
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-slate-400">{ex.createdAt}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-slate-500">学生姓名</p>
                          <p className="font-medium text-slate-800">{ex.studentName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">班级</p>
                          <p className="font-medium text-slate-800">{ex.className}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-slate-600">
                          原尺码: <span className="font-semibold text-slate-800">{ex.originalSize}</span>
                        </span>
                        {ex.newSize && (
                          <span className="text-slate-600">
                            → 新尺码: <span className="font-semibold text-purple-600">{ex.newSize}</span>
                          </span>
                        )}
                      </div>
                      
                      {ex.remark && (
                        <p className="text-sm text-slate-500 mt-2 pt-2 border-t border-slate-100">
                          备注: {ex.remark}
                        </p>
                      )}
                      
                      {ex.status === 'pending' && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={() => handleResolve(ex.id)}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                          >
                            <CheckSquare size={16} />
                            <span>标记已处理</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
