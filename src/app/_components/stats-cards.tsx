import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface StatCardProps {
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  title: string;
  value: string;
}

function StatCard({
  change,
  isPositive,
  subtitle,
  title,
  value,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold">{value}</h3>
            {change && (
              <Badge
                className="text-xs"
                variant={isPositive ? "default" : "destructive"}
              >
                {isPositive ? "▲" : "▼"} {change}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-muted-foreground text-xs">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        change="2.3%"
        isPositive={false}
        subtitle="Last 24 hours"
        title="Average Essential Cost"
        value="$3.89"
      />
      <StatCard
        subtitle="Across 8 categories"
        title="Tracked Items"
        value="48"
      />
      <StatCard
        change="12.4%"
        isPositive={false}
        subtitle="Last 7 days"
        title="Highest Increase"
        value="Eggs"
      />
      <StatCard
        change="0.2%"
        isPositive={true}
        subtitle="Last 30 days"
        title="Most Stable"
        value="Milk"
      />
    </div>
  );
}
