import { t } from "@/archive/i18n";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const data = [
  {
    name: t("Jan"),
    total: 2377,
  },
  {
    name: t("Feb"),
    total: 3354,
  },
  {
    name: t("Mar"),
    total: 4331,
  },
  {
    name: t("Apr"),
    total: 5308,
  },
  {
    name: t("May"),
    total: 2085,
  },
  {
    name: t("Jun"),
    total: 3062,
  },
  {
    name: t("Jul"),
    total: 4039,
  },
  {
    name: t("Aug"),
    total: 5016,
  },
  {
    name: t("Sep"),
    total: 1793,
  },
  {
    name: t("Oct"),
    total: 2770,
  },
  {
    name: t("Nov"),
    total: 3747,
  },
  {
    name: t("Dec"),
    total: 4724,
  },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          direction="ltr"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
