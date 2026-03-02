import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, defaultValue, ...props }, ref) => {
  const thumbCount = value?.length ?? defaultValue?.length ?? 1;

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center py-2",
        className
      )}
      value={value}
      defaultValue={defaultValue}
      {...props}
    >
      {/* Track */}
      <SliderPrimitive.Track
        className="
          relative h-[6px] w-full grow overflow-hidden
          rounded-full bg-gray-200
        "
      >
        <SliderPrimitive.Range
          className="
            absolute h-full rounded-full
            bg-[var(--color-primary)]
          "
        />
      </SliderPrimitive.Track>

      {/* Thumb */}
      {Array.from({ length: thumbCount }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className={cn(
            "block size-5 rounded-full",
            "bg-[var(--color-primary)]",
            "border-2 border-white",
            "shadow-md",
            "absolute top-1/2 translate-y-[-50%]",
            "transition-all duration-150",
            "hover:scale-110 hover:shadow-lg",
            "active:scale-105",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40",
            "cursor-grab active:cursor-grabbing"
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
});

Slider.displayName = SliderPrimitive.Root.displayName;
export { Slider };