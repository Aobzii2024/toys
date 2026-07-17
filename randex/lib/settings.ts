import { getSetting } from "./repositories/settings";
import {
  DEFAULT_SITE_ABOUT,
  DEFAULT_SITE_BASIC,
  DEFAULT_SITE_CARDS,
  DEFAULT_SITE_COUPLE,
  DEFAULT_SITE_CUSTOM,
  DEFAULT_SITE_FEATURES,
  DEFAULT_SITE_LEAVING,
} from "./seed";
import type {
  AllSiteSettings,
  SiteAbout,
  SiteBasic,
  SiteCards,
  SiteCouple,
  SiteCustom,
  SiteFeatures,
  SiteLeaving,
} from "./types";
import { SETTINGS_KEYS } from "./types";

function parseOrDefault<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) };
  } catch {
    return fallback;
  }
}

export function getAllSiteSettings(): AllSiteSettings {
  return {
    basic: parseOrDefault<SiteBasic>(
      getSetting(SETTINGS_KEYS.basic),
      DEFAULT_SITE_BASIC,
    ),
    couple: parseOrDefault<SiteCouple>(
      getSetting(SETTINGS_KEYS.couple),
      DEFAULT_SITE_COUPLE,
    ),
    cards: parseOrDefault<SiteCards>(
      getSetting(SETTINGS_KEYS.cards),
      DEFAULT_SITE_CARDS,
    ),
    features: parseOrDefault<SiteFeatures>(
      getSetting(SETTINGS_KEYS.features),
      DEFAULT_SITE_FEATURES,
    ),
    custom: parseOrDefault<SiteCustom>(
      getSetting(SETTINGS_KEYS.custom),
      DEFAULT_SITE_CUSTOM,
    ),
    leaving: parseOrDefault<SiteLeaving>(
      getSetting(SETTINGS_KEYS.leaving),
      DEFAULT_SITE_LEAVING,
    ),
    about: parseOrDefault<SiteAbout>(
      getSetting(SETTINGS_KEYS.about),
      DEFAULT_SITE_ABOUT,
    ),
  };
}
