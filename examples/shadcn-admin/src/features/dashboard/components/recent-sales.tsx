import { t } from "@/archive/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src="" alt="Avatar" />
          <AvatarFallback>{t("OM")}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-wrap items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm leading-none font-medium">
              {t("Olivia Martin")}
            </p>
            <p className="text-sm text-muted-foreground">
              olivia.martin@email.com
            </p>
          </div>
          <div className="font-medium">+$1,999.00</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
          <AvatarImage src="" alt="Avatar" />
          <AvatarFallback>{t("JL")}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-wrap items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm leading-none font-medium">
              {t("Jackson Lee")}
            </p>
            <p className="text-sm text-muted-foreground">
              jackson.lee@email.com
            </p>
          </div>
          <div className="font-medium">+$39.00</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src="" alt="Avatar" />
          <AvatarFallback>{t("IN")}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-wrap items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm leading-none font-medium">
              {t("Isabella Nguyen")}
            </p>
            <p className="text-sm text-muted-foreground">
              isabella.nguyen@email.com
            </p>
          </div>
          <div className="font-medium">+$299.00</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src="" alt="Avatar" />
          <AvatarFallback>{t("WK")}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-wrap items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm leading-none font-medium">
              {t("William Kim")}
            </p>
            <p className="text-sm text-muted-foreground">will@email.com</p>
          </div>
          <div className="font-medium">+$99.00</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src="" alt="Avatar" />
          <AvatarFallback>{t("SD")}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-wrap items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm leading-none font-medium">
              {t("Sofia Davis")}
            </p>
            <p className="text-sm text-muted-foreground">
              sofia.davis@email.com
            </p>
          </div>
          <div className="font-medium">+$39.00</div>
        </div>
      </div>
    </div>
  );
}
