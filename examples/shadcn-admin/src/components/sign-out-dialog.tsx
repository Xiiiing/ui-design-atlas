import { t } from "@/archive/i18n";
import { resetDemo } from "@/archive/store";
import { ConfirmDialog } from "@/components/confirm-dialog";
export function SignOutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("Reset demo data")}
      desc={t("Restore the original sample records and settings.")}
      confirmText={t("Reset demo")}
      handleConfirm={() => {
        resetDemo();
        location.reload();
      }}
    />
  );
}
