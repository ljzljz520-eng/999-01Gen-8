import { useState, useEffect } from 'react';
import api from '../utils/api.js';
import StatCard from '../components/StatCard.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Loader2,
  Download,
  FileText,
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react';
import type {
  FinanceSummary,
  ClassReport,
  CategoryReport,
} from '../../shared/types.js';

const COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function FinanceHome() {
  const [tab, setTab] = useState<'overview' | 'reports'>('overview');
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [classReports, setClassReports] = useState<ClassReport[]>([]);
  const [categoryReports, setCategoryReports] = useState<CategoryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryRes, classRes, categoryRes] = await Promise.all([
        api.get<FinanceSummary>('/finance/summary'),
        api.get<ClassReport[]>('/finance/reports/class'),
        api.get<CategoryReport[]>('/finance/reports/category'),
      ]);
      setSummary(summaryRes.data);
      setClassReports(classRes.data);
      setCategoryReports(categoryRes.data);
    } catch (error) {
      console.error('加载数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/finance/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '校服订单财务报表.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('导出失败', error);
    } finally {
      setExporting(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-slate-800">财务中心</h2>
          <p className="text-slate-500 mt-1">订单金额汇总与统计报表</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Download size={18} />
          )}
          <span>导出报表</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-100">
          <div className="flex">
            <button
              onClick={() => setTab('overview')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                tab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <BarChart3 size={20} />
                <span>数据概览</span>
              </div>
            </button>
            <button
              onClick={() => setTab('reports')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                tab === 'reports'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <PieChartIcon size={20} />
                <span>详细报表</span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          {tab === 'overview' && summary && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="订单总数"
                  value={summary.totalOrders}
                  icon={<Package size={24} />}
                  color="blue"
                />
                <StatCard
                  title="已发放订单"
                  value={summary.distributedOrders}
                  icon={<Users size={24} />}
                  color="green"
                />
                <StatCard
                  title="总金额"
                  value={`¥${summary.totalAmount.toFixed(2)}`}
                  icon={<DollarSign size={24} />}
                  color="indigo"
                />
                <StatCard
                  title="已发放金额"
                  value={`¥${summary.distributedAmount.toFixed(2)}`}
                  icon={<TrendingUp size={24} />}
                  color="orange"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <BarChart3 size={20} className="text-blue-600" />
                    <span>各班级订单金额</span>
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={classReports} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="className" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: number) => [`¥${value.toFixed(2)}`, '金额']}
                          contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="totalAmount" name="总金额" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="distributedAmount" name="已发放" fill="#10B981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                    <PieChartIcon size={20} className="text-indigo-600" />
                    <span>商品类别占比</span>
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryReports}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="totalAmount"
                          nameKey="categoryName"
                        >
                          {categoryReports.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`¥${value.toFixed(2)}`, '金额']}
                          contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">待发放金额（应收）</p>
                    <p className="text-4xl font-bold mt-1">
                      ¥{(summary.totalAmount - summary.distributedAmount).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100">发放率</p>
                    <p className="text-3xl font-bold mt-1">
                      {summary.totalOrders > 0
                        ? ((summary.distributedOrders / summary.totalOrders) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-white">
                  <h3 className="font-semibold text-slate-800 flex items-center space-x-2">
                    <FileText size={20} className="text-blue-600" />
                    <span>按班级统计</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          班级
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          订单数
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          已发放
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          总金额
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          已发放金额
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          完成率
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {classReports.map((report) => (
                        <tr key={report.classId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">{report.className}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-slate-700">
                            {report.totalOrders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              {report.distributedOrders}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-slate-800">
                            ¥{report.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-green-600 font-medium">
                            ¥{report.distributedAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <div className="w-20 bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${report.totalOrders > 0
                                      ? (report.distributedOrders / report.totalOrders) * 100
                                      : 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium text-slate-600">
                                {report.totalOrders > 0
                                  ? ((report.distributedOrders / report.totalOrders) * 100).toFixed(0)
                                  : 0}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-white">
                  <h3 className="font-semibold text-slate-800 flex items-center space-x-2">
                    <FileText size={20} className="text-indigo-600" />
                    <span>按商品类别统计</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          商品类别
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          订单数
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          总套数
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          总金额
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          占比
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {categoryReports.map((report, index) => (
                        <tr key={report.categoryName} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="font-semibold text-slate-800">{report.categoryName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-slate-700">
                            {report.totalOrders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-slate-700">
                            {report.totalQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-slate-800">
                            ¥{report.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {(report.percentage * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
