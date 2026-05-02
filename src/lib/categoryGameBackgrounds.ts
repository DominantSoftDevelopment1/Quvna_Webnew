/**
 * Category hero backgrounds — shared by donate detail and rating tabs
 * (same game art + overlays as donate pages).
 */
export type GameCategoryId = "pubg" | "ml" | "freefire" | "steam";

export type CategoryAmbientBg = {
  image: string;
  overlay: string;
  /** CSS background-position when not default `center` */
  position?: string;
};

export const GAME_CATEGORY_BACKGROUND: Record<GameCategoryId, CategoryAmbientBg> = {
  pubg: {
    image: "/images/profile-games/pubgmobile.png",
    overlay:
      "linear-gradient(90deg, rgba(5,10,8,0.72) 0%, rgba(5,10,8,0.45) 40%, rgba(5,10,8,0.72) 100%)",
  },
  ml: {
    image: "/images/profile-games/mobilelegends.png",
    overlay:
      "linear-gradient(90deg, rgba(5,10,8,0.72) 0%, rgba(5,10,8,0.45) 40%, rgba(5,10,8,0.72) 100%)",
  },
  freefire: {
    image: "/images/profile-games/freefire.png",
    overlay:
      "radial-gradient(circle at 86% 34%, rgba(255,130,32,0.32) 0%, rgba(255,130,32,0) 38%), radial-gradient(circle at 72% 72%, rgba(255,180,80,0.18) 0%, rgba(255,180,80,0) 46%), linear-gradient(90deg, rgba(10,6,3,0.82) 0%, rgba(10,6,3,0.52) 44%, rgba(10,6,3,0.84) 100%)",
  },
  steam: {
    image: "/images/profile-games/steam.png",
    overlay:
      "radial-gradient(circle at 70% 35%, rgba(0,120,255,0.22) 0%, transparent 35%), linear-gradient(90deg, rgba(3,7,13,0.92) 0%, rgba(3,7,13,0.72) 45%, rgba(3,7,13,0.90) 100%)",
    position: "center center",
  },
};

/** Maps rating API tab type → donate-style category id */
export const RATING_TAB_TO_CATEGORY: Record<string, GameCategoryId> = {
  PUBG_UC: "pubg",
  ML: "ml",
  FREE_FIRE: "freefire",
  STEAM: "steam",
};

/** Full-bleed fixed layer behind scroll content (donate + rating) */
export const CATEGORY_AMBIENT_BG_CLASS =
  "fixed inset-x-0 -top-16 -bottom-16 z-0 w-full bg-cover bg-center bg-no-repeat pointer-events-none";
