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
      <div className="users-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="user-card-skeleton">
            <Skeleton className="user-card-avatar-skeleton" />
            <Skeleton className="h-3 w-20 mx-auto mt-2" />
            <Skeleton className="h-3 w-14 mx-auto mt-1" />
          </div>
        ))}
      </div>
    );
  }

  if (!users.length) return (
    <div className="videos-empty">
      <p className="videos-empty-title">Foydalanuvchilar topilmadi</p>
    </div>
  );

  return (
    <div className="users-grid">
      {users.map((user: UserItem) => (
        <div key={user.id} className="user-card group">
          <div className="user-card-avatar-wrap">
            {user.avatar ? (
              <img src={cdnUrl(user.avatar)} alt={user.username} className="user-card-avatar" />
            ) : (
              <div className="user-card-avatar-ph">
                {user.username?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
          </div>
          <p className="user-card-name">{user.fullName ?? user.username}</p>
          <p className="user-card-username">@{user.username}</p>
          {user.followerCount != null && (
            <p className="user-card-followers">{formatCount(user.followerCount)} ta obunachi</p>
          )}
          <button type="button" className="user-card-follow-btn">Kuzatish</button>
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
