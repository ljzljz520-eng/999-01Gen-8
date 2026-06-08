import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import StatusBadge from '../components/StatusBadge.js';
import JsBarcode from 'jsbarcode';
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  CheckCircle, 
  QrCode,
  Loader2,
  Calendar,
  Ruler,
  User,
  GraduationCap
} from 'lucide-react';
import type { Order } from '../../shared/types.js';

export default function PickupCode() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  useEffect(() => {
    if (order && barcodeRef.current) {
      JsBarcode(barcodeRef.current, order.pickupCode, {
        format: 'CODE128',
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 16,
        margin: 10,
      });
    }
  }, [order]);

  const loadOrder = async () => {
    try {
      const response = await api.get<Order>(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('加载订单失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (order) {
      navigator.clipboard.writeText(order.pickupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!barcodeRef.current) return;
    
    const svg = barcodeRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 200;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 400, 200);
      }
      
      const link = document.createElement('a');
      link.download = `取货码-${order?.pickupCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">订单不存在</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>返回</span>
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">取货码</h2>
          <p className="text-blue-100">请出示此码领取校服</p>
        </div>

        <div className="p-8">
          <div className="bg-slate-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center">
              <svg ref={barcodeRef} className="w-full max-w-xs" />
            </div>
            <div className="flex items-center justify-center mt-4 space-x-3">
              <span className="text-3xl font-mono font-bold text-slate-800 tracking-wider">
                {order.pickupCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                title="复制取货码"
              >
                {copied ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : (
                  <Copy className="text-slate-400 hover:text-blue-600" size={20} />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center space-x-3 text-slate-500">
                <User size={18} />
                <span>学生姓名</span>
              </div>
              <span className="font-semibold text-slate-800">{order.studentName}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center space-x-3 text-slate-500">
                <GraduationCap size={18} />
                <span>班级</span>
              </div>
              <span className="font-semibold text-slate-800">{order.className}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-500">商品名称</span>
              <span className="font-semibold text-slate-800">{order.productName}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center space-x-3 text-slate-500">
                <Ruler size={18} />
                <span>尺码 / 数量</span>
              </div>
              <span className="font-semibold text-slate-800">{order.size}码 / {order.quantity}套</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center space-x-3 text-slate-500">
                <Calendar size={18} />
                <span>下单时间</span>
              </div>
              <span className="font-medium text-slate-600">{order.createdAt}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-slate-500">订单状态</span>
              <StatusBadge status={order.status} />
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">订单金额</span>
              <span className="text-2xl font-bold text-orange-600">¥{order.amount.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2"
          >
            <Download size={20} />
            <span>下载取货码</span>
          </button>
        </div>
      </div>
    </div>
  );
}
