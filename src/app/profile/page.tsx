import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { auth } from "~/server/auth";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {session.user.image && (
                <Image
                  alt={session.user.name ?? "User"}
                  className="rounded-full"
                  height={80}
                  src={session.user.image}
                  width={80}
                />
              )}
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold">{session.user.name}</h2>
                {session.user.email && (
                  <p className="text-muted-foreground">{session.user.email}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{session.user.name}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{session.user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Type</span>
              <span className="font-medium">Free</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/">
              <Button className="w-full" variant="outline">
                View Watchlist
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full" variant="outline">
                Price Alerts
              </Button>
            </Link>
            <Link href="/api/auth/signout">
              <Button className="w-full" variant="destructive">
                Sign Out
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

