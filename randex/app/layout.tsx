import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Randex",
  description: "喜欢花 喜欢浪漫 喜欢你~ — Randex 情侣小站",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/style/css/index.css?v=rx20260717" />
        <link rel="stylesheet" href="/style/css/leaving.css?v=rx20260717" />
        <link rel="stylesheet" href="/style/css/little.css?v=rx20260717" />
        <link rel="stylesheet" href="/style/css/about.css?v=rx20260717" />
        <link rel="stylesheet" href="/style/css/list.css?v=rx20260717" />
        <link rel="stylesheet" href="/style/css/loveImg.css?v=rx20260717" />
        <link rel="stylesheet" href="/style/css/animate.min.css" />
        <link rel="stylesheet" href="/style/css/loadinglike.css" />
        <link rel="stylesheet" href="/style/css/nprogress.css" />
        <link rel="stylesheet" href="/style/Font/font_list/iconfont.css" />
        <link rel="stylesheet" href="/style/toastr/toastr.css" />
        <link rel="stylesheet" href="/botui/botui.min.css" />
        <link rel="stylesheet" href="/botui/botui-theme-default.css" />
        <style>{`
          .wenan, .alogo { color: rgb(97 97 97); transition: all 0.2s linear; }
          .Blurkg {
            backdrop-filter: blur(0px) !important;
            -webkit-backdrop-filter: blur(0px) !important;
            background: transparent !important;
          }
          .delay-03s { -webkit-animation-delay: .3s; animation-delay: .3s; }
          .icon {
            width: 1.5em; height: 1.5em; vertical-align: -0.3em;
            fill: currentColor; overflow: hidden;
          }
          li.cike { border-bottom: 1px solid #ddd; }
          li { list-style-type: none; }
          .avatar {
            width: 3em; height: 3em; border-radius: 50%;
            box-shadow: 0 2px 20px #c5c5c575; border: 2px solid #fff;
            margin-right: 0.8rem;
          }
          button:disabled { background: #888; opacity: 0.6; }
        `}</style>
      </head>
      <body>
        {children}
        <Script
          src="/style/jquery/jquery.min.js"
          strategy="beforeInteractive"
        />
        <Script src="/style/js/nprogress.js" strategy="lazyOnload" />
        <Script src="/style/toastr/toastr.js" strategy="lazyOnload" />
        <Script src="/style/js/funlazy.min.js" strategy="lazyOnload" />
        <Script
          src="/style/pagelir/spotlight.bundle.js"
          strategy="lazyOnload"
        />
        <Script src="/style/Font/font_list/iconfont.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
