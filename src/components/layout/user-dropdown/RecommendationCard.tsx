import { Link } from "react-router-dom"
import { Sparkles, ArrowRight } from "lucide-react"

interface RecommendationCardProps {
    babyName: string
    count: number
}

export function RecommendationCard({ babyName, count }: RecommendationCardProps) {
    return (
        <div className="
            mt-2 mx-1 rounded-2xl overflow-hidden
            bg-gradient-to-br from-violet-50 via-primary/5 to-sky-50
            border border-primary/10
            transition-all duration-300
            hover:shadow-md hover:border-primary/20
            group
        ">
            <div className="p-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/80 shadow-sm">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">Picks for {babyName}</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    {count} new items we think you'll love
                </p>
                <Link 
                    to="/products?recommended=true" 
                    className="
                        mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary 
                        transition-all duration-300
                        hover:gap-2.5
                        group-hover:underline
                    "
                >
                    Browse now
                    <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
            </div>
        </div>
    )
}
