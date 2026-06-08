import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import api from '../utils/api.js';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  ChevronRight, 
  Ruler, 
  Package,
  GraduationCap,
  User,
  Loader2
} from 'lucide-react';
import type { Product, Class, CreateOrderRequest } from '../../shared/types.js';

export default function ParentHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [studentName, setStudentName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, classesRes] = await Promise.all([
        api.get<Product[]>('/products'),
        api.get<Class[]>('/classes'),
      ]);
      setProducts(productsRes.data);
      setClasses(classesRes.data);
      if (classesRes.data.length > 0) {
        setSelectedClassId(user?.classId || classesRes.data[0].id);
      }
    } catch (error) {
      console.error('加载数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0]);
    setQuantity(1);
    setShowOrderForm(true);
    setMessage('');
  };

  const handleSubmitOrder = async () => {
    if (!selectedProduct || !selectedSize || !studentName || !selectedClassId) {
      setMessage('请填写完整信息');
      return;
    }

    setSubmitting(true);
    try {
      const request: CreateOrderRequest = {
        productId: selectedProduct.id,
        size: selectedSize,
        quantity,
        studentName,
        classId: selectedClassId,
      };
      const response = await api.post('/orders', request);
      setMessage('下单成功！');
      setTimeout(() => {
        navigate(`/parent/pickup/${response.data.id}`);
      }, 1000);
    } catch (error: any) {
      setMessage(error.response?.data?.error || '下单失败');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryNames: Record<string, string> = {
    summer: '夏季校服',
    winter: '冬季校服',
    sport: '运动校服',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <User size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">您好，{user?.name}！</h2>
              <p className="text-blue-100">欢迎使用校服订单平台</p>
            </div>
          </div>
          {user?.className && (
            <div className="flex items-center space-x-2 bg-white/10 rounded-xl px-4 py-2 inline-flex">
              <GraduationCap size={18} />
              <span>{user.className}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/parent/orders')}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">我的订单</h3>
              <p className="text-sm text-slate-500">查看历史订单</p>
            </div>
          </div>
          <ChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform" size={20} />
        </button>
      </div>

      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">选择校服款式</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
              onClick={() => handleSelectProduct(product)}
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-blue-600">
                    {categoryNames[product.category]}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-lg text-slate-800 mb-2">{product.name}</h4>
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Ruler size={16} className="text-slate-400" />
                    <span className="text-sm text-slate-500">{product.sizes.join('/')}</span>
                  </div>
                  <div className="text-xl font-bold text-orange-600">
                    ¥{product.price}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showOrderForm && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">确认订单</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-semibold text-slate-800">{selectedProduct.name}</h4>
                  <p className="text-orange-600 font-bold text-lg">¥{selectedProduct.price}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">选择尺码</label>
                <div className="grid grid-cols-4 gap-2">
                  {selectedProduct.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 rounded-xl font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">购买数量</label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="text-2xl font-bold text-slate-800 w-12 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">学生姓名</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="请输入学生姓名"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">选择班级</label>
                <select
                  value={selectedClassId || ''}
                  onChange={(e) => setSelectedClassId(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">商品金额</span>
                  <span className="font-medium">¥{selectedProduct.price} × {quantity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">应付总额</span>
                  <span className="text-2xl font-bold text-orange-600">¥{selectedProduct.price * quantity}</span>
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-xl text-sm ${
                  message.includes('成功') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex space-x-3">
              <button
                type="button"
                onClick={() => setShowOrderForm(false)}
                className="flex-1 py-3 border border-slate-300 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Package size={20} />
                    <span>提交订单</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
