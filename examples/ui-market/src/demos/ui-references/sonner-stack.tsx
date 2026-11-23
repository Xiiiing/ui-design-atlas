import { IconBellRinging } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { Toaster, toast } from "sonner";
import { copy, ReferencePanel } from "./shared";

export default function SonnerStack() {
  const { resolvedTheme } = useTheme();
  const push = () => {
    toast.success(copy("草稿已保存", "Draft saved"));
    toast.info(copy("协作邀请已发送", "Invitation sent"));
    toast.error(copy("上传失败", "Upload failed"), {
      description: copy(
        "附件超过大小限制。",
        "The attachment exceeded the size limit.",
      ),
    });
  };

  return (
    <>
      <ReferencePanel
        icon={<IconBellRinging aria-hidden="true" />}
        title={copy("工作区通知", "Workspace notifications")}
        description={copy(
          "连续触发三条反馈，观察它们如何堆叠。",
          "Trigger three updates and see how they stack.",
        )}
      >
        <div className="refs-actions">
          <button className="refs-btn refs-primary" onClick={push}>
            {copy("发送三条通知", "Send three notifications")}
          </button>
          <button className="refs-btn" onClick={() => toast.dismiss()}>
            {copy("清除通知", "Clear notifications")}
          </button>
        </div>
      </ReferencePanel>
      <Toaster
        containerAriaLabel={copy("通知", "Notifications")}
        toastOptions={{
          closeButtonAriaLabel: copy("关闭通知", "Close notification"),
        }}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        position="bottom-center"
        duration={6500}
        closeButton
        richColors
      />
    </>
  );
}
