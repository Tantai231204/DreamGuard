import { CalendarDays, Check, Package, User } from "lucide-react";

export const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export const STEPS = [
  { label: "Package", icon: Package },
  { label: "Schedule", icon: CalendarDays },
  { label: "Contact", icon: User },
  { label: "Confirm", icon: Check },
] as const;
