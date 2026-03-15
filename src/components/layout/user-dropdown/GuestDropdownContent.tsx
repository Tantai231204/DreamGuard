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
                w-72 rounded-2xl border border-gray-100 bg-white p-0 overflow-hidden
                shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)]
            "
        >
            <GuestHeader />

            <div className="p-5 border-b border-dashed border-[#4988c4]/10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">
                    Member Benefits
                </p>
                <div className="space-y-3">
                    <BenefitItem icon={<Gift className="h-4 w-4" />} text="Exclusive member deals" />
                    <BenefitItem icon={<Star className="h-4 w-4" />} text="Earn points on every order" />
                    <BenefitItem icon={<Baby className="h-4 w-4" />} text="Personalized baby picks" />
                    <BenefitItem icon={<Truck className="h-4 w-4" />} text="Free shipping on first order" />
                </div>
            </div>

            <AuthButtons />
        </DropdownMenuContent>
    )
}
