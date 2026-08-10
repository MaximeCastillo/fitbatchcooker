import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// A navigation control that LOOKS like a button but stays a link.
//
// Why not `<Button render={<Link/>} nativeButton={false}>`: Base UI's useButton applies
// `role="button"` unconditionally once nativeButton is false, so an <a href> announces as a
// button to screen readers even though it navigates. Its own dev warning names this — non-native
// rendering "can add unintended extra attributes (such as `role`)". There is no prop to opt out.
//
// Styling a real Link instead keeps the link role, and with it everything the browser gives a
// link for free: Enter, middle-click, cmd-click, "open in new tab", "copy link address".
export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>) {
  return (
    <Link
      // Same slot as Button so the button-group styling hooks keep matching.
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
