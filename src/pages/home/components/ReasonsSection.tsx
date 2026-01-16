
const reasons = [
    {
        id: 1,
        title: "For the baby's development",
        description: "Providing restful sleep throughout each stage of development.",
        icon: "/images/embeicon.svg",
    },
    {
        id: 2,
        title: "Health care",
        description: "DreamGuard places the health and safety of your baby before all else.",
        icon: "/images/traitimicon.svg",
    },
    {
        id: 3,
        title: "Consider the smallest details",
        description:
            "The center focuses on improving materials that are safe and supportive of the baby's movements.",
        icon: "/images/likeicon.svg",
    },
    {
        id: 4,
        title: "It begins with understanding",
        description:
            "Build a connection and be there for your baby during each stage.",
        icon: "/images/handshakeicon.svg",
    },
]


const certifications = [
    {
        id: 1,
        name: "Standard 100 by OEKO-TEX®",
        description: "Certificate 09.HCN.68375",
        icon: "/images/Standard 100 by OEKO-TEX .png",
    },
    {
        id: 2,
        name: "Polyurethane by CertiPUR-US®",
        description:
            "Certificate does not test on heavy metals. Does not harm the respiratory system",
        icon: "/images/Polyurethane by CertiPUR-US.png",
    },
    {
        id: 3,
        name: "Global Organic Textile Standard",
        description:
            "Made of 100% organic cotton with no use of any harmful chemical-based organic textile standards.",
        icon: "/images/Global Organic Textile Standard.png",
    },
]



export default function ReasonsSection() {
    return (
        <section className="py-18 bg-white">
            <div className="container mx-auto max-w-4xl px-4 mb-12">

                {/* ===== HEADER ===== */}
                <div className="text-center mb-20">
                    <h2 className="text-2xl md:text-3xl font-semibold text-[#4A7EDC] mb-3">
                        Reasons for choosing DreamGuard
                    </h2>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Trusted and used by over 100 small families nationwide,<br />
                        here's why.
                    </p>
                </div>

                {/* ===== REASONS ===== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-24">
                    {reasons.map((item) => (
                        <div key={item.id} className="text-center max-w-[220px] mx-auto">
                            {/* Icon blob */}
                            <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center blob">
                                <img
                                    src={item.icon}
                                    alt={item.title}
                                    className="w-30 h-30 object-fit"
                                />
                            </div>

                            <h3 className="text-xs font-medium text-[#4A7EDC] mb-2">
                                {item.title}
                            </h3>
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ===== CERTIFICATION BOX ===== */}
                <div
                    className="
    relative
    rounded-[32px]
    px-8 py-14
    overflow-hidden
  "
                >
                    {/* ===== Background image ===== */}
                    <div
                        className="
    absolute inset-0
    bg-[url('/images/bg-section.png')]
    bg-no-repeat
    bg-contain
    bg-center
  "
                    />
                    {/* ===== CONTENT ===== */}
                    <div className="relative z-10 px-8 mb-2">
                        <div className="text-center mb-6">
                            <h3 className="text-base md:text-lg font-semibold text-[#4A7EDC] mb-2">
                                We care about your baby's health.
                            </h3>
                            <p className="text-[11px] text-gray-500 leading-relaxed max-w-xl mx-auto">
                                DreamGuard pays attention to and considers even the smallest details
                                to create product lines that are safe for your baby's health.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {certifications.map((cert) => (
                                <div key={cert.id} className="text-center max-w-[220px] mx-auto">
                                    <div className="mx-auto mb-3 ml-4 w-18 h-18 rounded-full shadow-sm flex items-center justify-center">
                                        <img
                                            src={cert.icon}
                                            alt={cert.name}
                                            className="w-18 h-18 object-contain"
                                        />
                                    </div>

                                    <h4 className="text-[11px] font-medium text-[#4A7EDC] mb-1.5">
                                        {cert.name}
                                    </h4>
                                    <p className="text-[10px] text-gray-500 leading-relaxed">
                                        {cert.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>


            </div>
        </section>
    )
}


