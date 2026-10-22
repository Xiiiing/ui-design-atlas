// Thumbnail previews are visual only and must never take keyboard focus.
if (new URLSearchParams(location.search).has("thumb")) document.body.inert = true;
import { createArchiveHistory } from "./archive/history";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-600.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import "./archive/i18n";
import { DirectionProvider } from "./context/direction-provider";
import { FontProvider } from "./context/font-provider";
import { ThemeProvider } from "./context/theme-provider";
import { routeTree } from "./routeTree.gen";
import "./styles/index.css";
const queryClient = new QueryClient();
const router = createRouter({
  routeTree,
  history: createArchiveHistory(),
  context: { queryClient },
  defaultPreload: "intent",
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <FontProvider>
        <DirectionProvider>
          <RouterProvider router={router} />
        </DirectionProvider>
      </FontProvider>
    </ThemeProvider>
  </QueryClientProvider>,
);
