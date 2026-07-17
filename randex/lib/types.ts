export type User = {
  id: number;
  username: string;
  password_hash: string;
  display_name: string;
  qq: string;
  created_at: string;
};

export type Post = {
  id: number;
  title: string;
  author: string;
  body_md: string;
  /** JSON-backed image URL list for Moments-style posts */
  images: string[];
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: number;
  name: string;
  qq: string;
  body: string;
  ip: string;
  city: string | null;
  created_at: string;
};

export type Photo = {
  id: number;
  taken_on: string | null;
  caption: string | null;
  url: string;
  created_at: string;
};

export type LoveItem = {
  id: number;
  title: string;
  done: number;
  image_url: string | null;
  sort_order: number;
  /** 1 = pinned to top; multiple pins allowed */
  pinned: number;
  created_at: string;
};

export type IpBlock = {
  id: number;
  ip: string;
  reason: string | null;
  created_at: string;
};

export type AuditLog = {
  id: number;
  kind: string;
  ip: string | null;
  detail: string | null;
  created_at: string;
};

export type SiteBasic = {
  title: string;
  logo: string;
  writing: string;
  icp: string;
  copyright: string;
  bgimg: string;
};

export type SiteCouple = {
  boy: string;
  girl: string;
  boyQQ: string;
  girlQQ: string;
  startTime: string;
};

export type SiteCards = {
  card1: string;
  card2: string;
  card3: string;
  deci1: string;
  deci2: string;
  deci3: string;
};

export type SiteFeatures = {
  animation: boolean;
  pjax: boolean;
  blur: boolean;
};

export type SiteCustom = {
  headCon: string;
  footerCon: string;
  cssCon: string;
};

export type SiteLeaving = {
  displayLimit: number;
  blockedWords: string[];
  blockedChars: string;
};

export type SiteAboutScriptItem = {
  type: "text" | "button";
  content?: string;
  text?: string;
};

export type SiteAbout = {
  title: string;
  aboutimg: string;
  script: SiteAboutScriptItem[];
};

export type AllSiteSettings = {
  basic: SiteBasic;
  couple: SiteCouple;
  cards: SiteCards;
  features: SiteFeatures;
  custom: SiteCustom;
  leaving: SiteLeaving;
  about: SiteAbout;
};

export const SETTINGS_KEYS = {
  basic: "site.basic",
  couple: "site.couple",
  cards: "site.cards",
  features: "site.features",
  custom: "site.custom",
  leaving: "site.leaving",
  about: "site.about",
} as const;
