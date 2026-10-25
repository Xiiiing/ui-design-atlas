// @ts-check
import { element } from "./dom.js";
/** @param {{activatePrimary:(target:string)=>void;tagURL:(name:string,value:string)=>string;openResource:(id:string,type:string,replace?:boolean,details?:boolean)=>void}} actions */
export function createNavigationActions({
  activatePrimary,
  tagURL,
  openResource,
}) {
  /** @param {MouseEvent} e */
  return function handleNavigationClick(e) {
    if (!(e.target instanceof Element)) return false;
    const disabled = e.target.closest('[aria-disabled="true"]');
    if (disabled) {
      e.preventDefault();
      return true;
    }
    const primary = e.target.closest("[data-primary-view]");
    if (primary && !(primary instanceof HTMLElement)) return true;
    if (primary && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      activatePrimary(primary.dataset.primaryView || "discover");
      return true;
    }

    const tagLink = e.target.closest("[data-resource-tag]");
    if (tagLink && !(tagLink instanceof HTMLElement)) return true;
    if (tagLink && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      location.hash = tagURL(
        tagLink.dataset.resourceTag || "",
        tagLink.dataset.tagValue || "",
      );
      return true;
    }
    const link = e.target.closest("[data-open],[data-related]");
    if (link && !(link instanceof HTMLElement)) return true;
    if (link && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      element("#search-dialog").close();
      const [type, id] = (
        link.dataset.open ||
        link.dataset.related ||
        ""
      ).split(":");
      openResource(
        id,
        type,
        false,
        link.hasAttribute("data-details") || link.hasAttribute("data-related"),
      );
      return true;
    }
    if (e.target.closest("#search-results a"))
      element("#search-dialog").close();
    return false;
  };
}
