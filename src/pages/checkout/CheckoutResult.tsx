import { useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { AppRoute } from "@/lib/constants"
import { CheckCircle2, XCircle, Package, ArrowRight, Home, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"
import { useCart } from "@/store/useCart"

export default function CheckoutResult() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { clearCart } = useCart()
    const responseCode = searchParams.get("vnp_ResponseCode")
    const transactionStatus = searchParams.get("vnp_TransactionStatus")
    const orderCode = searchParams.get("vnp_TxnRef") || searchParams.get("orderCode")
    const isCODSuccess = !responseCode && !transactionStatus && !!orderCode;
    const isSuccess = responseCode === "00" || transactionStatus === "00" || isCODSuccess;

    useEffect(() => {
        if (isSuccess) {
            clearCart()
        }
    }, [isSuccess, clearCart])

    if (!responseCode && !transactionStatus && !orderCode) return null

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 relative">
            {/* Completion Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-slate-100 overflow-hidden">
                <motion.div
                    initial={{ width: "80%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-[#4988c4] shadow-[0_0_10px_#4988c4]"
                />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-10 text-center"
            >
                <div className="flex justify-center mb-8">
                    {isSuccess ? (
                        <div className="relative">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12, delay: 0.1 }}
                                className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-[#4988c4]"
                            >
                                <CheckCircle2 className="w-12 h-12" />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#4988c4] flex items-center justify-center text-white text-[10px] font-black tracking-tighter shadow-lg shadow-blue-200"
                            >
                                OK
                            </motion.div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12, delay: 0.1 }}
                            className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center text-red-500"
                        >
                            <XCircle className="w-12 h-12" />
                        </motion.div>
                    )}
                </div>

                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">
                    {isSuccess ? "Order Confirmed!" : "Payment Failed"}
                </h1>

                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                    {isSuccess
                        ? "Thank you for your purchase. We've received your order and will start processing it right away."
                        : "Something went wrong with your payment transaction. Please try again or choose another payment method."}
                </p>

                {orderCode && (
                    <div className="bg-slate-50/50 rounded-2xl p-5 mb-8 flex items-center justify-between border border-slate-100/50">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Package className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Order Reference</span>
                        </div>
                        <span className="text-sm font-black text-[#4988c4]">#{orderCode}</span>
                    </div>
                )}

                <div className="grid gap-4">
                    {isSuccess ? (
                        <>
                            <Button
                                onClick={() => navigate(AppRoute.PROFILE)}
                                className="h-14 rounded-2xl bg-gradient-to-r from-[#4988c4] to-[#3a73a8] text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                            >
                                View My Orders
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate(AppRoute.HOME)}
                                className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Return Home
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={() => navigate(AppRoute.CHECKOUT)}
                                className="h-14 rounded-2xl bg-gradient-to-r from-[#4988c4] to-[#3a73a8] text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all"
                            >
                                Try Again
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate(AppRoute.HOME)}
                                className="h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-all"
                            >
                                Cancel & Return
                            </Button>
                        </>
                    )}
                </div>

                {isSuccess && (
                    <div className="mt-10 pt-8 border-t border-slate-50">
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                            <ShoppingBag className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">DreamGuard Official Store</span>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
