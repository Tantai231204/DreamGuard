import { ShieldCheck } from "lucide-react"

export function GuestHeader() {
    return (
        <div className="bg-[var(--color-primary-light)] p-5 text-center border-b border-gray-100">
            <div className="
                inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white border border-gray-200 mb-3
                transition-all duration-300
                hover:shadow-md hover:scale-105
            ">
                <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-bold text-gray-800 text-base">Chào mừng đến DreamGuard!</h3>
            <p className="text-sm text-gray-600 mt-1">Tổ ấm giấc ngủ cho bé yêu</p>
        </div>
    )
}
