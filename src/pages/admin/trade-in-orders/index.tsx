import { Navigate } from 'react-router-dom';

export default function TradeInOrderManagementRedirect() {
  return <Navigate to="/admin/orders?view=trade-in" replace />;
}
