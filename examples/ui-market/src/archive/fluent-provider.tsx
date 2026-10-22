import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
} from "@fluentui/react-components";
import { useTheme } from "next-themes";
import type { PropsWithChildren } from "react";
export function MicrosoftProvider({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme();
  return (
    <FluentProvider
      theme={resolvedTheme === "dark" ? webDarkTheme : webLightTheme}
      style={{
        background: "transparent",
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <div style={{ width: "100%", overflowX: "auto", padding: 4 }}>
        {children}
      </div>
    </FluentProvider>
  );
}
