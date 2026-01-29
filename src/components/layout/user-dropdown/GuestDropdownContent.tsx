import { Gift, Star, Baby, Truck } from "lucide-react"
import { DropdownMenuContent, DropdownMenuSeparator } from "../../ui/dropdown-menu"
import { GuestHeader } from "./GuestHeader"
import { BenefitItem } from "./BenefitItem"
import { AuthButtons } from "./AuthButtons"

export function GuestDropdownContent() {
    return (
        <DropdownMenuContent
            align="end"
            sideOffset={12}
            className="
                w-80 rounded-2xl border border-gray-100 bg-white p-0 overflow-hidden z-[9999]
                shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-4px_rgba(0,0,0,0.08)]
                data-[state=open]:animate-in data-[state=closed]:animate-out
                data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
                data-[state=closed]:scale-[0.98] data-[state=open]:scale-100
                data-[state=closed]:translate-y-1 data-[state=open]:translate-y-0
                duration-200 ease-out
                origin-top-right
            "
        >
            <GuestHeader />

            {/* Benefits */}
            <div className="p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Đăng nhập để nhận
                </p>
                <div className="grid grid-cols-2 gap-2">
                    <BenefitItem icon={<Gift className="h-4 w-4" />} text="Ưu đãi độc quyền" />
                    <BenefitItem icon={<Star className="h-4 w-4" />} text="Tích điểm đổi quà" />
                    <BenefitItem icon={<Baby className="h-4 w-4" />} text="Gợi ý theo bé" />
                    <BenefitItem icon={<Truck className="h-4 w-4" />} text="Freeship 500k" />
                </div>
            </div>

            <DropdownMenuSeparator className="bg-gray-100" />

            <AuthButtons />
        </DropdownMenuContent>
    )
}
