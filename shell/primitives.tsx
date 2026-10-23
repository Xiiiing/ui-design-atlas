import {
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type SelectHTMLAttributes,
  type MutableRefObject,
} from "react";
import * as Select from "@radix-ui/react-select";
import * as Menu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Languages } from "lucide-react";
import { lockPageScroll } from "./scroll-lock";

const portalHost = (el: HTMLElement | null) =>
  el?.closest<HTMLElement>("dialog, [data-overlay-host]") ?? undefined;

// The real select is the sole named form field. Radix supplies keyboard,
// typeahead and collision handling; its popover stays in a native dialog's layer.
export function MarketSelect({
  children,
  value,
  onChange,
  id,
  name,
  form,
  disabled,
  required,
  iconOnly = false,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { iconOnly?: boolean }) {
  const options = children as React.ReactElement<{
    value: string;
    children: ReactNode;
    disabled?: boolean;
  }>[];
  const native = useRef<HTMLSelectElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const release = useRef<(() => void) | undefined>(undefined);
  const [container, setContainer] = useState<HTMLElement>();
  const [open, setOpen] = useState(false);
  const selected = String(value ?? options[0]?.props.value ?? "");
  const close = (next: boolean) => {
    if (next) {
      setContainer(portalHost(trigger.current));
      release.current ??= lockPageScroll();
    } else {
      release.current?.();
      release.current = undefined;
    }
    setOpen(next);
  };
  // Portal owners may be replaced by imperative page rendering.
  useReleaseOnUnmount(release);
  return (
    <>
      <select
        {...rest}
        ref={native}
        id={id ? id + "-native" : undefined}
        data-shell-field={id}
        className="atlas-select-native"
        tabIndex={-1}
        aria-hidden="true"
        name={name}
        form={form}
        disabled={disabled}
        required={required}
        value={selected}
        onChange={onChange}
      >
        {children}
      </select>
      <Select.Root
        open={open}
        value={"option:" + selected}
        disabled={disabled}
        onOpenChange={close}
        onValueChange={(v) => {
          const el = native.current;
          if (el && el.value !== v.slice(7)) {
            el.value = v.slice(7);
            el.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }}
      >
        <Select.Trigger
          ref={trigger}
          id={id}
          aria-label={rest["aria-label"]}
          className={
            iconOnly
              ? "atlas-select-trigger language-trigger"
              : "atlas-select-trigger"
          }
          title={
            iconOnly
              ? `${rest["aria-label"]}: ${options.find((o) => o.props.value === selected)?.props.children}`
              : undefined
          }
          aria-required={required}
        >
          {iconOnly ? (
            <Languages size={18} aria-hidden="true" />
          ) : (
            <>
              <Select.Value />
              <Select.Icon>
                <ChevronDown size={14} />
              </Select.Icon>
            </>
          )}
        </Select.Trigger>
        <Select.Portal container={container}>
          <Select.Content
            position="popper"
            align={iconOnly ? "end" : "start"}
            sideOffset={6}
            collisionPadding={12}
            className={
              iconOnly
                ? "atlas-select-content language-content"
                : "atlas-select-content"
            }
          >
            <Select.Viewport>
              <Select.Group>
                {iconOnly && (
                  <Select.Label className="language-heading">
                    语言 / Language
                  </Select.Label>
                )}
                {options.map((o) => (
                  <Select.Item
                    className="atlas-select-item"
                    value={"option:" + o.props.value}
                    key={o.props.value}
                    disabled={o.props.disabled}
                  >
                    <Select.ItemText>{o.props.children}</Select.ItemText>
                    <Select.ItemIndicator>
                      <Check size={14} />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </>
  );
}

function useReleaseOnUnmount(
  release: MutableRefObject<(() => void) | undefined>,
) {
  useEffect(() => () => release.current?.(), [release]);
}

export function MarketMenu({
  label,
  items,
  triggerClassName = "",
  ariaLabel,
}: {
  label: ReactNode;
  triggerClassName?: string;
  ariaLabel?: string;
  items: {
    key?: string;
    label: ReactNode;
    selected?: boolean;
    onSelect: () => void;
  }[];
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [container, setContainer] = useState<HTMLElement>();
  return (
    <Menu.Root
      modal={false}
      onOpenChange={(open) => {
        if (open) setContainer(portalHost(trigger.current));
      }}
    >
      <Menu.Trigger
        ref={trigger}
        className={"atlas-menu-trigger " + triggerClassName}
        aria-label={ariaLabel}
      >
        {label}
      </Menu.Trigger>
      <Menu.Portal container={container}>
        <Menu.Content
          align="end"
          sideOffset={6}
          collisionPadding={12}
          className="atlas-menu-content"
          loop
        >
          {items.map((item, i) => (
            <Menu.Item
              key={item.key ?? i}
              className="atlas-menu-item"
              onSelect={item.onSelect}
            >
              <span>{item.label}</span>
              {item.selected && <Check size={14} />}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
