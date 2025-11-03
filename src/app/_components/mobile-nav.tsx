"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { SignOutButton } from "./sign-out-button";

interface MobileNavProps {
  session: {
    user?: {
      email?: string | null;
      image?: string | null;
      name?: string | null;
    };
  } | null;
}

export function MobileNav({ session }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          ) : (
            <path
              d="M4 6h16M4 12h16M4 18h16"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          )}
        </svg>
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b border-border bg-background p-4 shadow-lg">
          <nav className="flex flex-col gap-4">
            {/* Navigation Links */}
            <Link
              className="hover:text-primary rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
              href="/"
              onClick={() => setIsOpen(false)}
            >
              Essentials
            </Link>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* User Section */}
            {session ? (
              <>
                <Link
                  className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent"
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                >
                  {session.user?.image && (
                    <Image
                      alt={session.user.name ?? "User"}
                      className="rounded-full"
                      height={32}
                      src={session.user.image}
                      width={32}
                    />
                  )}
                  <span className="text-sm font-medium">
                    {session.user?.name ?? "Profile"}
                  </span>
                </Link>

                <div onClick={() => setIsOpen(false)}>
                  <SignOutButton />
                </div>
              </>
            ) : (
              <Link href="/api/auth/signin" onClick={() => setIsOpen(false)}>
                <Button className="w-full cursor-pointer" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}

