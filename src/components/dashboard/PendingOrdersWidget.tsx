import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, CalendarClock } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';

interface PendingOrder {
  id: string;
  order_number: string;
  supplier_name: string;
  expected_delivery: string | null;
  total_amount: number;
  status: string;
}

interface PendingOrdersWidgetProps {
  orders: PendingOrder[];
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'ordered':
      return 'bg-primary/10 text-primary';
    case 'partial':
      return 'bg-accent text-accent-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function PendingOrdersWidget({ orders }: PendingOrdersWidgetProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Pending Orders
        </CardTitle>
        {orders.length > 0 && (
          <Link
            to="/purchase-orders"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending orders</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => navigate({ to: `/purchase-orders/$orderId`, params: { orderId: order.id } })}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{order.order_number}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusStyle(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs truncate">{order.supplier_name}</p>
                </div>
                <div className="ml-4 text-right shrink-0">
                  <p className="font-medium">${Number(order.total_amount).toFixed(2)}</p>
                  {order.expected_delivery && (
                    <p className="text-muted-foreground text-xs flex items-center gap-1 justify-end">
                      <CalendarClock className="h-3 w-3" />
                      {new Date(order.expected_delivery).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
