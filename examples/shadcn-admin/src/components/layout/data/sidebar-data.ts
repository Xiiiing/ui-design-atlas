import { t } from "@/archive/i18n";
import {
  Bell,
  Command,
  LayoutDashboard,
  ListTodo,
  Palette,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { type SidebarData } from "../types";
export const sidebarData: SidebarData = {
  user: { name: t("Demo User"), email: "demo@example.com", avatar: "" },
  teams: [{ name: "Shadcn Admin", logo: Command, plan: "Vite + ShadcnUI" }],
  navGroups: [
    {
      title: t("General"),
      items: [
        { title: t("Dashboard"), url: "/", icon: LayoutDashboard },
        { title: t("Tasks"), url: "/tasks", icon: ListTodo },
        { title: t("Users"), url: "/users", icon: Users },
      ],
    },
    {
      title: t("Settings"),
      items: [
        {
          title: t("Settings"),
          icon: Settings,
          items: [
            { title: t("Profile"), url: "/settings", icon: UserCog },
            {
              title: t("Appearance"),
              url: "/settings/appearance",
              icon: Palette,
            },
            {
              title: t("Notifications"),
              url: "/settings/notifications",
              icon: Bell,
            },
          ],
        },
      ],
    },
  ],
};
