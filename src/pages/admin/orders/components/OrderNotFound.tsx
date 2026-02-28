import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface OrderNotFoundProps {
  orderId?: string;
}

export function OrderNotFound({ orderId }: OrderNotFoundProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
      <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center mb-6">
        <Package className="h-10 w-10 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
      <p className="text-gray-500 mt-2 text-center max-w-md">
        {orderId ? `Order with ID ${orderId} does not exist` : 'The order you are looking for cannot be found'}
      </p>
      <Button
        onClick={() => navigate('/admin/orders')}
        className="mt-8 bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
      >
        Back to Orders
      </Button>
    </div>
  );
}
