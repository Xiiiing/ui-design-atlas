import type { PropsWithChildren } from "react";
import { locale } from "../../archive/i18n";
import "./styles.css";
export const text = (zh: string, en: string) => (locale === "en" ? en : zh);
export function Stage({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return <div className={"intake-demo " + className}>{children}</div>;
}
