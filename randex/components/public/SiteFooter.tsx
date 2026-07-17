import type { AllSiteSettings } from "@/lib/types";

type Props = {
  settings: AllSiteSettings;
};

export function SiteFooter({ settings }: Props) {
  const { basic, custom } = settings;
  const hasIcp = Boolean(basic.icp);
  const hasCopy = Boolean(basic.copyright);

  return (
    <>
      {hasIcp || hasCopy ? (
        <div className="footer-warp">
          <div className="footer">
            {hasIcp ? (
              <p>
                <img src="/style/img/icp.svg" alt="" />
                <a
                  href="https://beian.miit.gov.cn/#/Integrated/index"
                  target="_blank"
                  rel="noreferrer"
                >
                  {basic.icp}
                </a>
              </p>
            ) : null}
            {hasCopy ? <p>{basic.copyright}</p> : null}
          </div>
        </div>
      ) : null}
      {custom.footerCon ? (
        <div dangerouslySetInnerHTML={{ __html: custom.footerCon }} />
      ) : null}
    </>
  );
}
