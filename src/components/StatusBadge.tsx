import type { OrderStatus, ExceptionType } from '../../shared/types.js';

interface StatusBadgeProps {
  status: OrderStatus | string;
  type?: 'order' | 'exception';
}

const orderStatusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: '待支付', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  paid: { label: '已支付待领取', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  distributed: { label: '已发放', className: 'bg-green-100 text-green-800 border-green-200' },
  exchanged: { label: '已换货', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  cancelled: { label: '已取消', className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const exceptionTypeConfig: Record<ExceptionType, { label: string; className: string }> = {
  out_of_stock: { label: '缺码', className: 'bg-red-100 text-red-800 border-red-200' },
  wrong_size: { label: '错码', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  exchange: { label: '换货', className: 'bg-amber-100 text-amber-800 border-amber-200' },
};

export default function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  let config;
  
  if (type === 'exception') {
    config = exceptionTypeConfig[status as ExceptionType];
  } else {
    config = orderStatusConfig[status as OrderStatus];
  }

  if (!config) {
    config = { label: status, className: 'bg-slate-100 text-slate-600 border-slate-200' };
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}
