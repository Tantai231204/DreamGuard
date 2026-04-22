import * as React from "react";
import { format, isValid, startOfMonth, startOfYear } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import type { DateRange, Matcher } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DatePreset<T extends Date | DateRange = DateRange> {
  label: string;
  getValue: () => T;
}

export interface BaseDatePickerProps {
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
  showDropdowns?: boolean;
  fromYear?: number;
  toYear?: number;
  name?: string;
  id?: string;
  onBlur?: () => void;
  disabledDays?: Matcher | Matcher[];
}

export interface SingleDatePickerProps extends BaseDatePickerProps {
  mode?: "single";
  value?: Date;
  onChange?: (value: Date | undefined) => void;
  presets?: DatePreset<Date>[];
}

export interface RangeDatePickerProps extends BaseDatePickerProps {
  mode: "range";
  value?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
  presets?: DatePreset<DateRange>[];
}

export type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps;

// ─── Built-in range presets ───────────────────────────────────────────────────

const DEFAULT_RANGE_PRESETS: DatePreset<DateRange>[] = [
  {
    label: "Last 7 days",
    getValue: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 6);
      return { from, to };
    },
  },
  {
    label: "Last 30 days",
    getValue: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 29);
      return { from, to };
    },
  },
  {
    label: "This Month",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: new Date(),
    }),
  },
  {
    label: "This Year",
    getValue: () => ({
      from: startOfYear(new Date()),
      to: new Date(),
    }),
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      mode = "single",
      value,
      onChange,
      placeholder,
      className,
      disabled = false,
      clearable = true,
      presets,
      showDropdowns = true,
      fromYear = 1900,
      toYear = new Date().getFullYear(),
      name,
      id,
      onBlur,
      disabledDays,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const resolvedPlaceholder =
      placeholder ?? (mode === "range" ? "Select date range" : "Pick a date");

    // Hiển thị text trên button
    const displayText = React.useMemo(() => {
      if (!value) return null;

      if (mode === "single") {
        const d = value as Date;
        return isValid(d) ? format(d, "dd/MM/yyyy") : null;
      }

      const r = value as DateRange;
      if (!r?.from || !isValid(r.from)) return null;

      const fromStr = format(r.from, "dd/MM/yyyy");
      if (r.to && isValid(r.to)) {
        return `${fromStr} - ${format(r.to, "dd/MM/yyyy")}`;
      }
      return fromStr;
    }, [value, mode]);

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(undefined);
    };

    const activePresets = presets ?? DEFAULT_RANGE_PRESETS;

    return (
      <div className={cn("w-full", className)}>
        <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              id={id}
              name={name}
              onBlur={onBlur}
              type="button"
              disabled={disabled}
              variant="outline"
              aria-expanded={open}
              className={cn(
                "w-full h-10 justify-start text-left font-normal rounded-xl",
                "border-input bg-background shadow-sm",
                "relative pl-9 pr-8 text-sm",
                "hover:bg-accent hover:text-accent-foreground transition-colors",
                !displayText && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <span className="truncate">{displayText ?? resolvedPlaceholder}</span>

              {clearable && displayText && !disabled && (
                <div
                  role="button"
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-auto p-0 rounded-xl border shadow-lg overflow-hidden"
            align="start"
            sideOffset={6}
          >
            <div className="flex flex-col sm:flex-row">
              {/* Presets Sidebar (Chỉ hiện ở mode Range) */}
              {mode === "range" && (
                <div className="border-b sm:border-b-0 sm:border-r border-border p-2 flex flex-row sm:flex-col gap-1 bg-muted/20 overflow-x-auto overflow-y-hidden">
                  {activePresets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        if (mode === "range") {
                          const val = p.getValue() as DateRange;
                          const onChangeRange = onChange as (val: DateRange | undefined) => void;
                          onChangeRange?.(val);
                          
                          if (val.from && val.to) {
                            setOpen(false);
                          }
                        }
                      }}
                      className="text-left px-3 py-1.5 text-xs font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors whitespace-nowrap"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-1">
                {mode === "single" ? (
                  <Calendar
                    mode="single"
                    selected={value as Date | undefined}
                    onSelect={(val) => {
                      if (mode === "single") {
                        const onChangeSingle = onChange as (val: Date | undefined) => void;
                        onChangeSingle?.(val);
                      }
                      setOpen(false);
                    }}
                    captionLayout={showDropdowns ? "dropdown" : "label"}
                    fromYear={fromYear}
                    toYear={toYear}
                    disabled={disabledDays}
                    initialFocus
                    className="p-3"
                  />
                ) : (
                  <Calendar
                    mode="range"
                    selected={value as DateRange | undefined}
                    onSelect={(val) => {
                      if (mode === "range") {
                        const onChangeRange = onChange as (val: DateRange | undefined) => void;
                        onChangeRange?.(val);
                      }
                      if (val?.from && val?.to) setOpen(false);
                    }}
                    captionLayout={showDropdowns ? "dropdown" : "label"}
                    fromYear={fromYear}
                    toYear={toYear}
                    disabled={disabledDays}
                    numberOfMonths={2}
                    initialFocus
                    className="p-3"
                  />
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";