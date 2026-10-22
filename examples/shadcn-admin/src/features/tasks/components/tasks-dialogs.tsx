import { t } from "@/archive/i18n";
import { removeRows } from "@/archive/store";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TasksMutateDrawer } from "./tasks-mutate-drawer";
import { useTasks } from "./tasks-provider";

export function TasksDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useTasks();
  return (
    <>
      <TasksMutateDrawer
        key="task-create"
        open={open === "create"}
        onOpenChange={() => setOpen("create")}
      />

      {currentRow && (
        <>
          <TasksMutateDrawer
            key={`task-update-${currentRow.id}`}
            open={open === "update"}
            onOpenChange={() => {
              setOpen("update");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key="task-delete"
            destructive
            open={open === "delete"}
            onOpenChange={() => {
              setOpen("delete");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            handleConfirm={() => {
              setOpen(null);
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
              removeRows("tasks", [currentRow.id]);
            }}
            className="max-w-md"
            title={t("Delete") + ": " + currentRow.id + " ?"}
            desc={
              <>
                {t("You are about to delete a task with the ID")}{" "}
                <strong>{currentRow.id}</strong>. <br />
                {t("This action cannot be undone.")}
              </>
            }
            confirmText={t("Delete")}
          />
        </>
      )}
    </>
  );
}
