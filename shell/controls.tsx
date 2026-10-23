import {
  createElement,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { Monitor, Moon, Sun, Menu } from "lucide-react";
import { MarketSelect, MarketMenu } from "./primitives";
import { lockPageScroll } from "./scroll-lock";
import { SelectionGroup } from "../vendor/yingxu-ui/reference/react/SelectionGroup";
import "./theme.css";

// React islands reuse the production controls without replacing the catalog,
// native form values, hash routing or the separately built archived interfaces.
type Island = {
  root: Root;
  kind: string;
  update?: (source: HTMLElement) => void;
};
const islands = new Map<HTMLElement, Island>();
const fields = new Map<string, (value: string) => void>();
const preferenceKey = "atlas-shell-theme";
type Preference = "system" | "light" | "dark";
let currentPreference: Preference;
const systemTheme = matchMedia("(prefers-color-scheme: dark)");
function preference(): Preference {
  try {
    const value = localStorage.getItem(preferenceKey);
    if (value === "light" || value === "dark") return value;
  } catch {}
  return "system";
}
function applyTheme(value: Preference) {
  currentPreference = value;
  document.documentElement.dataset.themePreference = value;
  document.documentElement.dataset.theme =
    value === "system" ? (systemTheme.matches ? "dark" : "light") : value;
  window.dispatchEvent(new Event("atlas:shell-theme"));
}
applyTheme(preference());
systemTheme.addEventListener("change", () => {
  if (currentPreference === "system") applyTheme("system");
});
window.addEventListener("storage", (e) => {
  if (e.key === preferenceKey) {
    applyTheme(preference());
  }
});

function Appearance({ english }: { english: boolean }) {
  const [value, setValue] = useState(() => currentPreference);
  useLayoutEffect(() => {
    const update = () => setValue(currentPreference);
    window.addEventListener("atlas:shell-theme", update);
    return () => window.removeEventListener("atlas:shell-theme", update);
  }, []);
  const Icon = value === "system" ? Monitor : value === "light" ? Sun : Moon;
  const modes: Preference[] = ["system", "light", "dark"];
  const next = modes[(modes.indexOf(value) + 1) % modes.length];
  const labels = english
    ? { system: "Follow system", light: "Light", dark: "Dark" }
    : { system: "跟随系统", light: "浅色", dark: "深色" };
  const description = english
    ? `${labels[value]}; switch to ${labels[next]}`
    : `${labels[value]}；切换为${labels[next]}`;
  return (
    <button
      type="button"
      className="icon-button appearance-trigger"
      data-mode={value}
      aria-label={`${english ? "Atlas appearance" : "图鉴显示模式"}: ${description}`}
      title={description}
      onClick={() => {
        try {
          localStorage.setItem(preferenceKey, next);
        } catch {}
        applyTheme(next);
      }}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}
function MobileNavigation({ source }: { source: HTMLElement }) {
  const english = document.documentElement.lang === "en";
  return (
    <MarketMenu
      ariaLabel={english ? "Main navigation" : "主导航"}
      label={<Menu size={18} aria-hidden="true" />}
      triggerClassName="mobile-nav-trigger"
      items={Array.from(
        document.querySelectorAll<HTMLAnchorElement>(".market-navigation a"),
      ).map((a) => ({
        key: a.hash,
        label: a.getAttribute("aria-label") || a.textContent,
        selected: a.classList.contains("active"),
        onSelect: () => {
          location.hash = a.hash;
        },
      }))}
    />
  );
}
function SelectAdapter({ source }: { source: HTMLSelectElement }) {
  const [value, setValue] = useState(source.value);
  const id = source.id || `filter-${source.name}`;
  useLayoutEffect(() => {
    fields.set(id, setValue);
    return () => {
      fields.delete(id);
    };
  }, [id]);
  const attributes = Object.fromEntries(
    Array.from(source.attributes)
      .filter((a) => a.name.startsWith("data-") || a.name.startsWith("aria-"))
      .map((a) => [a.name, a.value]),
  );
  return (
    <MarketSelect
      {...attributes}
      iconOnly={source.hasAttribute("data-locale")}
      id={id}
      name={source.name || undefined}
      data-shell-field={id}
      form={source.getAttribute("form") || undefined}
      value={value}
      required={source.required}
      disabled={source.disabled}
      onChange={(e) => setValue(e.target.value)}
    >
      {Array.from(source.options).map((o) => (
        <option key={o.value} value={o.value} disabled={o.disabled}>
          {o.textContent}
        </option>
      ))}
    </MarketSelect>
  );
}
export function fieldValue(id: string) {
  return document.querySelector<HTMLSelectElement>(
    `select[data-shell-field="${id}"], select#${id}`,
  )?.value;
}
export function setFieldValue(id: string, value: string) {
  const update = fields.get(id);
  if (update) flushSync(() => update(value));
  else {
    const el = document.getElementById(id) as HTMLSelectElement | null;
    if (el) el.value = value;
  }
}
function selection(source: HTMLElement): ReactNode {
  const attributes = Object.fromEntries(
    Array.from(source.attributes)
      .filter(
        (a) =>
          ![
            "class",
            "data-shell-group",
            "data-shell-key",
            "data-shell-variant",
          ].includes(a.name),
      )
      .map((a) => [a.name, a.value]),
  );
  const children = Array.from(source.children).map((node, i) => {
    const attrs = Object.fromEntries(
      Array.from(node.attributes).map((a) => [
        a.name === "class"
          ? "className"
          : a.name === "tabindex"
            ? "tabIndex"
            : a.name,
        a.value,
      ]),
    );
    return createElement(node.tagName.toLowerCase(), {
      ...attrs,
      key:
        node.getAttribute("data-tab") ||
        node.getAttribute("data-market-mode") ||
        node.getAttribute("data-category") ||
        i,
      dangerouslySetInnerHTML: { __html: node.innerHTML },
    });
  });
  return (
    <SelectionGroup
      {...attributes}
      as={source.tagName === "NAV" ? "nav" : "div"}
      className={source.className}
      variant={
        source.dataset.shellVariant === "underline" ? "underline" : "outline"
      }
      value={
        source.querySelector(
          '.active, [aria-pressed="true"], [aria-selected="true"]',
        )?.textContent
      }
    >
      {children}
    </SelectionGroup>
  );
}

function island(source: HTMLElement, kind: string) {
  const host = document.createElement("span");
  host.dataset.shellMounted = kind;
  if (source.dataset.shellKey) host.dataset.shellKey = source.dataset.shellKey;
  source.replaceWith(host);
  const root = createRoot(host);
  const record: Island = { root, kind };
  islands.set(host, record);
  return { host, root, record };
}
// Retain navigation roots across catalog updates so keyboard focus stays stable.
export function replaceShellHTML(target: Element, html: string) {
  const focused = target.contains(document.activeElement)
    ? (document.activeElement as HTMLElement)
    : null;
  // A select can portal into a dialog or body, outside its own mount. Unmount
  // those controls while their portal parent still exists. Clearing the dialog
  // first would make React remove an already removed portal node.
  for (const [host, record] of islands) {
    if (record.kind !== "selection" && target.contains(host)) {
      record.root.unmount();
      islands.delete(host);
    }
  }

  const retained = new Map(
    Array.from(
      target.querySelectorAll<HTMLElement>(
        "[data-shell-key][data-shell-mounted=selection]",
      ),
    ).map((host) => [host.dataset.shellKey, host]),
  );
  const template = document.createElement("template");
  template.innerHTML = html;
  const updates: (() => void)[] = [];
  for (const source of template.content.querySelectorAll<HTMLElement>(
    "[data-shell-group]",
  )) {
    const host = retained.get(source.dataset.shellKey);
    const record = host && islands.get(host);
    if (host && record?.update) {
      const copy = source.cloneNode(true) as HTMLElement;
      source.replaceWith(host);
      updates.push(() => record.update!(copy));
    }
  }
  target.replaceChildren(template.content);
  updates.forEach((update) => update());
  // Moving a retained root through the template temporarily detaches it. Keep
  // native link focus without moving the document or the horizontal scroller.
  if (focused?.isConnected) focused.focus({ preventScroll: true });
}
let scheduled = false;
export function refreshShellControls() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    for (const [host, record] of islands)
      if (!host.isConnected) {
        record.root.unmount();
        islands.delete(host);
      }
    for (const el of document.querySelectorAll<HTMLSelectElement>(
      "select[data-shell-control]",
    )) {
      if (el.closest("[data-shell-mounted]")) continue;
      const { root } = island(el, "select");
      flushSync(() => root.render(<SelectAdapter source={el} />));
    }
    for (const el of document.querySelectorAll<HTMLElement>(
      "[data-shell-group]",
    )) {
      if (el.closest("[data-shell-mounted]")) continue;
      const { root, record } = island(el, "selection");
      record.update = (source) =>
        flushSync(() => root.render(selection(source)));
      record.update(el);
    }
    for (const el of document.querySelectorAll<HTMLElement>(
      "[data-shell-appearance]",
    )) {
      if (el.closest("[data-shell-mounted]")) continue;
      const { root } = island(el, "appearance");
      flushSync(() =>
        root.render(
          <Appearance english={document.documentElement.lang === "en"} />,
        ),
      );
    }
    for (const el of document.querySelectorAll<HTMLElement>(
      "[data-shell-navigation]",
    )) {
      if (el.closest("[data-shell-mounted]")) continue;
      const { root } = island(el, "navigation");
      flushSync(() => root.render(<MobileNavigation source={el} />));
    }
  });
}
const observer = new MutationObserver(refreshShellControls);
observer.observe(document.body, { childList: true, subtree: true });
const dialogLocks = new Map<HTMLDialogElement, () => void>();
export function showShellDialog(dialog: HTMLDialogElement) {
  if (dialog.open) return;
  // A locale/route update can close and reopen the same dialog before its old
  // close event runs. Release the old owner now; ignore that stale event while
  // the new dialog is open, rather than releasing the new owner's lock.
  dialogLocks.get(dialog)?.();
  const release = lockPageScroll();
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    release();
    dialog.removeEventListener("close", onClose);
    if (dialogLocks.get(dialog) === dispose) dialogLocks.delete(dialog);
  };
  const onClose = () => {
    if (!dialog.open) dispose();
  };
  dialogLocks.set(dialog, dispose);
  dialog.addEventListener("close", onClose);
  dialog.showModal();
}
export function browseScroll() {
  return scrollY;
}
export function scrollBrowseTo(top: number) {
  scrollTo({ top, behavior: "instant" });
}
