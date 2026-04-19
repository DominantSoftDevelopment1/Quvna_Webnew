"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cdnUrl, formatCount } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-5 rounded-xl bg-[var(--bg-card)]">
            <Skeleton className="w-18 h-18 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    );
  }

  if (!users.length) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-sm text-[var(--text-muted)]">Foydalanuvchilar topilmadi</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {users.map((user: UserItem) => (
        <div
          key={user.id}
          className="flex flex-col items-center gap-2 px-3 py-5 rounded-xl bg-[var(--bg-card)] border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
        >
          {user.avatar ? (
            <img
              src={cdnUrl(user.avatar)}
              alt={user.username}
              className="w-16 h-16 rounded-full object-cover border-2 border-[var(--border)]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-[var(--primary)] bg-[var(--primary-muted)]">
              {user.username?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
          <p className="text-[14px] font-semibold text-[var(--text-primary)] text-center line-clamp-1">
            {user.fullName ?? user.username}
          </p>
          <p className="text-[12px] text-[var(--text-muted)] text-center">@{user.username}</p>
          {user.followerCount != null && (
            <p className="text-[11px] text-[var(--text-inactive)] text-center">
              {formatCount(user.followerCount)} obunachi
            </p>
          )}
          <button
            type="button"
            className="mt-1 px-5 py-1.5 rounded-lg border border-[var(--border)] text-[13px] font-semibold text-[var(--text-primary)] bg-transparent hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-[var(--primary-text)] transition-all"
          >
            Kuzatish
          </button>
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
