/// <reference types="vite/client" />
/// <reference types="node" />

declare module "atlas:resource-names" {
  const entries: Record<
    string,
    { name: Record<"zh-CN" | "en", string>; sourceId: string }
  >;
  export default entries;
}
