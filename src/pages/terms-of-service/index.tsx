import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  FileCheck,
  Handshake,
  PackageCheck,
  Scale,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import { useBreadcrumb } from "@/components/common/BreadcrumbNav";
import { AppRoute } from "@/lib/constants";

const overviewItems = [
  "These Terms of Service govern how customers access, browse, and purchase products or services through DreamGuard channels.",
  "By placing an order or using DreamGuard services, customers agree to the current terms, policies, and operating procedures published on official channels.",
  "Specific product rules, return conditions, and warranty scope may be supplemented by dedicated policy pages when applicable.",
];

const corePrinciples = [
  {
    title: "Use of the website",
    icon: ShieldCheck,
    points: [
      "Customers must provide accurate information when creating an account, placing an order, or requesting support.",
      "DreamGuard may suspend or refuse service if false information, abuse, or actions affecting system safety are detected.",
      "Website content, product descriptions, prices, and promotions may be updated without prior notice when necessary.",
    ],
  },
  {
    title: "Orders and confirmation",
    icon: PackageCheck,
    points: [
      "An order is considered valid only after DreamGuard confirms successful receipt and acceptance for processing.",
      "DreamGuard may contact customers to verify delivery details, stock status, customization information, or payment data before final confirmation.",
      "In exceptional cases such as stock errors or pricing mistakes, DreamGuard may cancel or adjust the order after notifying the customer.",
    ],
  },
  {
    title: "Pricing and payment",
    icon: Wallet,
    points: [
      "Displayed prices may include or exclude supporting fees depending on the current sales configuration and campaign rules.",
      "Customers are responsible for reviewing the final order amount, delivery fee, discounts, and payment method before checkout.",
      "Promotions, vouchers, or bundled offers are valid only within the stated scope and effective period.",
    ],
  },
];

const responsibilityBlocks = [
  {
    title: "Customer responsibilities",
    badge: "Required conduct",
    icon: BadgeCheck,
    points: [
      "Provide complete and truthful personal, contact, and delivery information.",
      "Inspect the order, preserve invoices, and follow product care instructions after receiving goods.",
      "Use support channels in good faith and cooperate when DreamGuard needs additional evidence for returns or warranty claims.",
    ],
  },
  {
    title: "DreamGuard responsibilities",
    badge: "Service commitment",
    icon: Handshake,
    points: [
      "Provide product information, policy references, and order support through official channels.",
      "Handle eligible returns, warranties, and complaints based on published policies and verified order records.",
      "Take reasonable steps to maintain system operation, update information, and protect customer transaction flow.",
    ],
  },
];

const restrictedCases = [
  "Using the website or support channels for fraudulent, disruptive, or unlawful purposes.",
  "Impersonating another person, falsifying invoices, or providing fabricated order evidence.",
  "Copying, extracting, or exploiting DreamGuard content, branding, or product assets without authorization.",
  "Interfering with payment flow, account security, or other users' ability to access the website normally.",
];

const policyReferences = [
  {
    title: "Return Policy",
    description:
      "Applies when customers request exchanges, returns, or refunds for valid eligible orders.",
    to: AppRoute.RETURN_POLICY,
  },
  {
    title: "Warranty Policy",
    description:
      "Defines coverage duration, covered defects, excluded cases, and the warranty handling workflow.",
    to: AppRoute.WARRANTY_POLICY,
  },
  {
    title: "Help Center",
    description:
      "Provides support channels and quick guidance for after-sales issues, product care, and order questions.",
    to: AppRoute.HELP_CENTER,
  },
];

const legalNotes = [
  "DreamGuard may revise these terms when business operations, legal requirements, or service processes change.",
  "Updated terms become effective once published on official DreamGuard channels unless another effective date is stated.",
  "If a dispute arises, both parties should prioritize negotiation and documented support records before applying further legal measures.",
  "Any invalid provision does not automatically invalidate the remaining provisions of these terms.",
];

const sectionMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export default function TermsOfServicePage() {
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: "Home", href: AppRoute.HOME },
      { label: "Terms of Service", active: true },
    ]);

    return () => setItems([]);
  }, [setItems]);

  return (
    <div className="bg-white text-[#4988c4]-900">
      <section className="relative overflow-hidden border-b border-[#4988c4]-200 bg-[radial-gradient(circle_at_top_left,_rgba(73,136,196,0.18),_transparent_40%),linear-gradient(135deg,_#eff6ff_0%,_#ffffff_52%,_rgba(191,219,254,0.22)_100%)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4988c4]/50 to-transparent" />
        <div className="container mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20">
          <motion.div {...sectionMotion} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4988c4]/15 bg-white/85 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#4988c4] shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Terms of Service
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-black uppercase tracking-tight text-[#4988c4]-950 sm:text-5xl lg:text-6xl">
              The rules that define how customers use DreamGuard channels and services.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#4988c4]-600 sm:text-base">
              These terms set the baseline for browsing, ordering, payment, support requests, and the shared responsibilities between DreamGuard and its customers.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={AppRoute.PRODUCTS}
                className="inline-flex items-center gap-2 rounded-full bg-[#4988c4] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#3a73a8]"
              >
                Browse products
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={AppRoute.HELP_CENTER}
                className="inline-flex items-center gap-2 rounded-full border border-[#4988c4]-300 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#4988c4]-700 transition hover:border-[#4988c4] hover:text-[#4988c4]"
              >
                Help Center
              </Link>
            </div>
          </motion.div>

          <motion.div {...sectionMotion} transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] as const }} className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {overviewItems.map((item, index) => (
              <div
                key={item}
                className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4988c4]/10 text-sm font-black text-[#4988c4]">
                  0{index + 1}
                </div>
                <p className="mt-4 text-sm leading-7 text-[#4988c4]-700">{item}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <motion.div {...sectionMotion}>
          <div className="gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">Core rules</p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">How ordering and service usage are governed</h2>
              <br/>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#4988c4]-600">
              These rules support consistent operations across DreamGuard sales channels while leaving detailed returns and warranty handling to the dedicated policy pages.
            </p>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            {corePrinciples.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-[30px] border border-[#4988c4]-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#4988c4]/10 text-[#4988c4]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-black uppercase tracking-wide text-[#4988c4]-950">{item.title}</h3>
                  <div className="mt-5 space-y-3">
                    {item.points.map((point) => (
                      <div key={point} className="flex gap-3 text-sm leading-7 text-[#4988c4]-700">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#4988c4]" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="border-y border-[#4988c4]-100 bg-[#4988c4]-50/60">
        <div className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <motion.div {...sectionMotion}>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">Responsibilities</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">What customers and DreamGuard are each expected to do</h2>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              {responsibilityBlocks.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[32px] border border-[#4988c4]-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#4988c4]/10 text-[#4988c4]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-wide text-[#4988c4]-950">{item.title}</h3>
                        <span className="mt-3 inline-flex rounded-full border border-[#4988c4]-200 bg-[#4988c4]-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#4988c4]-500">
                          {item.badge}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 space-y-3">
                      {item.points.map((point) => (
                        <div key={point} className="flex gap-3 text-sm leading-7 text-[#4988c4]-700">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#4988c4]" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <motion.div {...sectionMotion} className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-[#4988c4]-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">Prohibited behavior</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">Actions that may lead to refusal or restriction of service</h2>
            <p className="mt-4 text-sm leading-7 text-[#4988c4]-600">
              DreamGuard reserves the right to limit service access when customer actions threaten legal compliance, transaction integrity, or platform safety.
            </p>
          </div>

          <div className="grid gap-4">
            {restrictedCases.map((item) => (
              <div key={item} className="flex gap-4 rounded-[24px] border border-[#4988c4]-200 bg-white px-5 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <p className="text-sm leading-7 text-[#4988c4]-700">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="border-y border-[#4988c4]-200 bg-[#4988c4]-950">
        <div className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <motion.div {...sectionMotion} className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[32px] border border-white/10 bg-[#4988c4]/5 p-7 backdrop-blur">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#4988c4]/10 text-[#7dd3e8]">
                <FileCheck className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-black uppercase tracking-tight">Policy references</h2>
              <div className="mt-5 space-y-4">
                {policyReferences.map((item) => (
                  <Link key={item.title} to={item.to} className="block rounded-[24px] border border-[#4988c4]/10 bg-[#4988c4]/5 p-5 transition hover:border-white/20 hover:bg-white/10">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[#4988c4]">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#4988c4]-100">{item.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[#7dd3e8]" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#4988c4]/5 p-7 backdrop-blur">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#4988c4]/10 text-[#7dd3e8]">
                <Scale className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-black uppercase tracking-tight">Legal and operational notes</h2>
              <div className="mt-5 space-y-3">
                {legalNotes.map((note) => (
                  <div key={note} className="flex gap-3 text-sm leading-7 text-[#4988c4]-100">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#7dd3e8]" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}