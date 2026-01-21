import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  href: string;
  variant?: 'default' | 'warning';
  subtitle?: string;
}

export function StatCard({ title, value, icon: Icon, href, variant = 'default', subtitle }: StatCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={() => navigate({ to: href })}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${variant === 'warning' ? 'text-destructive' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${variant === 'warning' && value > 0 ? 'text-destructive' : ''}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
