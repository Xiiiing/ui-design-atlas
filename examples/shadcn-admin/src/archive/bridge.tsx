import { useTheme } from "@/context/theme-provider";
import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { changeLocale, locale, t } from "./i18n";
import { resetDemo } from "./store";
export function ArchiveBridge() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { resolvedTheme: theme, setTheme } = useTheme();
  useEffect(() => {
    if (parent !== window)
      parent.postMessage(
        {
          type: "atlas:preview-state",
          caseId: "shadcn-admin",
          path: pathname,
          locale,
          theme,
        },
        location.origin,
      );
  }, [pathname, theme]);
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (
        e.origin !== location.origin ||
        e.source !== parent ||
        e.data?.type !== "atlas:preview-config"
      )
        return;
      if (["light", "dark"].includes(e.data.theme)) setTheme(e.data.theme);
      if (["en", "zh-CN"].includes(e.data.locale) && e.data.locale !== locale)
        changeLocale(e.data.locale);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [setTheme]);
  if (parent !== window) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted px-4 py-2 text-xs">
      <span>{t("Local demo · adapted from Shadcn Admin")}</span>
      <div className="flex gap-4">
        <button onClick={() => changeLocale(locale === "en" ? "zh-CN" : "en")}>
          中文 / English
        </button>
        <button
          onClick={() => {
            if (
              confirm(t("Restore the original sample records and settings."))
            ) {
              resetDemo();
              location.reload();
            }
          }}
        >
          {t("Reset demo")}
        </button>
      </div>
    </div>
  );
}
