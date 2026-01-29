import { Link } from "react-router-dom"
import { LogIn, UserPlus, Phone } from "lucide-react"
import { AppRoute } from "../../../lib/constants"

export function AuthButtons() {
    return (
        <>
            {/* Actions */}
            <div className="p-3 space-y-2">
                <Link
                    to={AppRoute.LOGIN}
                    className="
                        flex items-center gap-2.5 w-full rounded-lg bg-primary px-4 py-2.5 text-white font-medium 
                        justify-center
                        transition-all duration-200 ease-out
                        hover:bg-[var(--color-primary-hover)] hover:shadow-md hover:scale-[1.02]
                        active:scale-[0.98]
                    "
                >
                    <LogIn className="h-4 w-4" />
                    Đăng nhập
                </Link>
                <Link
                    to={AppRoute.REGISTER}
                    className="
                        flex items-center gap-2.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-700 font-medium 
                        justify-center
                        transition-all duration-200 ease-out
                        hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm
                        active:scale-[0.98]
                    "
                >
                    <UserPlus className="h-4 w-4" />
                    Tạo tài khoản mới
                </Link>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 text-center border-t border-gray-100">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Cần hỗ trợ? 
                    <span className="
                        text-primary font-medium cursor-pointer 
                        transition-colors duration-200
                        hover:underline hover:text-[var(--color-primary-hover)]
                    ">
                        Liên hệ ngay
                    </span>
                </p>
            </div>
        </>
    )
}
