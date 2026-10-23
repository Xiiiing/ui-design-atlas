import { Button } from "@/components/ui/button";
import { MetricCards } from "@/features/dashboard/components/metric-cards";
import { Overview } from "@/features/dashboard/components/overview";
import { ProfileForm } from "@/features/settings/profile/profile-form";
import { TasksDialogs } from "@/features/tasks/components/tasks-dialogs";
import { TasksMutateDrawer } from "@/features/tasks/components/tasks-mutate-drawer";
import { TasksProvider } from "@/features/tasks/components/tasks-provider";
import { TasksTable } from "@/features/tasks/components/tasks-table";
import { UsersActionDialog } from "@/features/users/components/users-action-dialog";
import { useEffect, useState } from "react";
import { t } from "./i18n";
import { useRows } from "./store";
export function ComponentPreview({ id }: { id: string }) {
  useEffect(() => {
    if (parent !== window)
      parent.postMessage(
        { type: "atlas:inline-ready", resourceId: `shadcn-admin-${id}` },
        location.origin,
      );
  }, [id]);
  const [open, setOpen] = useState(
    new URLSearchParams(location.search).has("thumb"),
  );
  const tasks = useRows("tasks");
  return (
    <div
      className={"p-6 " + (id === "filter-toolbar" ? "archive-toolbar" : "")}
    >
      {id === "metric-cards" && <MetricCards />}
      {id === "trend-chart" && (
        <div className="max-w-3xl">
          <Overview />
        </div>
      )}
      {(id === "task-table" || id === "filter-toolbar") && (
        <TasksProvider>
          <TasksTable data={tasks} />
          <TasksDialogs />
        </TasksProvider>
      )}
      {id === "task-drawer" && (
        <>
          <Button onClick={() => setOpen(true)}>{t("Create Task")}</Button>
          <TasksMutateDrawer open={open} onOpenChange={setOpen} />
        </>
      )}
      {id === "user-dialog" && (
        <>
          <Button onClick={() => setOpen(true)}>{t("Add User")}</Button>
          <UsersActionDialog open={open} onOpenChange={setOpen} />
        </>
      )}
      {id === "settings-form" && (
        <div className="max-w-2xl">
          <ProfileForm />
        </div>
      )}
    </div>
  );
}
