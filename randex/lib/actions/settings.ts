"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { setSetting } from "@/lib/repositories/settings";
import type {
  SiteBasic,
  SiteCards,
  SiteCouple,
  SiteCustom,
  SiteFeatures,
} from "@/lib/types";
import { SETTINGS_KEYS } from "@/lib/types";

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function bool(formData: FormData, key: string): boolean {
  const v = formData.get(key);
  return v === "on" || v === "true" || v === "1";
}

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/leaving");
  revalidatePath("/little");
  revalidatePath("/photos");
  revalidatePath("/list");
  revalidatePath("/more");
  revalidatePath("/admin/settings");
}

/** Silent save for autosave forms (no redirect). */
export async function updateBasicSettings(formData: FormData): Promise<void> {
  await requireAdmin();
  const data: SiteBasic = {
    title: str(formData, "title"),
    logo: str(formData, "logo"),
    writing: str(formData, "writing"),
    icp: str(formData, "icp"),
    copyright: str(formData, "copyright"),
    bgimg: str(formData, "bgimg"),
  };
  setSetting(SETTINGS_KEYS.basic, data);
  revalidatePublic();
}

export async function updateCoupleSettings(formData: FormData): Promise<void> {
  await requireAdmin();
  const data: SiteCouple = {
    boy: str(formData, "boy"),
    girl: str(formData, "girl"),
    boyQQ: str(formData, "boyQQ"),
    girlQQ: str(formData, "girlQQ"),
    startTime: str(formData, "startTime"),
  };
  setSetting(SETTINGS_KEYS.couple, data);
  revalidatePublic();
}

export async function updateCardsSettings(formData: FormData): Promise<void> {
  await requireAdmin();
  const data: SiteCards = {
    card1: str(formData, "card1"),
    card2: str(formData, "card2"),
    card3: str(formData, "card3"),
    deci1: str(formData, "deci1"),
    deci2: str(formData, "deci2"),
    deci3: str(formData, "deci3"),
  };
  setSetting(SETTINGS_KEYS.cards, data);
  revalidatePublic();
}

export async function updateFeaturesSettings(
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const data: SiteFeatures = {
    animation: bool(formData, "animation"),
    pjax: bool(formData, "pjax"),
    blur: bool(formData, "blur"),
  };
  setSetting(SETTINGS_KEYS.features, data);
  revalidatePublic();
}

export async function updateCustomSettings(formData: FormData): Promise<void> {
  await requireAdmin();
  const data: SiteCustom = {
    headCon:
      typeof formData.get("headCon") === "string"
        ? (formData.get("headCon") as string)
        : "",
    footerCon:
      typeof formData.get("footerCon") === "string"
        ? (formData.get("footerCon") as string)
        : "",
    cssCon:
      typeof formData.get("cssCon") === "string"
        ? (formData.get("cssCon") as string)
        : "",
  };
  setSetting(SETTINGS_KEYS.custom, data);
  revalidatePublic();
}
