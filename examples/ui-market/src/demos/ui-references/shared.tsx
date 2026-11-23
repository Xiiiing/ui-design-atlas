import type { PropsWithChildren, ReactNode } from "react";
import { locale } from "../../archive/i18n";
import "./references.css";

export const copy = (zh: string, en: string) => (locale === "en" ? en : zh);

export function ReferencePanel({
  title,
  description,
  children,
  icon,
}: PropsWithChildren<{
  title: string;
  description?: string;
  icon?: ReactNode;
}>) {
  return (
    <section className="refs-panel" aria-label={title}>
      <header className="refs-heading">
        {icon && <span className="refs-emblem">{icon}</span>}
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}
