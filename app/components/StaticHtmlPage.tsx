"use client";

import Script from "next/script";

type StaticHtmlPageProps = {
  html: string;
  scripts: string[];
  bodyClass?: string;
};

export default function StaticHtmlPage({
  html,
  scripts,
  bodyClass,
}: StaticHtmlPageProps) {
  return (
    <div className={bodyClass}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {scripts.map((src) => (
        <Script key={src} src={src} strategy="afterInteractive" />
      ))}
    </div>
  );
}
