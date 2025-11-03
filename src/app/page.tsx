import { Header } from "~/app/_components/header";
import { StatsCards } from "~/app/_components/stats-cards";
import { CategoryTabs } from "~/app/_components/category-tabs";
import { EssentialsTable } from "~/app/_components/essentials-table";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <div className="bg-background min-h-screen">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold">
              Today&apos;s Essential Prices
            </h1>
            <p className="text-muted-foreground text-lg">
              Track real-time prices of everyday essentials across the market
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8">
            <StatsCards />
          </div>

          {/* Category Filter Tabs */}
          <div className="mb-6">
            <CategoryTabs />
          </div>

          {/* Main Table */}
          <div className="mb-8">
            <EssentialsTable />
          </div>

          {/* Footer Info */}
          <div className="border-border/40 bg-muted/50 rounded-lg border p-6">
            <h3 className="mb-2 text-sm font-semibold">
              About EssentialsTracker
            </h3>
            <p className="text-muted-foreground text-sm">
              Track the prices of everyday essentials like groceries, fuel, and
              household items. Our data is aggregated from major retailers and
              updated regularly to help you make informed purchasing decisions.
            </p>
          </div>
        </main>
      </div>
    </HydrateClient>
  );
}
