import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeHelp,
  ClipboardList,
  Mail,
  MessageCircle,
  PackageSearch,
  Phone,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";

import { useBreadcrumb } from "@/components/common/BreadcrumbNav";
import { AppRoute } from "@/lib/constants";

const supportChannels = [
  {
    title: "Hotline support",
    detail:
      "Reach DreamGuard support directly for order updates, returns, warranties, and after-sales questions.",
    value: "1-800-DREAM-GD",
    href: "tel:1800123456",
    icon: Phone,
  },
  {
    title: "Email assistance",
    detail:
      "Send product images, invoices, order codes, or detailed descriptions for technical review.",
    value: "hello@dreamguard.com",
    href: "mailto:hello@dreamguard.com",
    icon: Mail,
  },
  {
    title: "Official fanpage",
    detail:
      "Use social messaging for quick pre-sales guidance or initial support requests before formal processing.",
    value: "Chat with DreamGuard",
    href: "https://facebook.com",
    icon: MessageCircle,
  },
];

const quickActions = [
  {
    title: "Track returns",
    description:
      "Review how DreamGuard handles exchanges, valid return windows, and product conditions.",
    to: AppRoute.RETURN_POLICY,
    icon: TimerReset,
  },
  {
    title: "Check warranty",
    description:
      "Understand covered defects, excluded cases, transport support, and care requirements.",
    to: AppRoute.WARRANTY_POLICY,
    icon: ShieldCheck,
  },
  {
    title: "Browse FAQs",
    description:
      "Find quick answers about ordering, delivery, customization, payment, and support workflows.",
    to: AppRoute.FAQ,
    icon: BadgeHelp,
  },
];

const supportTopics = [
  {
    title: "Order and delivery",
    points: [
      "Check order confirmation, delivery progress, or shipping support zones.",
      "Get help if items arrive late, incomplete, or with visible transport damage.",
    ],
    icon: PackageSearch,
  },
  {
    title: "Returns and exchanges",
    points: [
      "Confirm whether your item meets the return window and original-condition requirements.",
      "Prepare invoice details and image evidence before contacting support.",
    ],
    icon: ClipboardList,
  },
  {
    title: "Warranty and care",
    points: [
      "Verify warranty eligibility, approved defect types, and the inspection timeline.",
      "Review care instructions to avoid issues that may void support coverage.",
    ],
    icon: ShieldCheck,
  },
];

const serviceCommitments = [
  "Clear response channels for pre-sales and after-sales support.",
  "Structured handling for returns, exchanges, and warranty requests.",
  "Practical self-service resources so customers can check policy details before contacting support.",
  "Escalation support when an issue requires technical review or policy re-check.",
];

const sectionMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export default function HelpCenterPage() {
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: "Home", href: AppRoute.HOME },
      { label: "Help Center", active: true },
    ]);

    return () => setItems([]);
  }, [setItems]);

  return (
    <div className="bg-white text-[#4988c4]-900">
      <section className="relative overflow-hidden border-b border-[#4988c4]-200 bg-[radial-gradient(circle_at_top_left,_rgba(73,136,196,0.16),_transparent_40%),linear-gradient(135deg,_#eff6ff_0%,_#ffffff_50%,_rgba(125,211,232,0.18)_100%)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4988c4]/50 to-transparent" />
        <div className="container mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-20">
          <motion.div {...sectionMotion} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4988c4]/15 bg-white/85 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#4988c4] shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Help Center
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-black uppercase tracking-tight text-[#4988c4]-950 sm:text-5xl lg:text-6xl">
              One place for support before and after every DreamGuard order.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#4988c4]-600 sm:text-base">
              Use the Help Center to choose the right support channel, review policy pages, and quickly find the next step for delivery, returns, warranty claims, and product care.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={AppRoute.FAQ}
                className="inline-flex items-center gap-2 rounded-full bg-[#4988c4] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#3a73a8]"
              >
                Open FAQ
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={AppRoute.PRODUCTS}
                className="inline-flex items-center gap-2 rounded-full border border-[#4988c4]-300 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#4988c4]-700 transition hover:border-[#4988c4] hover:text-[#4988c4]"
              >
                View products
              </Link>
            </div>
          </motion.div>

          <motion.div {...sectionMotion} transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] as const }} className="grid gap-4">
            {supportChannels.map((channel) => {
              const Icon = channel.icon;

              return (
                <a
                  key={channel.title}
                  href={channel.href}
                  target={channel.href.startsWith("http") ? "_blank" : undefined}
                  rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
                  className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur transition hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4988c4]/10 text-[#4988c4]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-black uppercase tracking-wide text-[#4988c4]-950">{channel.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#4988c4]-600">{channel.detail}</p>
                  <p className="mt-4 text-sm font-black uppercase tracking-[0.16em] text-[#4988c4]">{channel.value}</p>
                </a>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <motion.div {...sectionMotion}>
          <div className="gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">Quick access</p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">Jump to the support path you need</h2>
              <br/>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#4988c4]-600">
              These pages cover the most common support journeys and reduce the time needed to confirm eligibility, documents, and next actions.
            </p>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-3">
            {quickActions.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className="rounded-[28px] border border-[#4988c4]-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] transition hover:border-[#4988c4]/40 hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4988c4]/10 text-[#4988c4]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-black uppercase tracking-wide text-[#4988c4]-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#4988c4]-600">{item.description}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#4988c4]">
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="border-y border-[#4988c4]-100 bg-[#4988c4]-50/60">
        <div className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <motion.div {...sectionMotion} className="grid gap-6 xl:grid-cols-3">
            {supportTopics.map((topic) => {
              const Icon = topic.icon;

              return (
                <div key={topic.title} className="rounded-[30px] border border-[#4988c4]-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#4988c4]/10 text-[#4988c4]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-black uppercase tracking-wide text-[#4988c4]-950">{topic.title}</h3>
                  <div className="mt-5 space-y-3">
                    {topic.points.map((point) => (
                      <div key={point} className="flex gap-3 text-sm leading-7 text-[#4988c4]-700">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#4988c4]" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <motion.div {...sectionMotion} className="rounded-[36px] border border-[#4988c4]/15 bg-[linear-gradient(135deg,_rgba(73,136,196,0.08)_0%,_rgba(255,255,255,1)_48%,_rgba(189,232,245,0.22)_100%)] p-8 shadow-[0_24px_80px_rgba(73,136,196,0.08)] lg:p-10">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">Support standard</p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">What customers should expect from DreamGuard support</h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {serviceCommitments.map((item) => (
              <div key={item} className="rounded-[24px] border border-white bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
                <BadgeHelp className="h-5 w-5 text-[#4988c4]" />
                <p className="mt-4 text-sm leading-7 text-[#4988c4]-700">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}