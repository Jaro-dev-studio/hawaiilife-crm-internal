import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsersTable } from "./users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();

  // Check if user is admin
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          User Management
        </h1>
        <p className="text-muted-foreground">
          View and manage all users in the system.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Admins</p>
          <p className="text-2xl font-bold">
            {users.filter((u) => u.role === "admin").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">Regular Users</p>
          <p className="text-2xl font-bold">
            {users.filter((u) => u.role === "user").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">
            New This Month
          </p>
          <p className="text-2xl font-bold">
            {
              users.filter(
                (u) =>
                  new Date(u.createdAt) >
                  new Date(new Date().setMonth(new Date().getMonth() - 1))
              ).length
            }
          </p>
        </div>
      </div>

      {/* Users Table */}
      <UsersTable 
        users={users.map(user => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        }))} 
        currentUserId={session.user.id} 
      />
    </div>
  );
}
