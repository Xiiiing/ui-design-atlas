import { t } from "@/archive/i18n";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const data = [
  {
    name: t("Mon"),
    clicks: 450,
    uniques: 300,
  },
  {
    name: t("Tue"),
    clicks: 220,
    uniques: 150,
  },
  {
    name: t("Wed"),
    clicks: 680,
    uniques: 470,
  },
  {
    name: t("Thu"),
    clicks: 500,
    uniques: 360,
  },
  {
    name: t("Fri"),
    clicks: 700,
    uniques: 500,
  },
  {
    name: t("Sat"),
    clicks: 820,
    uniques: 570,
  },
  {
    name: t("Sun"),
    clicks: 600,
    uniques: 420,
  },
];

export function AnalyticsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Area
          type="monotone"
          dataKey="clicks"
          stroke="currentColor"
          className="text-primary"
          fill="currentColor"
          fillOpacity={0.15}
        />
        <Area
          type="monotone"
          dataKey="uniques"
          stroke="currentColor"
          className="text-muted-foreground"
          fill="currentColor"
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
