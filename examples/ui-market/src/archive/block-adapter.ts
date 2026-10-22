import { t } from "./i18n";
// Local form/placeholder-navigation behavior for the original UI-only block demos.
export function installBlockAdapter() {
  const submit = (e: SubmitEvent) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    e.preventDefault();
    const passwords = [
      ...form.querySelectorAll<HTMLInputElement>("input[type=password]"),
    ];
    if (passwords.length > 1 && passwords[0].value !== passwords[1].value) {
      passwords[1].setCustomValidity(t("Passwords do not match."));
      passwords[1].reportValidity();
      return;
    }
    window.dispatchEvent(
      new CustomEvent("atlas:demo-success", {
        detail: "Local demo complete. No account was created.",
      }),
    );
  };
  const input = (e: Event) => {
    if (e.target instanceof HTMLInputElement) e.target.setCustomValidity("");
  };
  const click = (e: MouseEvent) => {
    const target = (e.target as Element).closest('a[href="#"]');
    if (!target) return;
    e.preventDefault();
    const button = target.closest('[data-sidebar="menu-button"]');
    if (button) {
      for (const el of document.querySelectorAll(
        '[data-sidebar="menu-button"]',
      ))
        el.setAttribute("data-active", "false");
      button.setAttribute("data-active", "true");
    }
    window.dispatchEvent(
      new CustomEvent("atlas:demo-success", {
        detail: "Layout example: navigation stays in this local preview.",
      }),
    );
  };
  document.addEventListener("submit", submit);
  document.addEventListener("input", input);
  document.addEventListener("click", click);
  return () => {
    document.removeEventListener("submit", submit);
    document.removeEventListener("input", input);
    document.removeEventListener("click", click);
  };
}
