import { Sparkles } from "lucide-react"

export function GuestHeader() {
    return (
        <div className="p-6 text-center border-b border-gray-50">
            <div className="flex justify-center">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                    <Sparkles className="h-5 w-5" />
                </div>
            </div>
            <h3 className="mt-3 font-semibold text-gray-900 leading-none">Welcome to DreamGuard</h3>
            <p className="text-sm text-gray-500 mt-2">Sign in for the best experience</p>
        </div>
    )
}
