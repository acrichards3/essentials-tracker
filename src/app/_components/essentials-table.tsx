"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";

export function EssentialsTable() {
  const { data: essentials, isLoading } = api.essential.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">1h %</TableHead>
              <TableHead className="text-right">24h %</TableHead>
              <TableHead className="text-right">7d %</TableHead>
              <TableHead className="text-right">Avg Price (30d)</TableHead>
              <TableHead className="text-right">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-6" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-12" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-12" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-12" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-12" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-3 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!essentials || essentials.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          No essentials data available. Run the gas price fetcher to populate
          data.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">1h %</TableHead>
            <TableHead className="text-right">24h %</TableHead>
            <TableHead className="text-right">7d %</TableHead>
            <TableHead className="text-right">Avg Price (30d)</TableHead>
            <TableHead className="text-right">Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {essentials.map((item, index) => (
            <EssentialRow essential={item} key={item.id} rank={index + 1} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EssentialRow({
  essential,
  rank,
}: {
  essential: {
    category: string;
    createdAt: Date;
    icon: string;
    id: number;
    latestPrice: string | null;
    latestPriceDate: Date | null;
    name: string;
    unit: string;
  };
  rank: number;
}) {
  const { data: stats, isLoading: statsLoading } = api.essential.getStats.useQuery({
    essentialId: essential.id,
  });

  const formatChange = (change: string | null) => {
    if (!change) return "N/A";
    const value = parseFloat(change);
    return value >= 0 ? `+${change}%` : `${change}%`;
  };

  const isPositive = (change: string | null) => {
    if (!change) return true;
    return parseFloat(change) >= 0;
  };

  const formatPrice = (price: string | null) => {
    if (!price) return "N/A";
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium">{rank}</TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{essential.icon}</span>
          <div className="flex flex-col">
            <span className="font-semibold">{essential.name}</span>
            <span className="text-muted-foreground text-xs">
              {essential.unit}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{essential.category}</Badge>
      </TableCell>
      <TableCell className="text-right font-semibold">
        {formatPrice(essential.latestPrice)}
      </TableCell>
      <TableCell className="text-right">
        {statsLoading ? (
          <Skeleton className="ml-auto h-4 w-12" />
        ) : (
          <span
            className={
              isPositive(stats?.change1h ?? null)
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {formatChange(stats?.change1h ?? null)}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {statsLoading ? (
          <Skeleton className="ml-auto h-4 w-12" />
        ) : (
          <span
            className={
              isPositive(stats?.change24h ?? null)
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {formatChange(stats?.change24h ?? null)}
          </span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {statsLoading ? (
          <Skeleton className="ml-auto h-4 w-12" />
        ) : (
          <span
            className={
              isPositive(stats?.change7d ?? null)
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {formatChange(stats?.change7d ?? null)}
          </span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-right">
        {statsLoading ? (
          <Skeleton className="ml-auto h-4 w-16" />
        ) : (
          stats?.avgPrice30d ? `$${stats.avgPrice30d}` : "N/A"
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-right text-xs">
        {formatDate(essential.latestPriceDate)}
      </TableCell>
    </TableRow>
  );
}
