import type { PropsWithChildren } from "react";
import { AntProvider } from "../../archive/ant-provider";
import { locale } from "../../archive/i18n";
import "./styles.css";
export const text = (zh: string, en: string) => (locale === "en" ? en : zh);
export function Surface({ children }: PropsWithChildren) {
  return (
    <AntProvider>
      <div className="atlas-composition">{children}</div>
    </AntProvider>
  );
}
