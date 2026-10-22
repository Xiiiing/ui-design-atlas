import { t } from "@/archive/i18n";
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { UsersMultiDeleteDialog } from "./users-multi-delete-dialog";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  return (
    <>
      <BulkActionsToolbar table={table} entityName={t("user")}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label={t("Delete selected users")}
              title={t("Delete selected users")}
            >
              <Trash2 />
              <span className="sr-only">{t("Delete selected users")}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("Delete selected users")}</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <UsersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  );
}
