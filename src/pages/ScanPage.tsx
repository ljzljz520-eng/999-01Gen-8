import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../utils/api.js';
import StatusBadge from '../components/StatusBadge.js';
import { 
  ScanLine, 
  Keyboard, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Loader2,
  AlertTriangle,
  User,
  GraduationCap,
  Ruler,
  Package,
  RefreshCw,
  Search
} from 'lucide-react';
import type { Order, VerifyOrderRequest } from '../../shared/types.js';

export default function ScanPage() {
  const navigate = useNavigate();
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState(false);
  const [pickupCode, setPickupCode] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    if (!scannerRef.current) return;
    
    setScanning(true);
    setCameraError('');
    setError('');
    setOrder(null);
    setSuccess(false);

    try {
      const html5QrCode = new Html5Qrcode('scanner-container');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleCodeScanned(decodedText);
          html5QrCode.stop().catch(console.error);
          setScanning(false);
        },
        () => {}
      );
    } catch (err: any) {
      console.error('摄像头启动失败', err);
      setCameraError('无法启动摄像头，请检查权限设置或手动输入取货码');
      setScanning(false);
      setManualInput(true);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop().catch(console.error);
    }
    setScanning(false);
  };

  const handleCodeScanned = async (code: string) => {
    setPickupCode(code);
    await searchOrder(code);
  };

  const searchOrder = async (code: string) => {
    if (!code.trim()) {
      setError('请输入取货码');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);
    setSuccess(false);

    try {
      const response = await api.get<Order>(`/orders/pickup/${code.trim()}`);
      setOrder(response.data);
      
      if (response.data.status === 'distributed' || response.data.status === 'exchanged') {
        setError('该订单已核销');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '订单不存在');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (isExchange: boolean = false) => {
    if (!order) return;

    setLoading(true);
    try {
      const request: VerifyOrderRequest = {
        isExchange,
        remark: isExchange ? '换货处理' : undefined,
      };
      await api.put(`/orders/${order.id}/verify`, request);
      setSuccess(true);
      
      setTimeout(() => {
        setOrder(null);
        setPickupCode('');
        setSuccess(false);
        if (isExchange) {
          navigate('/exception', { state: { orderId: order.id, type: 'exchange' } });
        }
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || '核销失败');
    } finally {
      setLoading(false);
    }
  };

  const handleException = (type: 'out_of_stock' | 'wrong_size') => {
    if (!order) return;
    navigate('/exception', { state: { orderId: order.id, type } });
  };

  const reset = () => {
    setOrder(null);
    setPickupCode('');
    setError('');
    setSuccess(false);
    setManualInput(false);
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(console.error);
    }
    setScanning(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">扫码核销</h2>
          <p className="text-slate-500 mt-1">扫描取货码或手动输入进行核销</p>
        </div>
        <button
          onClick={reset}
          className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
        >
          <RefreshCw size={18} />
          <span>重置</span>
        </button>
      </div>

      {!scanning && !manualInput && !order && !success && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative">
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ScanLine size={48} className="animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold mb-2">扫描取货码</h3>
              <p className="text-slate-400 mb-8">将取货码放入扫描框内</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <button
              onClick={startScanner}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2"
            >
              <ScanLine size={24} />
              <span>开始扫码</span>
            </button>
            <button
              onClick={() => setManualInput(true)}
              className="w-full py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2"
            >
              <Keyboard size={24} />
              <span>手动输入取货码</span>
            </button>
          </div>
        </div>
      )}

      {scanning && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="relative aspect-square bg-black">
            <div id="scanner-container" ref={scannerRef} className="w-full h-full" />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-blue-400 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl -mt-1 -ml-1" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl -mt-1 -mr-1" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl -mb-1 -ml-1" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl -mb-1 -mr-1" />
                <div className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan" />
              </div>
            </div>
          </div>
          <div className="p-6">
            <button
              onClick={stopScanner}
              className="w-full py-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
            >
              取消扫描
            </button>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-amber-800 font-medium">{cameraError}</p>
            </div>
          </div>
        </div>
      )}

      {manualInput && !order && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800">手动输入取货码</h3>
          <div className="flex space-x-3">
            <input
              type="text"
              value={pickupCode}
              onChange={(e) => setPickupCode(e.target.value.toUpperCase())}
              placeholder="请输入取货码（如 XF000001）"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-center text-2xl font-mono tracking-widest"
              maxLength={8}
            />
          </div>
          <button
            onClick={() => searchOrder(pickupCode)}
            disabled={loading || !pickupCode.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Search size={20} />
                <span>查询订单</span>
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
          <XCircle className="text-red-500" size={24} />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-500" size={48} />
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">核销成功！</h3>
          <p className="text-green-600">校服已发放</p>
        </div>
      )}

      {order && !success && (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">订单信息</h3>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-blue-100 mt-1">取货码: {order.pickupCode}</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-slate-500 mb-1">
                  <User size={16} />
                  <span className="text-sm">学生姓名</span>
                </div>
                <p className="font-semibold text-slate-800 text-lg">{order.studentName}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-slate-500 mb-1">
                  <GraduationCap size={16} />
                  <span className="text-sm">班级</span>
                </div>
                <p className="font-semibold text-slate-800 text-lg">{order.className}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">商品名称</p>
              <p className="font-semibold text-slate-800 text-lg">{order.productName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-slate-500 mb-1">
                  <Ruler size={16} />
                  <span className="text-sm">尺码</span>
                </div>
                <p className="font-bold text-blue-600 text-2xl">{order.size}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-slate-500 mb-1">
                  <Package size={16} />
                  <span className="text-sm">套数</span>
                </div>
                <p className="font-bold text-blue-600 text-2xl">{order.quantity}</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
              <span className="text-slate-600">订单金额</span>
              <span className="text-3xl font-bold text-orange-600">¥{order.amount.toFixed(2)}</span>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm font-medium text-slate-700 mb-3">请核对以上信息</p>
              
              {order.status !== 'distributed' && order.status !== 'exchanged' && (
                <div className="space-y-3">
                  <button
                    onClick={() => handleVerify(false)}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <CheckCircle size={22} />
                        <span>确认发放，核销完成</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleException('out_of_stock')}
                      className="py-3 border-2 border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors text-sm"
                    >
                      缺码登记
                    </button>
                    <button
                      onClick={() => handleException('wrong_size')}
                      className="py-3 border-2 border-orange-200 text-orange-600 font-medium rounded-xl hover:bg-orange-50 transition-colors text-sm"
                    >
                      错码登记
                    </button>
                    <button
                      onClick={() => handleVerify(true)}
                      className="py-3 border-2 border-purple-200 text-purple-600 font-medium rounded-xl hover:bg-purple-50 transition-colors text-sm flex items-center justify-center space-x-1"
                    >
                      <ArrowRight size={16} />
                      <span>换货</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
