import { t } from "@/archive/i18n";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTasks } from "./tasks-provider";

export function TasksPrimaryButtons() {
  const { setOpen } = useTasks();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen("create")}>
        <span>{t("Create")}</span> <Plus size={18} />
      </Button>
    </div>
  );
}
