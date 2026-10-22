import { t } from "@/archive/i18n";
import { ContentSection } from "../components/content-section";
import { NotificationsForm } from "./notifications-form";

export function SettingsNotifications() {
  return (
    <ContentSection
      title={t("Notifications")}
      desc={t("Configure how you receive notifications.")}
    >
      <NotificationsForm />
    </ContentSection>
  );
}
