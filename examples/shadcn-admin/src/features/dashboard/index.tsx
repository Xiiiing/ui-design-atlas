import { t } from "@/archive/i18n";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { TopNav } from "@/components/layout/top-nav";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Analytics } from "./components/analytics";
import { MetricCards } from "./components/metric-cards";
import { Overview } from "./components/overview";
import { RecentSales } from "./components/recent-sales";

export function Dashboard() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} className="me-auto" />
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("Dashboard")}
          </h1>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(
                  new Blob(
                    [
                      JSON.stringify(
                        {
                          revenue: 45231.89,
                          subscriptions: 2350,
                          sales: 12234,
                          active: 573,
                        },
                        null,
                        2,
                      ),
                    ],
                    { type: "application/json" },
                  ),
                );
                a.download = "dashboard-demo.json";
                a.click();
                setTimeout(() => URL.revokeObjectURL(a.href), 1000);
              }}
            >
              {t("Download")}
            </Button>
          </div>
        </div>
        <Tabs
          orientation="vertical"
          defaultValue="overview"
          className="space-y-4"
        >
          <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
              <TabsTrigger value="analytics">{t("Analytics")}</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="space-y-4">
            <MetricCards />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>{t("Overview")}</CardTitle>
                </CardHeader>
                <CardContent className="ps-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>{t("Recent Sales")}</CardTitle>
                  <CardDescription>
                    {t("You made 265 sales this month.")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Analytics />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  );
}

const topNav = [
  { title: t("Overview"), href: "/", isActive: true, disabled: false },
  { title: t("Tasks"), href: "/tasks", isActive: false, disabled: false },
  { title: t("Users"), href: "/users", isActive: false, disabled: false },
  { title: t("Settings"), href: "/settings", isActive: false, disabled: false },
];
