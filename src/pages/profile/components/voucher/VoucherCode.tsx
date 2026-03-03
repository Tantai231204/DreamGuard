import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoucherCodeProps {
    code: string
    isActive: boolean
    onClick?: (e: React.MouseEvent) => void
}

export default function VoucherCode({ code, isActive, onClick }: VoucherCodeProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!isActive) return
        
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        
        onClick?.(e)
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-dashed border-[#4988c4]/30 rounded-lg">
                <code className="text-sm font-bold text-[#4988c4] tracking-wider">
                    {code}
                </code>
            </div>
            <Button
                size="sm"
                variant="outline"
                disabled={!isActive}
                onClick={handleCopy}
                className="h-9 px-3 border-2 hover:bg-[#4988c4] hover:text-white transition-colors"
            >
                {copied ? (
                    <>
                        <Check className="h-4 w-4 mr-1" />
                        <span className="text-xs">Đã copy</span>
                    </>
                ) : (
                    <>
                        <Copy className="h-4 w-4 mr-1" />
                        <span className="text-xs">Copy</span>
                    </>
                )}
            </Button>
        </div>
    )
}
