import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DialogPortal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 grid w-full max-w-lg gap-4 rounded-lg border bg-white p-6 shadow-lg duration-200 sm:zoom-in-90 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        className
      )}
      {...props}
    />
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

export { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription };


