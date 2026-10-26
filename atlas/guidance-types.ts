import type { Localized, Resource } from "./types";
export type GuidanceKind = "prompt" | "skill" | "design" | "checklist";
export type Purpose =
  | "website"
  | "application"
  | "layout"
  | "motion"
  | "review";
export interface UpstreamFiles {
  source: string;
  entry: string;
  files: string[];
}
interface GuidanceBase {
  id: string;
  name: Localized;
  description: Localized;
  purposes: Purpose[];
  aliases: string[];
  related: string[];
  toolId?: string;
  checked: boolean;
  effect: "unverified";
}
export type Guidance =
  | (GuidanceBase & { kind: "prompt" })
  | (GuidanceBase & { kind: "checklist" })
  | (GuidanceBase & { kind: "skill"; upstream: UpstreamFiles })
  | (GuidanceBase & {
      kind: "design";
      upstream: UpstreamFiles;
      palette: string[];
      typography: Localized;
    });
export interface Tool {
  id: string;
  name: Localized;
  kind: "library" | "skills" | "design" | "learning";
  repo: string;
  description: Localized;
  technologies: string[];
  aliases: string[];
}
export interface GuidanceDetail {
  body: Localized;
  task: Localized;
  usage: Localized;
  original?: Localized;
  checks?: Localized<string[]>;
  files: Record<string, string>;
  entry?: string;
  source?: { repo: string; commit: string; author: string; license: string };
}
export interface ContentHit {
  id: string;
  domain: "ui" | "guidance" | "tool";
  key: string;
  view: string;
  name: Localized;
  description: Localized;
  aliases: unknown;
  context: unknown;
  item: Resource | Guidance | Tool;
}
export interface ComposerDraft {
  version: 1;
  requirements: string;
  audience: string;
  technology: string;
  direction: string;
  template: string;
  design: string;
  reference: string;
  checks: string[];
  skills: string[];
  mode: "chat" | "agent";
  output: string;
}
