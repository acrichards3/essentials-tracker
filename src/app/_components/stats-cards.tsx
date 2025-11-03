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

function AffordabilityIndexCard() {
  const score = 42; // 0-100 scale
  const getSentiment = (score: number) => {
    if (score <= 20)
      return { color: "text-green-500", label: "Very Affordable" };
    if (score <= 40) return { color: "text-green-400", label: "Affordable" };
    if (score <= 60) return { color: "text-yellow-500", label: "Moderate" };
    if (score <= 80) return { color: "text-orange-500", label: "Expensive" };
    return { color: "text-red-500", label: "Very Expensive" };
  };

  const sentiment = getSentiment(score);
  const rotation = (score / 100) * 180 - 90; // Convert to degrees for gauge

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm font-medium">
            Affordability Index
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className={`text-3xl font-bold ${sentiment.color}`}>
                {score}
              </h3>
              <p className={`text-sm font-medium ${sentiment.color}`}>
                {sentiment.label}
              </p>
            </div>

            {/* Circular gauge indicator */}
            <div className="relative h-16 w-16">
              {/* Background semicircle */}
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <path
                  className="text-muted/20"
                  d="M 10,50 A 40,40 0 0,1 90,50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                />
                {/* Colored arc based on score */}
                <path
                  className={sentiment.color}
                  d="M 10,50 A 40,40 0 0,1 90,50"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${(score / 100) * 126} 126`}
                  strokeWidth="8"
                />
              </svg>
              {/* Needle indicator */}
              <div
                className="bg-foreground absolute top-1/2 left-1/2 h-8 w-0.5 origin-bottom"
                style={{
                  transform: `translateX(-50%) translateY(-100%) rotate(${rotation}deg)`,
                }}
              />
            </div>
          </div>

          <p className="text-muted-foreground text-xs">
            Based on recent price trends
          </p>
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
      <AffordabilityIndexCard />
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
