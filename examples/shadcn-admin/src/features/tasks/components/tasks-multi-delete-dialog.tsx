import { t } from "@/archive/i18n";
import { removeRows } from "@/archive/store";
("use client");

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Table } from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type TaskMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

const CONFIRM_WORD = "DELETE";

export function TasksMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: TaskMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState("");

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`);
      return;
    }

    onOpenChange(false);

    removeRows(
      "tasks",
      selectedRows.map((row) => (row.original as { id: string }).id),
    );
    setValue("");
    table.resetRowSelection();
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form="tasks-multi-delete-form"
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="me-1 inline-block stroke-destructive"
            size={18}
          />{" "}
          {t("Delete")}
          {selectedRows.length} {selectedRows.length > 1 ? "tasks" : "task"}
        </span>
      }
      desc={
        <form
          id="tasks-multi-delete-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleDelete();
          }}
          className="space-y-4"
        >
          <p className="mb-2">
            {t("Are you sure you want to delete the selected tasks?")}
            <br />
            {t("This action cannot be undone.")}
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span className="">
              {t('Confirm by typing "')}
              {CONFIRM_WORD}":
            </span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
              autoFocus
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>{t("Warning!")}</AlertTitle>
            <AlertDescription>
              {t("Please be careful, this operation can not be rolled back.")}
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText={t("Delete")}
      destructive
    />
  );
}
