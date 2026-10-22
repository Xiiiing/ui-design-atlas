import { z } from "zod";
import en from "zod/v4/locales/en.js";
import zhCN from "zod/v4/locales/zh-CN.js";
import translations from "./zh-CN.json";
export const locale =
  new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh-CN";
document.documentElement.lang = locale;
z.config(locale === "en" ? en() : zhCN());
export function t(text: string): string {
  return locale === "en"
    ? text
    : ((translations as Record<string, string>)[text] ?? text);
}
export function changeLocale(lang: string) {
  const u = new URL(location.href);
  u.searchParams.set("lang", lang);
  location.replace(u.href);
}
