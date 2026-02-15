import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils/utils";

const buttonVariants = cva(
  [
    // Base layout
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",

    // Typography
    "text-[15px] font-semibold tracking-tight",

    // Shape & focus
    "rounded-lg focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "ring-offset-background",

    // Interaction
    "transition-all duration-300 ease-in-out",
    "active:scale-[0.97]",
    "motion-reduce:transition-none",

    // Disabled state
    "disabled:pointer-events-none disabled:opacity-60 disabled:grayscale disabled:cursor-not-allowed",

    // SVG handling
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: `
          h-10 px-8
          text-white
          bg-gradient-to-r from-orange-400 via-orange-500 to-red-500
          hover:from-red-500 hover:to-orange-500
          rounded-full
          shadow-lg hover:shadow-xl active:shadow-md
          relative overflow-hidden
          before:absolute before:inset-0
          before:bg-white/10 before:opacity-0
          hover:before:opacity-100 before:transition-opacity
          hidden md:flex
        `,
        destructive: `
          h-10 px-4
          bg-destructive text-destructive-foreground
          hover:bg-destructive/90
        `,
        outline: `
          h-10 px-4
          border border-input bg-background
          hover:bg-accent hover:text-accent-foreground
        `,
        secondary: `
          h-10 px-4
          bg-secondary text-secondary-foreground
          hover:bg-secondary/80
        `,
        ghost: `
          h-10 px-4
          hover:bg-accent hover:text-accent-foreground
        `,
        link: `
          h-10 px-2
          text-primary underline-offset-4
          hover:underline
        `,
      },

      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-xl",
        icon: "h-10 w-10 rounded-xl",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  whileHover?: { scale: number };
  whileTap?: { scale: number };
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
