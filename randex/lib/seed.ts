import { env } from "./env";
import type { DbLike } from "./db-types";
import type {
  SiteAbout,
  SiteBasic,
  SiteCards,
  SiteCouple,
  SiteCustom,
  SiteFeatures,
  SiteLeaving,
} from "./types";
import { SETTINGS_KEYS } from "./types";

export const DEFAULT_SITE_BASIC: SiteBasic = {
  title: "Randex",
  logo: "Randex",
  writing: "喜欢花 喜欢浪漫 喜欢你~",
  icp: "",
  copyright: "Copyright © 2022 - 2026 Randex All Rights Reserved.",
  bgimg: "/style/img/Cover.webp",
};

export const DEFAULT_SITE_COUPLE: SiteCouple = {
  boy: "Ki",
  girl: "Li",
  boyQQ: "10000",
  girlQQ: "10001",
  startTime: "2022-06-05T00:07",
};

export const DEFAULT_SITE_CARDS: SiteCards = {
  card1: "点点滴滴",
  card2: "留言板",
  card3: "关于我们",
  deci1: "有人愿意听你碎碎念念也很浪漫",
  deci2: "在这里写下我们的留言祝福",
  deci3: "我们之间认识的经历回忆",
};

export const DEFAULT_SITE_FEATURES: SiteFeatures = {
  animation: true,
  pjax: true,
  blur: true,
};

export const DEFAULT_SITE_CUSTOM: SiteCustom = {
  headCon: "<!-- 这里可以嵌入自定义字体CDN加速地址 -->",
  footerCon: "",
  cssCon: "/* 这里可以写入自定义CSS样式内容 无需带 style 标签 */",
};

export const DEFAULT_SITE_LEAVING: SiteLeaving = {
  displayLimit: 100,
  blockedWords: ["操", "垃圾", "傻逼", "妈"],
  blockedChars: "",
};

export const DEFAULT_SITE_ABOUT: SiteAbout = {
  title: "Randex",
  aboutimg: "",
  script: [
    { type: "text", content: "Hi, 欢迎你的来访" },
    { type: "text", content: "愿得一人心 白首不相离" },
    { type: "text", content: "记录日常生活 留住感动" },
    { type: "button", text: "听我介绍" },
    { type: "text", content: "情侣小站 Randex 记录我们的点点滴滴" },
    { type: "text", content: "欢迎您的来访，请尽情浏览本站～" },
  ],
};

const DEFAULT_SETTINGS: Record<string, unknown> = {
  [SETTINGS_KEYS.basic]: DEFAULT_SITE_BASIC,
  [SETTINGS_KEYS.couple]: DEFAULT_SITE_COUPLE,
  [SETTINGS_KEYS.cards]: DEFAULT_SITE_CARDS,
  [SETTINGS_KEYS.features]: DEFAULT_SITE_FEATURES,
  [SETTINGS_KEYS.custom]: DEFAULT_SITE_CUSTOM,
  [SETTINGS_KEYS.leaving]: DEFAULT_SITE_LEAVING,
  [SETTINGS_KEYS.about]: DEFAULT_SITE_ABOUT,
};

function nowIso() {
  return new Date().toISOString();
}

function countTable(db: DbLike, table: string): number {
  const row = db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as {
    c: number;
  };
  return Number(row?.c ?? 0);
}

function upsertSetting(db: DbLike, key: string, value: unknown) {
  const existing = db
    .prepare(`SELECT key FROM site_settings WHERE key = ?`)
    .get(key);
  if (existing) return;
  db.prepare(
    `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)`,
  ).run(key, JSON.stringify(value), nowIso());
}

export function seedIfEmpty(db: DbLike) {
  // Users are managed by ensureCoupleAccounts() after settings seed.
  // Keep a temporary admin only if completely empty and couple seed fails later.
  if (countTable(db, "users") === 0) {
    /* couple accounts created in getDb() via ensureCoupleAccounts */
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    upsertSetting(db, key, value);
  }

  if (env.seedDemo() && countTable(db, "posts") === 0) {
    const ts = nowIso();
    db.prepare(
      `INSERT INTO posts (title, author, body_md, images, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      "我们的第一篇记录",
      "宝宝然",
      "这是 Randex 的示例文章。\n\n记录喜欢花、喜欢浪漫、喜欢你的日子。",
      "[]",
      ts,
      ts,
    );

    if (countTable(db, "photos") === 0) {
      db.prepare(
        `INSERT INTO photos (taken_on, caption, url, created_at)
         VALUES (?, ?, ?, ?)`,
      ).run(
        "2022-06-05",
        "在一起的第一天",
        "https://lovey.kikiw.cn/Style/img/Cover.webp",
        ts,
      );
    }

    if (countTable(db, "love_items") === 0) {
      const insertItem = db.prepare(
        `INSERT INTO love_items (title, done, image_url, sort_order, pinned, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      );
      insertItem.run("一起看一场电影", 1, null, 0, 0, ts);
      insertItem.run("一起去旅行", 0, null, 0, 0, ts);
    }
  }
}
