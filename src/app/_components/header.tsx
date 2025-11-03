import Link from "next/link";
import { Button } from "~/components/ui/button";

export function Header() {
  return (
    <header className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-2" href="/">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md">
              <span className="text-lg font-bold">E</span>
            </div>
            <span className="text-xl font-bold">EssentialsTracker</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              className="hover:text-primary text-sm font-medium transition-colors"
              href="/"
            >
              Essentials
            </Link>
            <Link
              className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
              href="/trending"
            >
              Trending
            </Link>
            <Link
              className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
              href="/categories"
            >
              Categories
            </Link>
            <Link
              className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
              href="/alerts"
            >
              Price Alerts
            </Link>
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <Button size="sm" variant="ghost">
            Watchlist
          </Button>
          <Button size="sm" variant="ghost">
            Portfolio
          </Button>
          <Button size="sm">Sign In</Button>
        </div>
      </div>
    </header>
  );
}
