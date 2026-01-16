export default function TradeInSection() {
    return (
        <section className="py-12 md:py-16 bg-[var(--color-tradein-bg)] relative overflow-hidden">
            {/* ===== BLUR LAYER 1 - Left Top ===== */}
            <div
                className="
    absolute
    w-[450px] h-[320px]
    rounded-full
    top-10 left-10
    blur-3xl
     opacity-100
    z-0
  "
                style={{
                    background:
                        'radial-gradient(ellipse at center, rgba(189,232,245,1) 0%, rgba(189,232,245,0.75) 40%, rgba(189,232,245,0.2) 70%)',
                }}
            />

            {/* ===== BLUR LAYER 2 - Right Center ===== */}
            <div
                className="
    absolute
    w-[480px] h-[340px]
    rounded-full
    top-1/2 right-10 -translate-y-1/2
    blur-3xl
     opacity-100
    z-0
  "
                style={{
                    background:
                        'radial-gradient(ellipse at center, rgba(116,164,176,1) 0%, rgba(116,164,176,0.7) 45%, rgba(116,164,176,0.2) 75%)',
                }}
            />

            {/* ===== BLUR LAYER 3 - Left Bottom ===== */}
            <div
                className="
    absolute
    w-[400px] h-[300px]
    rounded-full
    bottom-10 left-10
    blur-3xl
    opacity-100
    z-0
  "
                style={{
                    background:
                        'radial-gradient(ellipse at center, rgba(189,232,245,1) 0%, rgba(189,232,245,0.7) 50%, rgba(189,232,245,0.2) 80%)',
                }}
            />

            {/* ===== BLUR LAYER 4 - Top Center ===== */}
            <div
                className="
    absolute
    w-[420px] h-[310px]
    rounded-full
    top-0 left-1/2 -translate-x-1/2
    blur-3xl
    opacity-100
    z-0
  "
                style={{
                    background:
                        'radial-gradient(ellipse at center, rgba(116,164,176,1) 0%, rgba(116,164,176,0.7) 45%, rgba(116,164,176,0.2) 75%)',
                }}
            />

            {/* ===== BLUR LAYER 5 - Bottom Center ===== */}
            <div
                className="
    absolute
    w-[440px] h-[330px]
    rounded-full
    bottom-0 left-1/2 -translate-x-1/2
    blur-3xl
    opacity-100
    z-0
  "
                style={{
                    background:
                        'radial-gradient(ellipse at center, rgba(189,232,245,1) 0%, rgba(189,232,245,0.75) 40%, rgba(189,232,245,0.2) 70%)',
                }}
            />


            <div className="container mx-auto max-w-7xl px-4 relative z-10">
                <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
                    {/* Left Content */}
                    <div className="space-y-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase leading-tight">
                            Trade Old Comfort For New Care
                        </h2>

                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-gray-800">
                                The Children's Comfort Renewal Program
                            </h3>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                allows parents to trade in used children's bedding and upgrade to safer, more suitable products, while supporting sustainability and community care.
                            </p>
                        </div>

                        <button className="px-8 py-3 bg-[#74A4B0] hover:bg-cyan-500 text-white text-sm font-semibold uppercase tracking-wide rounded-md transition-colors duration-300 shadow-md hover:shadow-lg">
                            Choose A Course
                        </button>
                    </div>

                    {/* Right Image */}
                    <div className="relative">
                        <div className="relative aspect-[4/3] rounded-2xl overflow-visible">
                            {/* Pillow - Base layer */}
                            <img
                                src="/src/assets/images/pillow.svg"
                                alt="Trade in pillows"
                                className="w-full h-full object-contain"
                                loading="lazy"
                            />

                            {/* Cloud - Floating layer */}
                            <div className="absolute -top-10 -right-10 w-3/4 h-3/4 opacity-60 ">
                                <img
                                    src="/src/assets/images/clound.svg"
                                    alt="Cloud decoration"
                                    className="w-full h-full object-contain drop-shadow-lg"
                                    loading="lazy"
                                />
                            </div>
                            <div className="absolute top-60 right-60 w-2/3 h-2/3 ">
                                <img
                                    src="/src/assets/images/clound.svg"
                                    alt="Cloud decoration"
                                    className="w-full h-full object-contain drop-shadow-lg"
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
