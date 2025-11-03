"use client";

import { signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      className="cursor-pointer transition-all hover:brightness-110"
      size="sm"
      variant="destructive"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign Out
    </Button>
  );
}
