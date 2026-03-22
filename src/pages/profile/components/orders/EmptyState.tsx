import { memo } from "react"
import { Search, ShoppingBag } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const EmptyState = memo(({ isFilter = false }: { isFilter?: boolean }) => {
    return (
        <Card className="py-24 text-center bg-slate-50/10 border-dashed border-2 border-slate-200 rounded-[2.5rem] flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center mb-8">
                {isFilter ? (
                    <Search className="h-10 w-10 text-slate-200" />
                ) : (
                    <ShoppingBag className="h-10 w-10 text-slate-200" />
                )}
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {isFilter ? "No matches found" : "Your journey awaits"}
            </h3>
            <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto mt-3 leading-relaxed">
                {isFilter
                    ? "We couldn't find any orders matching your filters. Try adjusting your search term or date range."
                    : "You haven't placed any orders yet. Discover our premium sleep collection and start your story today."
                }
            </p>
            <Button className="group/btn relative mt-10 h-12 px-12 rounded-xl text-[11px] font-black uppercase tracking-[0.25em] bg-primary text-white shadow-[0_10px_25px_-8px_rgba(73,136,196,0.6)] hover:shadow-[0_15px_35px_-10px_rgba(73,136,196,0.7)] hover:-translate-y-1 transition-all duration-300 overflow-hidden border-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10">{isFilter ? "Explore All Orders" : "Start Shopping Now"}</span>
            </Button>
        </Card>
    )
})
