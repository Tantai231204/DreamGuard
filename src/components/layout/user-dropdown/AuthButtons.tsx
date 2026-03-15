import { Link } from "react-router-dom"
import { AppRoute } from "../../../lib/constants"
import { Button } from "../../ui/button"

export function AuthButtons() {
    return (
        <div className="p-4 space-y-2.5">
            <Button variant="premium" asChild className="w-full h-11 rounded-xl">
                <Link to={AppRoute.LOGIN}>
                    Sign in
                </Link>
            </Button>

            <Button asChild variant="ghost" className="w-full h-11 rounded-xl text-slate-500 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <Link to={AppRoute.REGISTER}>
                    Create an account
                </Link>
            </Button>
        </div>
    )
}
