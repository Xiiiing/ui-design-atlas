import { t } from "@/archive/i18n";
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  CircleOff,
  HelpCircle,
  Timer,
} from "lucide-react";

export const labels = [
  {
    value: "bug",
    label: t("Bug"),
  },
  {
    value: "feature",
    label: t("Feature"),
  },
  {
    value: "documentation",
    label: t("Documentation"),
  },
];

export const statuses = [
  {
    label: t("Backlog"),
    value: "backlog" as const,
    icon: HelpCircle,
  },
  {
    label: t("Todo"),
    value: "todo" as const,
    icon: Circle,
  },
  {
    label: t("In Progress"),
    value: "in progress" as const,
    icon: Timer,
  },
  {
    label: t("Done"),
    value: "done" as const,
    icon: CheckCircle,
  },
  {
    label: t("Canceled"),
    value: "canceled" as const,
    icon: CircleOff,
  },
];

export const priorities = [
  {
    label: t("Low"),
    value: "low" as const,
    icon: ArrowDown,
  },
  {
    label: t("Medium"),
    value: "medium" as const,
    icon: ArrowRight,
  },
  {
    label: t("High"),
    value: "high" as const,
    icon: ArrowUp,
  },
  {
    label: t("Critical"),
    value: "critical" as const,
    icon: AlertCircle,
  },
];
