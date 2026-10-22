import { t } from "@/archive/i18n";
import { ContentSection } from "../components/content-section";
import { AppearanceForm } from "./appearance-form";

export function SettingsAppearance() {
  return (
    <ContentSection
      title={t("Appearance")}
      desc={t(
        "Customize the appearance of the app. Automatically switch between day\n          and night themes.",
      )}
    >
      <AppearanceForm />
    </ContentSection>
  );
}
