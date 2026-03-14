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
            <div className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                <code className="text-xs font-bold text-slate-700 tracking-wider">
                    {code}
                </code>
            </div>
            <Button
                size="sm"
                variant="outline"
                disabled={!isActive}
                onClick={handleCopy}
                className="h-8 px-2.5 border-slate-200 hover:bg-[#4988c4] hover:border-[#4988c4] hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider"
            >
                {copied ? (
                    <>
                        <Check className="h-3.5 w-3.5 mr-1.5" />
                        Copied
                    </>
                ) : (
                    <>
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copy
                    </>
                )}
            </Button>
        </div>
    )
}
