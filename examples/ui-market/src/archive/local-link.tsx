import type { AnchorHTMLAttributes } from "react";
export function LocalLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      onClick={(e) => {
        if (props.href === "#") e.preventDefault();
        props.onClick?.(e);
      }}
    />
  );
}
