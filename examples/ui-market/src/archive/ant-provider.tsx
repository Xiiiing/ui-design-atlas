import { ConfigProvider, theme } from "antd";
import en from "antd/locale/en_US";
import zh from "antd/locale/zh_CN";
import { useTheme } from "next-themes";
import type { PropsWithChildren } from "react";
import { locale } from "./i18n";
export function AntProvider({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme();
  return (
    <ConfigProvider
      locale={locale === "en" ? en : zh}
      theme={{
        algorithm:
          resolvedTheme === "dark"
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          margin: "0 auto",
          overflowX: "auto",
          padding: 4,
        }}
      >
        {children}
      </div>
    </ConfigProvider>
  );
}
