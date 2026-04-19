"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cdnUrl, formatCount } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { Users } from "lucide-react";

export function UsersTab() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["mediaUsers"],
    queryFn: async () => {
      const { data } = await api.get("/user/profile/all", { params: { page: 0, size: 30 } });
      return data?.data?.content ?? data?.data ?? [];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl" style={{ background: "var(--bg-card)" }}>
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!users.length) return (
    <div className="text-sm py-12 text-center" style={{ color: "var(--text-muted)" }}>
      Foydalanuvchilar topilmadi
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {users.map((user: UserItem) => (
        <div
          key={user.id}
          className="flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
          style={{ background: "var(--bg-card)" }}
        >
          {user.avatar ? (
            <img
              src={cdnUrl(user.avatar)}
              alt={user.username}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
              style={{ background: "var(--primary)" }}
            >
              {user.username?.[0]?.toUpperCase() ?? user.fullName?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
          <div className="text-center">
            <p className="text-sm font-medium line-clamp-1" style={{ color: "var(--text-primary)" }}>
              {user.fullName ?? user.username}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              @{user.username}
            </p>
            {user.followerCount != null && (
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {formatCount(user.followerCount)} obunachi
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface UserItem {
  id: number;
  username: string;
  fullName?: string;
  avatar?: string;
  followerCount?: number;
}
