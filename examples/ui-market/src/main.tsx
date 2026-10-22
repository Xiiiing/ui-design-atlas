import React, { Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, useTheme } from "next-themes";
import { MotionConfig } from "motion/react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./styles/index.css";
import { demos } from "./registry";
import { PreviewSettings } from "./archive/settings";
import { locale, setLocale, t, localizeDemo } from "./archive/i18n";
class Boundary extends React.Component<
  React.PropsWithChildren,
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="demo-error" role="alert">
        {t("Preview could not be loaded.")}
        <button onClick={() => location.reload()}>{t("Retry")}</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function App() {
  const params = new URLSearchParams(location.search),
    id = params.get("item") || "magicui-border-beam",
    thumb = params.has("thumb");
  const [language, languageChanged] = useState(locale),
    [revision, replay] = useState(0),
    [duration, setDuration] = useState(id === "magicui-shimmer-button" ? 3 : 8),
    [quantity, setQuantity] = useState(100),
    [value, setValue] = useState(100);
  const { setTheme, resolvedTheme } = useTheme();
  const Demo = demos[id as keyof typeof demos];
  useEffect(() => {
    document.documentElement.lang = language;
    setLocale(language);
    return localizeDemo();
  }, [language]);
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== parent) return;
      if (e.data?.type === "atlas:preview-config") {
        if (["light", "dark"].includes(e.data.theme)) setTheme(e.data.theme);
        if (["en", "zh-CN"].includes(e.data.locale)) {
          setLocale(e.data.locale);
          languageChanged(e.data.locale);
        }
      }
      if (e.data?.type === "atlas:replay") replay((x) => x + 1);
    };
    window.addEventListener("message", handler);
    const key = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        !e.defaultPrevented &&
        !document.querySelector(
          '[role="dialog"],[role="alertdialog"],dialog[open]',
        )
      )
        parent.postMessage({ type: "atlas:escape" }, location.origin);
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("message", handler);
      window.removeEventListener("keydown", key);
    };
  }, [setTheme]);
  return (
    <>
      {!thumb && (
        <div className="demo-controls">
          <span>
            {id} · {t("Local archive preview")}
          </span>
          <button onClick={() => replay((x) => x + 1)}>{t("Replay")}</button>
          <button
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            {t("Toggle theme")}
          </button>
          {["magicui-border-beam", "magicui-shimmer-button"].includes(id) && (
            <label>
              {t("Duration (seconds)")}
              <input
                aria-label="Duration"
                type="number"
                min={1}
                max={20}
                value={duration}
                onChange={(e) =>
                  setDuration(Math.max(1, Math.min(20, Number(e.target.value))))
                }
              />
            </label>
          )}
          {id === "magicui-particles" && (
            <label>
              {t("Particle count")}
              <input
                aria-label="Particle count"
                type="number"
                min={10}
                max={250}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.max(10, Math.min(250, Number(e.target.value))),
                  )
                }
              />
            </label>
          )}
          {id === "magicui-number-ticker" && (
            <label>
              {t("Target value")}
              <input
                aria-label="Target value"
                type="number"
                min={0}
                max={99999}
                value={value}
                onChange={(e) =>
                  setValue(Math.max(0, Math.min(99999, Number(e.target.value))))
                }
              />
            </label>
          )}
        </div>
      )}
      <PreviewSettings value={{ duration, quantity, value }}>
        <MotionConfig reducedMotion="user">
          <div
            className="demo-surface"
            data-source={
              id.startsWith("magicui")
                ? "magicui"
                : id.startsWith("shadcn")
                  ? "blocks"
                  : "library"
            }
            style={{ minHeight: thumb ? "100svh" : "calc(100svh - 49px)" }}
          >
            <div key={`${revision}-${language}`}>
              <Boundary>
                <Suspense fallback={<p>{t("Loading preview…")}</p>}>
                  {Demo ? (
                    <Demo />
                  ) : (
                    <p role="alert">{t("Resource not found.")}</p>
                  )}
                </Suspense>
              </Boundary>
            </div>
          </div>
        </MotionConfig>
      </PreviewSettings>
    </>
  );
}
createRoot(document.querySelector("#root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme={
      new URLSearchParams(location.search).get("theme") === "dark"
        ? "dark"
        : "light"
    }
    enableSystem={false}
    forcedTheme={undefined}
    storageKey="atlas:ui-market:theme"
  >
    <App />
  </ThemeProvider>,
);
