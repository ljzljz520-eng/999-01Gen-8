import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import StatusBadge from '../components/StatusBadge.js';
import { 
  ShoppingBag, 
  QrCode, 
  ChevronRight, 
  Search,
  Filter,
  Loader2,
  Calendar,
  Ruler,
  Package
} from 'lucide-react';
import type { Order } from '../../shared/types.js';

export default function ParentOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.get<Order[]>('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('加载订单失败', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.studentName.includes(searchTerm) ||
      order.productName.includes(searchTerm) ||
      order.pickupCode.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">我的订单</h2>
          <p className="text-slate-500 mt-1">共 {orders.length} 条订单记录</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索学生姓名、商品名称或取货码"
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
          >
            <option value="all">全部状态</option>
            <option value="pending">待支付</option>
            <option value="paid">已支付待领取</option>
            <option value="distributed">已发放</option>
            <option value="exchanged">已换货</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="text-slate-400" size={40} />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无订单记录</h3>
          <p className="text-slate-500">快去下单吧~</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Package className="text-blue-600" size={28} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-slate-800">{order.productName}</h4>
                      <p className="text-sm text-slate-500">订单号: {order.orderNo}</p>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">学生姓名</p>
                    <p className="font-semibold text-slate-800">{order.studentName}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">班级</p>
                    <p className="font-semibold text-slate-800">{order.className}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1 flex items-center space-x-1">
                      <Ruler size={12} />
                      <span>尺码 / 数量</span>
                    </p>
                    <p className="font-semibold text-slate-800">{order.size}码 / {order.quantity}套</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">金额</p>
                    <p className="font-bold text-orange-600">¥{order.amount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <Calendar size={16} />
                    <span>下单时间: {order.createdAt}</span>
                  </div>
                  {(order.status === 'paid' || order.status === 'pending') && (
                    <button
                      onClick={() => navigate(`/parent/pickup/${order.id}`)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                      <QrCode size={18} />
                      <span>查看取货码</span>
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
