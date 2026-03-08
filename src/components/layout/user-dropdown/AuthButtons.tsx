import { Link } from "react-router-dom"
import { AppRoute } from "../../../lib/constants"
import { Button } from "../../ui/button"

export function AuthButtons() {
    return (
        <div className="p-4 space-y-2">
            <Button asChild className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-none transition-colors">
                <Link to={AppRoute.LOGIN}>
                    Sign in
                </Link>
            </Button>

            <Button asChild variant="ghost" className="w-full h-11 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                <Link to={AppRoute.REGISTER}>
                    Create an account
                </Link>
            </Button>
        </div>
    )
}
