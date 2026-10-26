declare module "*guidance.json?registry" {
  const records: Array<
    Pick<import("./guidance-types").Guidance, "id" | "name" | "related">
  >;
  export default records;
}
declare module "*tools.json?registry" {
  const records: Array<{ id: string }>;
  export default records;
}
