import Link from "next/link";
import type { AllSiteSettings } from "@/lib/types";

type Props = {
  settings: AllSiteSettings;
};

export function SiteHeader({ settings }: Props) {
  const { basic, couple, features, custom } = settings;
  const anim = features.animation;
  const blurOff = !features.blur;

  return (
    <>
      {custom.headCon?.trim() ? (
        <div dangerouslySetInnerHTML={{ __html: custom.headCon }} />
      ) : null}
      {custom.cssCon ? <style dangerouslySetInnerHTML={{ __html: custom.cssCon }} /> : null}
      {basic.bgimg ? (
        <style
          dangerouslySetInnerHTML={{
            __html: `.bg-img { background: url(${JSON.stringify(basic.bgimg)}) no-repeat center !important; background-size: cover !important; }`,
          }}
        />
      ) : null}

      <div className="header-wrap">
        <div className="header">
          <div className="logo">
            <h1>
              <Link className="alogo" href="/">
                {basic.logo}
              </Link>
            </h1>
          </div>
          <div className="word">
            <span className="wenan">{basic.writing}</span>
          </div>
        </div>
      </div>

      <div className="bg-wrap">
        <div className="bg-img">
          <div className="central central-800">
            <div
              className={[
                "middle",
                anim ? "animated fadeInDown" : "",
                blurOff ? "Blurkg" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="img-male">
                <img
                  src={`https://q1.qlogo.cn/g?b=qq&nk=${couple.boyQQ}&s=100`}
                  alt={couple.boy}
                  draggable={false}
                />
                <span>{couple.boy}</span>
              </div>
              <div className="love-icon">
                <img src="/style/img/like.svg" alt="" draggable={false} />
              </div>
              <div className="img-female">
                <img
                  src={`https://q1.qlogo.cn/g?b=qq&nk=${couple.girlQQ}&s=100`}
                  alt={couple.girl}
                  draggable={false}
                />
                <span>{couple.girl}</span>
              </div>
            </div>
          </div>
          <svg
            className="waves"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 24 150 28"
            preserveAspectRatio="none"
            shapeRendering="auto"
          >
            <defs>
              <path
                id="gentle-wave"
                d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
              />
            </defs>
            <g className="parallax">
              <use href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
              <use href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
              <use href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
              <use href="#gentle-wave" x="48" y="7" fill="#fff" />
            </g>
          </svg>
        </div>
      </div>
    </>
  );
}
