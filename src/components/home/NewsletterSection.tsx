import { Mail } from 'lucide-react'

export default function NewsletterSection() {
    return (
        <section className="relative w-full overflow-hidden border-t border-[var(--color-border)] bg-gradient-to-b from-[var(--color-footer-gradient-start)] via-[var(--color-footer-gradient-mid)] to-[var(--color-footer-gradient-end)]">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-contain bg-no-repeat opacity-70"
                style={{ backgroundImage: "url('src/assets/images/longvu.png')" }}
            />

            <div className="relative container mx-auto max-w-7xl px-4 py-16 md:py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* ================= LEFT ================= */}
                    <div className="flex flex-col w-full gap-4 animate-[fadeInLeft_0.8s_ease-out]">
                        <div className="text-center">
                            <h2 className="text-base md:text-lg font-semibold leading-tight text-gray-900">
                                Subscribe To Get The Latest News About Us
                            </h2>
                            <p className="mt-3 text-xs md:text-sm leading-relaxed text-gray-700">
                                Sign Up For Our Newsletter & Knowing About <br />
                                Offers We Never Spam Your Inbox, So Don't Worry.
                            </p>
                        </div>

                        {/* ===== Email Input ===== */}
                        <div className="relative w-full mt-2">
                            <div className="flex items-center w-full gap-2 px-4 py-3 rounded-full bg-white/90 backdrop-blur-sm border-2 border-gray-800 transition-all duration-300 hover:border-[var(--color-primary)] focus-within:border-[var(--color-primary)] shadow-sm">
                                <Mail
                                    className="w-[18px] h-[18px] flex-shrink-0 text-gray-600"
                                    strokeWidth={2.2}
                                />

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 bg-transparent outline-none border-none text-sm text-gray-700 placeholder:text-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ================= RIGHT ================= */}
                    <div className="relative">
                        <div className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
                            <img
                                src="src/assets/images/chan_ga.jpg"
                                alt="Family on bed"
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
