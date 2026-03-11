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
        <div className="min-h-[80vh] flex items-center justify-center p-6">
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
                                className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500"
                            >
                                <CheckCircle2 className="w-12 h-12" />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold"
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

                <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                    {isSuccess ? "Order Confirmed!" : "Payment Failed"}
                </h1>

                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                    {isSuccess
                        ? "Thank you for your purchase. We've received your order and will start processing it right away."
                        : "Something went wrong with your payment transaction. Please try again or choose another payment method."}
                </p>

                {orderCode && (
                    <div className="bg-slate-50 rounded-2xl p-4 mb-8 flex items-center justify-between border border-slate-100">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Package className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Order Reference</span>
                        </div>
                        <span className="text-sm font-black text-slate-900">#{orderCode}</span>
                    </div>
                )}

                <div className="grid gap-4">
                    {isSuccess ? (
                        <>
                            <Button
                                onClick={() => navigate(AppRoute.PROFILE)}
                                className="h-14 rounded-2xl bg-slate-900 text-white font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-all group"
                            >
                                View My Orders
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate(AppRoute.HOME)}
                                className="h-14 rounded-2xl border-slate-200 font-bold text-sm uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Return Home
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={() => navigate(AppRoute.CHECKOUT)}
                                className="h-14 rounded-2xl bg-slate-900 text-white font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                            >
                                Try Again
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate(AppRoute.HOME)}
                                className="h-14 rounded-2xl font-bold text-sm uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
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
