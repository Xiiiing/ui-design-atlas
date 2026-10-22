// Actual upstream example. Source and adaptations: ATTRIBUTION.md.
import { MicrosoftProvider } from "@/archive/fluent-provider";
import * as React from "react";
import type { JSXElement } from "@fluentui/react-components";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
} from "@fluentui/react-components";

export const Default = (): JSXElement => {
  return (
    <Dialog defaultOpen={new URLSearchParams(location.search).has("thumb")}>
      <DialogTrigger disableButtonEnhancement>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogContent>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
            exercitationem cumque repellendus eaque est dolor eius expedita
            nulla ullam? Tenetur reprehenderit aut voluptatum impedit voluptates
            in natus iure cumque eaque?
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button
                appearance="primary"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("atlas:demo-success", {
                      detail: "Confirmed locally.",
                    }),
                  )
                }
              >
                Confirm
              </Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Close</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default function ArchivedDemo() {
  return (
    <MicrosoftProvider>
      <Default />
    </MicrosoftProvider>
  );
}
