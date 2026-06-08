import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import StatCard from '../components/StatCard.js';
import StatusBadge from '../components/StatusBadge.js';
import { 
  GraduationCap, 
  Users, 
  PackageCheck, 
  Clock,
  ChevronRight,
  Loader2,
  Search,
  User,
  Ruler,
  Package
} from 'lucide-react';
import type { Class, TeacherStats, Order } from '../../shared/types.js';

export default function TeacherHome() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [uncollectedOrders, setUncollectedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classesRes, statsRes] = await Promise.all([
        api.get<Class[]>('/teacher/classes'),
        api.get<TeacherStats>('/teacher/stats'),
      ]);
      setClasses(classesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('加载数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUncollected = async (classId: number) => {
    setSelectedClass(classId);
    setLoadingOrders(true);
    try {
      const response = await api.get<Order[]>(`/teacher/class/${classId}/uncollected`);
      setUncollectedOrders(response.data);
    } catch (error) {
      console.error('加载未领取名单失败', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const filteredOrders = uncollectedOrders.filter(
    (o) =>
      o.studentName.includes(searchQuery) ||
      o.pickupCode.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">班主任工作台</h2>
          <p className="text-slate-500 mt-1">管理班级校服领取情况</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="管理班级"
            value={stats.totalClasses}
            icon={<GraduationCap size={24} />}
            color="blue"
          />
          <StatCard
            title="学生总数"
            value={stats.totalStudents}
            icon={<Users size={24} />}
            color="indigo"
          />
          <StatCard
            title="已领取"
            value={stats.distributed}
            icon={<PackageCheck size={24} />}
            color="green"
          />
          <StatCard
            title="待领取"
            value={stats.pending}
            icon={<Clock size={24} />}
            color="orange"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">班级列表</h3>
            <p className="text-sm text-slate-500 mt-1">选择班级查看未领取名单</p>
          </div>
          <div className="divide-y divide-slate-100">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => loadUncollected(cls.id)}
                className={`w-full p-4 text-left hover:bg-slate-50 transition-colors flex items-center justify-between ${
                  selectedClass === cls.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedClass === cls.id ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    <GraduationCap
                      size={20}
                      className={selectedClass === cls.id ? 'text-blue-600' : 'text-slate-500'}
                    />
                  </div>
                  <div>
                    <p className={`font-semibold ${
                      selectedClass === cls.id ? 'text-blue-600' : 'text-slate-800'
                    }`}>
                      {cls.name}
                    </p>
                    <p className="text-sm text-slate-500">{cls.studentCount}名学生</p>
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className={selectedClass === cls.id ? 'text-blue-600' : 'text-slate-300'}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">未领取名单</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedClass
                    ? `${classes.find(c => c.id === selectedClass)?.name} - 共 ${filteredOrders.length} 人未领取`
                    : '请先选择班级'}
                </p>
              </div>
              {selectedClass && (
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索姓名或取货码"
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            {!selectedClass ? (
              <div className="text-center py-16">
                <GraduationCap size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">请从左侧选择一个班级</p>
              </div>
            ) : loadingOrders ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <PackageCheck size={48} className="mx-auto text-green-300 mb-4" />
                <p className="text-slate-500">
                  {searchQuery ? '未找到匹配的学生' : '太棒了！所有学生都已领取'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {order.studentName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-slate-800">{order.studentName}</h4>
                            <StatusBadge status={order.status} />
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">
                            取货码: <span className="font-mono font-semibold">{order.pickupCode}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-slate-400">商品</p>
                        <p className="font-medium text-slate-700 truncate">{order.productName}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Ruler size={14} className="text-slate-400" />
                        <div>
                          <p className="text-slate-400 text-xs">尺码</p>
                          <p className="font-semibold text-blue-600">{order.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Package size={14} className="text-slate-400" />
                        <div>
                          <p className="text-slate-400 text-xs">套数</p>
                          <p className="font-semibold text-slate-700">{order.quantity}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
