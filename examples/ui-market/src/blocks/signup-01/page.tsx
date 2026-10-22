// Actual shadcn/ui source; fixed version and adaptations in ATTRIBUTION.md.
import { SignupForm } from "@/blocks/signup-01/components/signup-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}
