import { t } from "@/archive/i18n";
import { ContentSection } from "../components/content-section";
import { ProfileForm } from "./profile-form";

export function SettingsProfile() {
  return (
    <ContentSection
      title={t("Profile")}
      desc={t("This is how others will see you on the site.")}
    >
      <ProfileForm />
    </ContentSection>
  );
}
