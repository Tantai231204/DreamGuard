"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    const isDropdown = props.captionLayout === "dropdown" || props.captionLayout === "dropdown-months" || props.captionLayout === "dropdown-years"

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 relative",
                month: "space-y-4 relative",
                month_caption: "flex justify-center pt-1 relative items-center h-10 px-9",
                caption_label: isDropdown
                    ? "sr-only"
                    : "text-sm font-bold text-slate-900",
                nav: "flex items-center justify-between absolute top-1 inset-x-0 z-10 px-0.5 pointer-events-none",
                button_previous: "inline-flex items-center justify-center h-8 w-8 bg-white font-black p-0 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 rounded-lg pointer-events-auto transition-all",
                button_next: "inline-flex items-center justify-center h-8 w-8 bg-white font-black p-0 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 rounded-lg pointer-events-auto transition-all",
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex justify-between",
                weekday: "text-slate-400 rounded-md w-9 font-bold text-[0.8rem] uppercase text-center",
                week: "flex w-full mt-2 justify-between",
                day: cn(
                    "h-9 w-9 text-center text-sm p-0 relative",
                    "focus-within:relative focus-within:z-20"
                ),
                day_button: cn(
                    "inline-flex items-center justify-center",
                    "h-9 w-9 p-0 rounded-lg",
                    "text-sm font-normal text-slate-700",
                    "border-0 outline-none bg-transparent",
                    "transition-all duration-150 cursor-pointer",
                    "hover:bg-slate-100 hover:text-slate-900",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                    "[.is-selected_&]:bg-primary [.is-selected_&]:text-white [.is-selected_&]:font-semibold [.is-selected_&]:shadow-md [.is-selected_&]:shadow-primary/20",
                    "[.is-selected_&]:hover:!bg-primary/90 [.is-selected_&]:hover:!text-white"
                ),
                range_end: "is-selected",
                range_start: "is-selected",
                selected: "is-selected",
                today: "bg-slate-100 text-slate-900 font-bold rounded-lg",
                outside: "day-outside text-slate-300 opacity-50 aria-selected:bg-slate-100/50 aria-selected:text-slate-400 aria-selected:opacity-30",
                disabled: "text-slate-300 opacity-50 cursor-not-allowed",
                range_middle: "bg-primary/10 text-primary font-medium rounded-none",
                hidden: "invisible",
                dropdowns: "flex items-center gap-1.5",
                dropdown: "text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 cursor-pointer hover:bg-white hover:border-slate-300 hover:text-slate-900 transition-all outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 shadow-sm appearance-none",
                dropdown_root: "relative inline-flex items-center",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    if (orientation === "left") return <ChevronLeft className="h-4 w-4" />
                    return <ChevronRight className="h-4 w-4" />
                }
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }