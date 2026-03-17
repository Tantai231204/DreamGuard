import { Mail } from 'lucide-react'

export default function NewsletterSection() {
    return (
        <section className="relative w-full overflow-hidden border-t border-[var(--color-border)] bg-gradient-to-b from-[var(--color-footer-gradient-start)] via-[var(--color-footer-gradient-mid)] to-[var(--color-footer-gradient-end)]">
            {/* Background Image Watermark */}
            <div
                className="absolute inset-x-0 inset-y-0 bg-contain bg-no-repeat opacity-[0.6] pointer-events-none select-none"
                style={{ backgroundImage: "url('/images/longvu.png')" }}
            />

            <div className="relative container mx-auto max-w-7xl px-8 py-16 md:py-24">
                <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                    {/* ================= LEFT: Clean Typography ================= */}
                    <div className="flex flex-col gap-6 w-full text-left">
                        <div className="space-y-3">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 leading-none tracking-tight">
                                Stay in the loop <br className="hidden md:block" /> with us
                            </h2>
                            <p className="text-[14px] font-medium leading-relaxed text-slate-500 max-w-md">
                                Subscribe to receive exclusive access to bedding updates, member deals & certified baby safety tips.
                                We guard your inbox tightly!
                            </p>
                        </div>

                        {/* ===== Minimalist Email Input ===== */}
                        <div className="relative w-full max-w-md">
                            <div className="flex items-center w-full gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-xl shadow-slate-200/40 border border-slate-100/80 focus-within:border-[#4988c4]/30 focus-within:ring-4 focus-within:ring-[#4988c4]/5 transition-all">
                                <div className="flex items-center justify-center h-9 w-9 bg-[#4988c4]/5 text-[#4988c4] rounded-xl shrink-0">
                                    <Mail className="w-4 h-4" />
                                </div>

                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="flex-1 bg-transparent outline-none border-none text-[13px] font-medium text-slate-700 placeholder:text-slate-300"
                                />

                                <button className="rounded-xl px-5 py-2.5 bg-[#4988c4] hover:bg-[#4988c4]/90 text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95">
                                    Subscribe
                                </button>
                            </div>
                        </div>

                        {/* ===== Micro Trust Badges ===== */}
                        <div className="flex items-center gap-4 mt-2">
                            <div className="h-8 w-8 bg-white/80 p-1 rounded-lg border border-slate-100"><img src="/images/Standard 100 by OEKO-TEX .png" alt="Oeko tex" className="h-full w-full object-contain" /></div>
                            <div className="h-8 w-8 bg-white/80 p-1 rounded-lg border border-slate-100"><img src="/images/Polyurethane by CertiPUR-US.png" alt="CertiPUR" className="h-full w-full object-contain" /></div>
                            <div className="h-8 w-8 bg-white/80 p-1 rounded-lg border border-slate-100"><img src="/images/Global Organic Textile Standard.png" alt="GOTS" className="h-full w-full object-contain" /></div>
                            <span className="text-[10px] font-semibold text-slate-400">100% Certified Safety</span>
                        </div>
                    </div>

                    {/* ================= RIGHT: Offset Wireframe Concept ================= */}
                    <div className="relative flex justify-center items-center h-full">
                        <div className="relative w-full max-w-md">

                            {/* Accent Frame Underlying Wireframe */}
                            <div className="absolute top-6 -right-6 aspect-[4/3] w-full border-2 border-dashed border-[#4988c4]/30 rounded-[2.5rem] z-0" />

                            {/* Main Frame Layer on top */}
                            <div className="relative aspect-[4/3] w-full rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] border-2 border-white z-10 transition-transform duration-500 hover:scale-[1.01] cursor-pointer">
                                <img
                                    src="/images/babyset.jpg"
                                    alt="Family on bed setup"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
