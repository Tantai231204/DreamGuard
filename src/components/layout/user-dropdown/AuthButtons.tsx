import { Link } from "react-router-dom"
import { ArrowRight, UserPlus } from "lucide-react"
import { AppRoute } from "../../../lib/constants"
import { Button } from "../../ui/button"

export function AuthButtons() {
    return (
        <div className="p-4 pt-2 space-y-2.5 bg-gradient-to-t from-gray-50/80 to-transparent">
            <Button asChild className="
                w-full h-11 rounded-xl font-medium
                bg-gradient-to-r from-primary to-primary/90
                hover:from-primary hover:to-primary/80
                shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30
                transition-all duration-300
                group
            ">
                <Link to={AppRoute.LOGIN} className="flex items-center justify-center gap-2">
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </Button>
            
            <Button asChild variant="ghost" className="
                w-full h-10 rounded-xl font-medium text-gray-600
                hover:bg-white hover:text-gray-900 hover:shadow-sm
                transition-all duration-300
            ">
                <Link to={AppRoute.REGISTER} className="flex items-center justify-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create account
                </Link>
            </Button>
        </div>
    )
}
