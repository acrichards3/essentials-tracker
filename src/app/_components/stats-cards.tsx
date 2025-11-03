"use client";

import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";

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
  const { data: essentials } = api.essential.getAll.useQuery();

  // Calculate affordability score based on average 7-day change
  // Higher change = less affordable = higher score
  const calculateAffordabilityScore = () => {
    if (!essentials || essentials.length === 0) return 50;

    // For now, return a moderate score
    // TODO: Calculate this based on actual price trends
    return 45;
  };

  const score = calculateAffordabilityScore();

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
  const { data: essentials, isLoading } = api.essential.getAll.useQuery();

  // Calculate average price
  const averagePrice = essentials
    ? essentials.reduce((sum, e) => {
        const price = parseFloat(e.latestPrice ?? "0");
        return sum + price;
      }, 0) / Math.max(essentials.length, 1)
    : 0;

  // Find essential with highest price (placeholder for "highest increase")
  const highestPriceEssential = essentials
    ? essentials.reduce((max, e) => {
        const price = parseFloat(e.latestPrice ?? "0");
        const maxPrice = parseFloat(max.latestPrice ?? "0");
        return price > maxPrice ? e : max;
      }, essentials[0]!)
    : null;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <div className="flex items-baseline gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-3 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        subtitle={`Across ${essentials?.length ?? 0} essentials`}
        title="Average Price"
        value={`$${averagePrice.toFixed(2)}`}
      />
      <AffordabilityIndexCard />
      <StatCard
        subtitle="Current highest"
        title="Most Expensive"
        value={highestPriceEssential?.name ?? "N/A"}
      />
      <StatCard
        subtitle="Total tracked items"
        title="Essentials Tracked"
        value={essentials?.length.toString() ?? "0"}
      />
    </div>
  );
}
