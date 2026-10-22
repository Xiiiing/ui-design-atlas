import { createContext, useContext } from "react";
export const PreviewSettings = createContext({
  duration: 8,
  quantity: 100,
  value: 100,
});
export const usePreviewSettings = () => useContext(PreviewSettings);
