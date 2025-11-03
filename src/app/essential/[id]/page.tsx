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
    <div className="container mx-auto space-y-4 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Link href="/">
          <Button className="self-start" size="icon" variant="ghost">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-5xl">{essential.icon}</span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold sm:text-3xl">
                {essential.name}
              </h1>
              <p className="text-muted-foreground text-xs sm:text-base">
                {essential.unit}
              </p>
            </div>
          </div>
          <Badge className="self-start sm:ml-4" variant="secondary">
            {essential.category}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">
              Current Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold sm:text-2xl">
              {stats?.currentPrice ? formatPrice(stats.currentPrice) : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">
              7d Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-lg font-bold sm:text-2xl ${
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
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">
              30d Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-lg font-bold sm:text-2xl ${
                isPositive(stats?.change30d ?? null)
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatChange(stats?.change30d ?? null)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 sm:pb-2">
            <CardTitle className="text-xs font-medium sm:text-sm">
              1 Year Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-lg font-bold sm:text-2xl ${
                isPositive(stats?.change1y ?? null)
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatChange(stats?.change1y ?? null)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Price History</CardTitle>
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
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            Recent Price Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {essential.priceHistory.slice(0, 10).map((entry) => (
              <div
                className="flex flex-col gap-2 border-b pb-2 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                key={entry.id}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm sm:text-base">
                    {formatPrice(entry.price)}
                  </div>
                  <div className="text-muted-foreground text-xs sm:text-sm">
                    {new Date(entry.createdAt).toLocaleString()}
                  </div>
                  {entry.location && (
                    <div className="text-muted-foreground text-xs">
                      {entry.location}
                    </div>
                  )}
                </div>
                {entry.notes && (
                  <div className="text-muted-foreground text-xs sm:max-w-md sm:text-sm">
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

