import { Gift, Star, Baby, Truck } from "lucide-react"
import { DropdownMenuContent } from "../../ui/dropdown-menu"
import { GuestHeader } from "./GuestHeader"
import { BenefitItem } from "./BenefitItem"
import { AuthButtons } from "./AuthButtons"

export function GuestDropdownContent() {
    return (
        <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="
                w-80 rounded-3xl border-0 bg-white/95 backdrop-blur-xl p-0 overflow-hidden z-[9999]
                shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2),0_10px_20px_-10px_rgba(0,0,0,0.1)]
                ring-1 ring-black/5
                data-[state=open]:animate-in data-[state=closed]:animate-out
                data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
                data-[state=closed]:scale-95 data-[state=open]:scale-100
                data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2
                duration-200
            "
        >
            <GuestHeader />

            {/* Perks */}
            <div className="p-4 space-y-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Member benefits
                </p>
                <div className="grid grid-cols-2 gap-2">
                    <BenefitItem icon={<Gift className="h-4 w-4" />} text="Exclusive deals" />
                    <BenefitItem icon={<Star className="h-4 w-4" />} text="Earn rewards" />
                    <BenefitItem icon={<Baby className="h-4 w-4" />} text="Baby picks" />
                    <BenefitItem icon={<Truck className="h-4 w-4" />} text="Free shipping" />
                </div>
            </div>

            <AuthButtons />
        </DropdownMenuContent>
    )
}
