import { Sparkles } from "lucide-react"

export function GuestHeader() {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-sky-100/50 p-6 text-center">
            {/* Soft decorative blob */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-sky-200/30 rounded-full blur-xl" />

            <div className="relative">
                <div className="
                    inline-flex h-16 w-16 items-center justify-center rounded-2xl 
                    bg-white/90 backdrop-blur-sm shadow-lg shadow-primary/10
                    ring-1 ring-white/50
                ">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-800 text-lg">Welcome!</h3>
                <p className="text-sm text-gray-500 mt-1">Sign in to unlock all features</p>
            </div>
        </div>
    )
}
