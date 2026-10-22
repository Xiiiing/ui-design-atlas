import { taskSchema } from "@/features/tasks/data/schema";
import { userSchema } from "@/features/users/data/schema";
import { tasks } from "@/features/tasks/data/tasks";
import { users } from "@/features/users/data/users";
import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { t } from "./i18n";
const prefix = "atlas:shadcn-admin:v1:";
export function readSaved<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(prefix + key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
export function saveSetting(key: string, value: unknown) {
  try {
    localStorage.setItem(prefix + key, JSON.stringify(value));
    toast.success(t("Saved locally"));
  } catch {
    toast.error(t("Storage unavailable. Changes last for this session."));
  }
}
const listeners = new Set<() => void>();
const records: Record<string, any[]> = {
  tasks: readSaved("tasks", tasks),
  users: readSaved("users", users),
};
for (const key of ["tasks", "users"])
  if (
    !Array.isArray(records[key]) ||
    !records[key].every(
      (r) => (key === "tasks" ? taskSchema : userSchema).safeParse(r).success,
    )
  )
    records[key] = key === "tasks" ? tasks : users;
export function useRows(key: "tasks" | "users") {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => records[key],
  );
}
export function mutateRows(
  key: "tasks" | "users",
  update: (rows: any[]) => any[],
) {
  records[key] = update(records[key]);
  saveSetting(key, records[key]);
  listeners.forEach((fn) => fn());
}
export function upsertRow(
  key: "tasks" | "users",
  values: Record<string, unknown>,
  id?: string,
) {
  const now = new Date().toISOString();
  const { password, confirmPassword, isEdit, ...safe } = values;
  void password;
  void confirmPassword;
  void isEdit;
  mutateRows(key, (rows) =>
    id
      ? rows.map((row) =>
          row.id === id ? { ...row, ...safe, updatedAt: now } : row,
        )
      : [
          {
            id:
              key === "tasks"
                ? `TASK-${crypto.randomUUID().slice(0, 8)}`
                : crypto.randomUUID(),
            status: "active",
            createdAt: now,
            updatedAt: now,
            ...safe,
          },
          ...rows,
        ],
  );
}
export function removeRows(key: "tasks" | "users", ids: string[]) {
  mutateRows(key, (rows) => rows.filter((row) => !ids.includes(row.id)));
}
export function resetDemo() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => localStorage.removeItem(k));
    [
      "atlas-shadcn-theme",
      "atlas-shadcn-font",
      "atlas-shadcn-sidebar_state",
    ].forEach((k) => (document.cookie = `${k}=; Max-Age=0; path=/`));
  } catch {}
  records.tasks = tasks;
  records.users = users;
  listeners.forEach((fn) => fn());
}
