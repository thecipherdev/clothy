import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface RecentMovement {
  id: string;
  movement_type: string;
  quantity: number;
  product_name: string;
  created_at: string;
}

interface RecentMovementsWidgetProps {
  movements: RecentMovement[];
}

const getMovementLabel = (type: string) => {
  const labels: Record<string, string> = {
    in: 'IN',
    out: 'OUT',
    transfer_in: 'TRANSFER',
    transfer_out: 'TRANSFER',
    adjustment: 'ADJ',
  };
  return labels[type] || type.toUpperCase();
};

const getMovementStyle = (type: string) => {
  if (type === 'in' || type === 'transfer_in') return 'text-primary bg-primary/10';
  if (type === 'out' || type === 'transfer_out') return 'text-destructive bg-destructive/10';
  return 'text-muted-foreground bg-muted';
};

export function RecentMovementsWidget({ movements }: RecentMovementsWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          Recent Activity
        </CardTitle>
        {movements.length > 0 && (
          <Link
            to="/stock-movements"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent movements</p>
        ) : (
          <div className="space-y-3">
            {movements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{movement.product_name}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(movement.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${getMovementStyle(movement.movement_type)}`}>
                    {getMovementLabel(movement.movement_type)}
                  </span>
                  <span className={movement.movement_type.includes('in') ? 'text-primary font-medium' : 'text-destructive font-medium'}>
                    {movement.movement_type.includes('in') ? '+' : ''}{movement.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
