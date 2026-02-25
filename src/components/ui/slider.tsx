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
        "relative flex w-full touch-none select-none items-center py-2 group cursor-pointer",
        className
      )}
      value={value}
      defaultValue={defaultValue}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-[6px] w-full grow overflow-hidden rounded-full bg-gray-200/80 group-hover:h-2 transition-all duration-150">
        <SliderPrimitive.Range className="absolute h-full bg-[var(--color-primary)] rounded-full" />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block h-[22px] w-[22px] rounded-full bg-white border-[3px] border-[var(--color-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-150 hover:shadow-[0_2px_12px_rgba(0,0,0,0.2)] hover:scale-110 active:scale-105 active:shadow-[0_1px_6px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--color-primary)]/25 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing"
        />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
