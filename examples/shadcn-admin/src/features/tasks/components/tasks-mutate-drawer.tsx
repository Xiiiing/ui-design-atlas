import { t } from "@/archive/i18n";
import { upsertRow } from "@/archive/store";
import { SelectDropdown } from "@/components/select-dropdown";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { type Task } from "../data/schema";

type TaskMutateDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Task;
};

const formSchema = z.object({
  title: z.string().min(1, t("Title is required.")),
  status: z.string().min(1, t("Please select a status.")),
  label: z.string().min(1, t("Please select a label.")),
  priority: z.string().min(1, t("Please choose a priority.")),
});
type TaskForm = z.infer<typeof formSchema>;

export function TasksMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: TaskMutateDrawerProps) {
  const isUpdate = !!currentRow;

  const form = useForm<TaskForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow
      ? { ...currentRow, title: t(currentRow.title) }
      : {
          title: "",
          status: "",
          label: "",
          priority: "",
        },
  });

  const onSubmit = (data: TaskForm) => {
    // do something with the form data
    onOpenChange(false);
    form.reset();
    upsertRow("tasks", data, currentRow?.id);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        form.reset();
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>
            {isUpdate ? t("Update") : t("Create")} {t("Task")}
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? t("Update the task by providing necessary info.")
              : t("Add a new task by providing necessary info.")}
            {t("Click save when you're done.")}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="tasks-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-6 overflow-y-auto px-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Title")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("Enter a title")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Status")}</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder={t("Select dropdown")}
                    items={[
                      { label: t("In Progress"), value: "in progress" },
                      { label: t("Backlog"), value: "backlog" },
                      { label: t("Todo"), value: "todo" },
                      { label: t("Canceled"), value: "canceled" },
                      { label: t("Done"), value: "done" },
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel>{t("Label")}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center">
                        <FormControl>
                          <RadioGroupItem value="documentation" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t("Documentation")}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center">
                        <FormControl>
                          <RadioGroupItem value="feature" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t("Feature")}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center">
                        <FormControl>
                          <RadioGroupItem value="bug" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t("Bug")}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel>{t("Priority")}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center">
                        <FormControl>
                          <RadioGroupItem value="high" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t("High")}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center">
                        <FormControl>
                          <RadioGroupItem value="medium" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t("Medium")}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center">
                        <FormControl>
                          <RadioGroupItem value="low" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t("Low")}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">{t("Close")}</Button>
          </SheetClose>
          <Button form="tasks-form" type="submit">
            {t("Save changes")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
