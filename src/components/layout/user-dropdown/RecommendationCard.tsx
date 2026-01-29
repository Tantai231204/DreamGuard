import { Link } from "react-router-dom"
import { Sparkles, ChevronRight } from "lucide-react"

interface RecommendationCardProps {
    babyName: string
    count: number
}

export function RecommendationCard({ babyName, count }: RecommendationCardProps) {
    return (
        <div className="
            mt-2 mx-1 rounded-lg bg-[var(--color-primary-light)] border border-primary/20 p-3
            transition-all duration-200
            hover:border-primary/40 hover:shadow-sm
            group
        ">
            <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                <span className="text-xs font-semibold">Gợi ý cho bé</span>
            </div>
            <p className="mt-1 text-xs text-gray-600">
                {count} sản phẩm mới phù hợp với {babyName}
            </p>
            <Link 
                to="/products?recommended=true" 
                className="
                    mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary 
                    transition-all duration-200
                    hover:underline hover:gap-2
                "
            >
                Xem ngay 
                <ChevronRight className="h-3 w-3 transition-transform duration-200" />
            </Link>
        </div>
    )
}
