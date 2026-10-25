export type Locale = "zh-CN" | "en";
export type Theme = "light" | "dark";
export type Localized<T = string> = Record<Locale, T>;
export type ResourceType = "component" | "block" | "page" | "case";
export type Category =
  keyof typeof import("../content/taxonomy.json").categories;
export type Interaction =
  keyof typeof import("../content/taxonomy.json").interactions;
export type VisualStyle =
  keyof typeof import("../content/taxonomy.json").styles;
export type Technology =
  keyof typeof import("../content/taxonomy.json").technologies;
export interface Resource {
  id: string;
  type: ResourceType;
  key?: string;
  name: Localized;
  description: Localized;
  sourceId: string;
  libraryIds: string[];
  libraryVersions?: Record<string, string>;
  tags?: Localized<string[]>;
  cover: string;
  category: Category;
  categories: Category[];
  interactions: Interaction[];
  styleIds: VisualStyle[];
  technologyIds: Technology[];
  provenance: "original" | "open-source";
  aliases?: string[];
  scene?: Localized;
  source?: "original" | "open-source";
  path?: string;
  kind?: string;
  kindId?: string;
  tokens?: Record<string, string>;
  prompt?: Localized;
  stylePrompt?: Localized;
  motion?: boolean;
  styleId: string;
  style: Localized;
  audience: string;
  caseId?: string;
  pageIds?: string[];
  preview: {
    width: number;
    height: number;
    url?: string;
    mode?: "inline" | "canvas";
  };
  files?: string[];
  supportFiles?: string[];
  pages?: CasePage[];
  principle?: Localized;
  rules?: Localized<string[]>;
  useCases?: Localized;
  originalUrl?: string;
  sourceUrl?: string;
}
export type View =
  | ResourceType
  | "discover"
  | "explore"
  | "favorites"
  | "motion"
  | "components"
  | "blocks"
  | "pages"
  | "cases"
  | "resources"
  | "guide";
export interface Route {
  view: View;
  id?: string;
  params: URLSearchParams;
}
export interface BrowseState {
  hash: string;
  scroll: number;
  limit: number;
  focus?: string;
  focusSelector?: string;
  items?: string[];
}
export interface AppState {
  locale: Locale;
  favorites: Set<string>;
  route: Route;
  selected: Resource | null;
  detailResource: Resource | null;
  tab: "notes" | "code";
  theme: Theme;
  width: number;
  fit: boolean;
  limit: number;
  previewLoadTimer: ReturnType<typeof setTimeout> | undefined;
  viewerThemeTarget: Theme | null;
  browseFiltersExpanded: boolean | undefined;
  originBrowse: BrowseState | null;
  currentFiles: Record<string, string>;
  previewValues: Map<string, number>;
  renderedNavigation: string | undefined;
  previewResizeObserver: ResizeObserver | null;
}
export type Translate = (zh: string, en: string) => string;
export type Localize = <T>(value: T | Localized<T>) => T;
export type Href = (
  view?: string,
  id?: string,
  params?: Record<string, string>,
) => string;
export interface BaseDependencies {
  appState: AppState;
  t: Translate;
  l: Localize;
  href: Href;
}
export type Card = (resource: Resource) => string;
export type LoadCode = (
  resource: Resource,
  scope?: string,
) => Promise<boolean | undefined>;
export interface SourceManifest {
  files: Record<string, string>;
  entryFiles?: string[];
  instructions?: Localized<string[]>;
  install?: string;
}
// Exact selectors for authored shell elements; arbitrary selectors stay HTMLElement.
interface DOMSelectors {
  "#case-preview": HTMLIFrameElement;
  "#search-dialog": HTMLDialogElement;
  "#asset-dialog": HTMLDialogElement;
  "#copy-fallback": HTMLDialogElement;
  "dialog[open]": HTMLDialogElement;
  "#asset-dialog[open]": HTMLDialogElement;
  "#filters": HTMLFormElement;
  "#quick-search": HTMLInputElement;
  "#import-favorites": HTMLInputElement;
  "[data-preview-setting]": HTMLInputElement;
  "[name=q]": HTMLInputElement;
  "[name=category]": HTMLInputElement;
  "#filters [name=q]": HTMLInputElement;
  "#filters [name=category]": HTMLInputElement;
  "#filters select, #filters input[name=category]":
    | HTMLSelectElement
    | HTMLInputElement;
  "#fallback-text": HTMLTextAreaElement;
  "#standalone": HTMLAnchorElement;
  "[data-market-mode]": HTMLAnchorElement;
  "#search-results a": HTMLAnchorElement;
  "select.atlas-select-native": HTMLSelectElement;
  "img[data-cover]": HTMLImageElement;
}
export type DOMElement<S extends string> = S extends keyof DOMSelectors
  ? DOMSelectors[S]
  : S extends keyof HTMLElementTagNameMap
    ? HTMLElementTagNameMap[S]
    : S extends `#filters [name="${string}"]`
      ? HTMLInputElement | HTMLSelectElement
      : HTMLElement;
export interface CasePage {
  id: string;
  key: string;
  path?: string;
  name: Localized;
}
export interface Case {
  id: string;
  source: string;
  name: Localized;
  pages: CasePage[];
  principle: Localized;
  rules: Localized<string[]>;
  scene: Localized;
}
export interface Source {
  id: string;
  name: string;
  author: string;
  repo: string;
  license: string;
  docs?: string;
  commit?: string;
  licenseFile?: string;
  original?: boolean;
}
export interface Library {
  id: string;
  name: string;
  version: string;
  docs: string;
  aliases?: string[];
}
