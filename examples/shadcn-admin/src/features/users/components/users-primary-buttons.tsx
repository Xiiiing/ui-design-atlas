import { t } from "@/archive/i18n";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useUsers } from "./users-provider";

export function UsersPrimaryButtons() {
  const { setOpen } = useUsers();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen("add")}>
        <span>{t("Add User")}</span> <UserPlus size={18} />
      </Button>
    </div>
  );
}
