import { PublicInteractions } from "./PublicInteractions";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import type { AllSiteSettings } from "@/lib/types";

type Props = {
  settings: AllSiteSettings;
  children: React.ReactNode;
};

/** Shared public layout: header avatars + main content + footer. */
export function PublicShell({ settings, children }: Props) {
  return (
    <>
      <SiteHeader settings={settings} />
      <div id="pjax-container">{children}</div>
      <SiteFooter settings={settings} />
      <PublicInteractions />
    </>
  );
}
