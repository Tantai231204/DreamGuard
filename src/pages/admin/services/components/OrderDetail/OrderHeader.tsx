import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { DetailOrder, StatusConfigItem } from './types';

interface OrderHeaderProps {
  order: DetailOrder;
  statusCfg?: StatusConfigItem;
}

export function OrderHeader({ order, statusCfg }: OrderHeaderProps) {
  const navigate = useNavigate();
  const StatusIcon = statusCfg?.icon;

  return (
    <div className="flex-shrink-0 bg-white border-b border-blue-100/50 px-8 py-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

      <div className="max-w-[1600px] mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin/services')}
            className="rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase border border-blue-100">
                {order.orderCode || 'N/A'}
              </div>
              {statusCfg && (
                <Badge variant="outline" className={`${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} text-[10px] font-bold py-0.5 px-2 rounded-full`}>
                  {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                  {statusCfg.label}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Service Order Details
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
            <p className="text-2xl font-black text-blue-600 tracking-tighter">{formatPrice(order.totalPrice || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
