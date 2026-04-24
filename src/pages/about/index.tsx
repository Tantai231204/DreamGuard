import { motion } from 'framer-motion'
import { Heart, ShieldCheck, Sparkles, Baby, Moon } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Hero Section */}
            <section className="relative h-[45vh] min-h-[400px] flex items-center justify-center bg-slate-900">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="https://i.pinimg.com/1200x/20/5d/e1/205de1eb97a7d85644ffbfd05518e37f.jpg"
                        alt="DreamGuard Luxury Crib Bedding"
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-white" />
                </div>

                <div className="relative z-10 text-center space-y-4 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-[0.2em]"
                    >
                        <Sparkles className="w-2.5 h-2.5" />
                        Nurturing Every Dream
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none"
                    >
                        The Art of <br />
                        <span className="text-[#4988c4]">Peaceful Sleep</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/80 text-xs md:text-sm font-medium max-w-lg mx-auto"
                    >
                        DreamGuard provides premium, safety-certified bedding solutions for the next generation.
                    </motion.p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="container mx-auto max-w-6xl px-6 py-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="space-y-3">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Our Mission</h2>
                            <p className="text-base text-slate-600 leading-relaxed font-medium">
                                Since 2024, DreamGuard has been on a journey of pure love. We believe bedding is a gentle embrace that protects your child throughout the night.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: ShieldCheck, title: "Safety First", desc: "Natural latex & memory foam for spinal support." },
                                { icon: Baby, title: "Organic Sets", desc: "100% organic cotton, breathable & hypoallergenic." },
                                { icon: Moon, title: "Ergo Pillows", desc: "Designs to prevent flat-head syndrome." },
                                { icon: Heart, title: "Deep Clean", desc: "Professional UV-C sanitization services." }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-lg group">
                                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#4988c4] group-hover:bg-[#4988c4] group-hover:text-white transition-all flex-shrink-0">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                                        <p className="text-[11px] text-slate-500 font-medium leading-tight">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="aspect-[16/10] lg:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl border-8 border-white">
                            <img
                                src="https://i.pinimg.com/1200x/26/25/c2/2625c294c309956bd21b3334739bf24d.jpg"
                                alt="Premium Bedding"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-6 -left-6 p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-100 shadow-xl hidden md:block">
                            <div className="flex items-center gap-3">
                                <div className="text-3xl font-black text-[#4988c4]">10K+</div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                    Trusted<br />Families
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="bg-[#f8fafc] py-20 border-t border-slate-100 relative overflow-hidden">
                <div className="container mx-auto max-w-3xl px-6 text-center space-y-6 relative z-10">
                    <div className="inline-flex p-2 rounded-xl bg-white shadow-sm border border-slate-100">
                        <Heart className="w-6 h-6 text-[#4988c4]" />
                    </div>
                    <blockquote className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                        "A well-rested child is the foundation of a happy family. We protect dreams."
                    </blockquote>
                    <div className="space-y-1">
                        <div className="text-xs font-black text-[#4988c4] uppercase tracking-[0.2em]">DreamGuard Team</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Designing the Future of Sleep</div>
                    </div>
                </div>
            </section>
        </div>
    )
}
