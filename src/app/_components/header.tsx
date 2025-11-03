import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { SignOutButton } from "./sign-out-button";
import { MobileNav } from "./mobile-nav";

export async function Header() {
  const session = await auth();

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

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              className="hover:text-primary text-sm font-medium transition-colors"
              href="/"
            >
              Essentials
            </Link>
          </nav>
        </div>

        {/* Right side actions - Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          {session && (
            <>
              <Link
                className="flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors hover:bg-accent"
                href="/profile"
              >
                {session.user?.image && (
                  <Image
                    alt={session.user.name ?? "User"}
                    className="rounded-full"
                    height={28}
                    src={session.user.image}
                    width={28}
                  />
                )}
                <span className="text-sm font-medium">
                  {session.user?.name ?? "Profile"}
                </span>
              </Link>

              <SignOutButton />
            </>
          )}
          
          {!session && (
            <Link href="/api/auth/signin">
              <Button className="cursor-pointer" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNav session={session} />
      </div>
    </header>
  );
}
