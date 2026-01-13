"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
}

interface UsersTableProps {
  users: User[];
  currentUserId: string;
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState<string | null>(null);
  const [impersonatePassword, setImpersonatePassword] = React.useState("");
  const [impersonateUserId, setImpersonateUserId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: string) => {
    console.log("[AdminUsers] Changing role for user:", userId, "to:", newRole);
    setIsLoading(userId);
    setError(null);

    try {
      const response = await fetch("/api/admin/users/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update role");
      }

      console.log("[AdminUsers] Role updated successfully");
      router.refresh();
    } catch (err) {
      console.error("[AdminUsers] Error updating role:", err);
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setIsLoading(null);
    }
  };

  const handleImpersonate = async (userId: string) => {
    console.log("[AdminUsers] Attempting to impersonate user:", userId);
    setIsLoading(userId);
    setError(null);

    try {
      const result = await signIn("admin-impersonate", {
        userId,
        adminPassword: impersonatePassword,
        redirect: false,
      });

      if (result?.error) {
        console.log("[AdminUsers] Impersonation failed:", result.error);
        setError("Invalid admin password or cannot impersonate this user");
        return;
      }

      console.log("[AdminUsers] Impersonation successful, redirecting...");
      setImpersonateUserId(null);
      setImpersonatePassword("");
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("[AdminUsers] Error during impersonation:", err);
      setError(err instanceof Error ? err.message : "Failed to impersonate");
    } finally {
      setIsLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.charAt(0).toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}{" "}
              found
            </CardDescription>
          </div>
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Mobile card view */}
        <div className="space-y-4 lg:hidden">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-lg border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <Avatar
                  src={user.image || undefined}
                  fallback={getInitials(user.name, user.email)}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user.name || "No name"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <Badge
                  variant={user.role === "admin" ? "secondary" : "accent"}
                  className="shrink-0"
                >
                  {user.role}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground">
                Joined {formatDate(user.createdAt)}
                {user.id === currentUserId && " (You)"}
              </div>

              <div className="flex flex-wrap gap-2">
                {user.id !== currentUserId && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading === user.id}
                      onClick={() =>
                        handleRoleChange(
                          user.id,
                          user.role === "admin" ? "user" : "admin"
                        )
                      }
                    >
                      {isLoading === user.id ? (
                        <span className="animate-pulse">...</span>
                      ) : user.role === "admin" ? (
                        "Remove Admin"
                      ) : (
                        "Make Admin"
                      )}
                    </Button>

                    {user.role !== "admin" && (
                      <>
                        {impersonateUserId === user.id ? (
                          <div className="flex w-full gap-2 mt-2">
                            <Input
                              type="password"
                              placeholder="Admin password"
                              value={impersonatePassword}
                              onChange={(e) => setImpersonatePassword(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={isLoading === user.id || !impersonatePassword}
                              onClick={() => handleImpersonate(user.id)}
                            >
                              {isLoading === user.id ? "..." : "Go"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setImpersonateUserId(null);
                                setImpersonatePassword("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setImpersonateUserId(user.id)}
                          >
                            Sign in as user
                          </Button>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table view */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted-foreground">User</th>
                <th className="pb-3 font-medium text-muted-foreground">Role</th>
                <th className="pb-3 font-medium text-muted-foreground">Joined</th>
                <th className="pb-3 font-medium text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={cn(
                    "border-b border-border last:border-0",
                    user.id === currentUserId && "bg-primary/5"
                  )}
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={user.image || undefined}
                        fallback={getInitials(user.name, user.email)}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[200px]">
                          {user.name || "No name"}
                          {user.id === currentUserId && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge
                      variant={user.role === "admin" ? "secondary" : "accent"}
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-4 text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-2">
                      {user.id !== currentUserId && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isLoading === user.id}
                            onClick={() =>
                              handleRoleChange(
                                user.id,
                                user.role === "admin" ? "user" : "admin"
                              )
                            }
                          >
                            {isLoading === user.id ? (
                              <span className="animate-pulse">...</span>
                            ) : user.role === "admin" ? (
                              "Remove Admin"
                            ) : (
                              "Make Admin"
                            )}
                          </Button>

                          {user.role !== "admin" && (
                            <>
                              {impersonateUserId === user.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="password"
                                    placeholder="Admin password"
                                    value={impersonatePassword}
                                    onChange={(e) =>
                                      setImpersonatePassword(e.target.value)
                                    }
                                    className="w-40"
                                  />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={
                                      isLoading === user.id || !impersonatePassword
                                    }
                                    onClick={() => handleImpersonate(user.id)}
                                  >
                                    {isLoading === user.id ? "..." : "Go"}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setImpersonateUserId(null);
                                      setImpersonatePassword("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setImpersonateUserId(user.id)}
                                >
                                  Sign in as
                                </Button>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No users found matching your search.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
