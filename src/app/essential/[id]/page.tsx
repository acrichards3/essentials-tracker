import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";
import { TradingViewChart } from "./_components/trading-view-chart";

export default async function EssentialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const essentialId = parseInt(id);

  if (isNaN(essentialId)) {
    notFound();
  }

  const essential = await api.essential.getById({ id: essentialId });
  const stats = await api.essential.getStats({ essentialId });

  if (!essential) {
    notFound();
  }

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatChange = (change: string | null) => {
    if (!change) return "N/A";
    const value = parseFloat(change);
    return value >= 0 ? `+${change}%` : `${change}%`;
  };

  const isPositive = (change: string | null) => {
    if (!change) return true;
    return parseFloat(change) >= 0;
  };

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button size="icon" variant="ghost">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex flex-1 items-center gap-4">
          <span className="text-5xl">{essential.icon}</span>
          <div>
            <h1 className="text-3xl font-bold">{essential.name}</h1>
            <p className="text-muted-foreground">{essential.unit}</p>
          </div>
          <Badge className="ml-4" variant="secondary">
            {essential.category}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.currentPrice ? formatPrice(stats.currentPrice) : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">24h Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                isPositive(stats?.change24h ?? null)
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatChange(stats?.change24h ?? null)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">7d Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                isPositive(stats?.change7d ?? null)
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatChange(stats?.change7d ?? null)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              30d Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.avgPrice30d ? `$${stats.avgPrice30d}` : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent>
          <TradingViewChart
            data={essential.priceHistory}
            unit={essential.unit}
          />
        </CardContent>
      </Card>

      {/* Price History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Price Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {essential.priceHistory.slice(0, 10).map((entry) => (
              <div
                className="flex items-center justify-between border-b pb-2 last:border-0"
                key={entry.id}
              >
                <div>
                  <div className="font-semibold">
                    {formatPrice(entry.price)}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {new Date(entry.createdAt).toLocaleString()}
                  </div>
                  {entry.location && (
                    <div className="text-muted-foreground text-xs">
                      {entry.location}
                    </div>
                  )}
                </div>
                {entry.notes && (
                  <div className="text-muted-foreground text-sm max-w-md">
                    {entry.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

