import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  CreditCard,
  PackageCheck,
  RotateCcw,
  Ruler,
  ShieldAlert,
  Sparkles,
  Truck,
} from "lucide-react";

import { AppRoute } from "@/lib/constants";

const scopeItems = [
  "Applies to mattresses, blankets, sheets, pillows, and accessories purchased at authorized stores, showrooms, or online sales channels.",
  "Does not apply to custom-sized or specially requested products.",
  "Does not apply to promotional, clearance, or special offer items, except in cases of manufacturing defects.",
];

const timelineItems = [
  {
    value: "07 days",
    label: "Online Purchase",
    detail: "The calculation starts from the date the customer receives the goods.",
  },
  {
    value: "03 days",
    label: "In-Store Purchase",
    detail: "The calculation starts from the date the purchase is completed in-store.",
  },
  {
    value: "10 days",
    label: "Manufacturer Defect",
    detail: "Applies to return requests due to technical defects or incorrect delivery.",
  },
];

const conditions = [
  "Products must be unused, unwashed, and show no signs of use.",
  "The surface must be clean, free of dirt, scratches, and strange odors.",
  "All original tags, labels, packaging, and any included gifts must be intact.",
  "A valid purchase receipt or order information must be provided for verification.",
  "Each full-price product is eligible for only one exchange.",
];

const validCases = [
  {
    title: "Return due to manufacturer defect",
    badge: "Free",
    icon: ShieldAlert,
    points: [
      "Incorrect model, color, or size compared to the order.",
      "Technical defects such as abnormal mattress sagging or deformation.",
      "Bedding torn, seams coming apart, fabric cracking, pilling, or color bleeding on the first wash without using detergent.",
      "Missing items or damage during transportation.",
    ],
    resolution: [
      "Replace with the same type of product or return and refund as agreed.",
      "DreamGuard covers 100% of the related shipping and handling costs.",
    ],
  },
  {
    title: "Exchange according to customer needs",
    badge: "Conditional",
    icon: RotateCcw,
    points: [
      "Products are not defective but still meet the valid return conditions.",
      "Exchange for a product of equal or higher value than the original product.",
      "If exchanging for a lower-value product, the difference will not be refunded.",
    ],
    resolution: [
      "Processing fees and shipping costs may be incurred and are the responsibility of the customer.",
      "Sizes from 1.6m and above are supported flexibly; sizes below 1.6m may incur a maximum surcharge of 30% of the product value.",
    ],
  },
];

const excludedCases = [
  "Products that have been used, washed, or show signs of actual use.",
  "Missing original packaging, tags, receipts, or order information for verification.",
  "Returns due to subjective reasons such as dislike, incompatibility, or change of mind.",
  "Custom-made or specially requested products, except in cases of manufacturer defects.",
  "Promotional, deeply discounted, or clearance items.",
  "Delivery complaints arising after 48 hours from the time of receipt.",
];

const processSteps = [
  {
    title: "Contact Customer Service",
    detail:
      "Submit a request via DreamGuard's official hotline, fanpage, or email.",
    icon: PackageCheck,
  },
  {
    title: "Provide Evidence",
    detail:
      "Prepare the order code along with images or videos clearly showing the product's condition.",
    icon: ClipboardCheck,
  },
  {
    title: "Confirm Conditions",
    detail:
      "The customer service team verifies the validity and provides instructions on how to return or exchange the product directly at the store.",
    icon: BadgeCheck,
  },
  {
    title: "Inspection and Processing",
    detail:
      "DreamGuard inspects the product within 1 to 2 business days and completes the exchange or return within 5 to 7 business days.",
    icon: Truck,
  },
];

const refundAndRepair = [
  {
    title: "Refund Policy",
    icon: CreditCard,
    points: [
      "Refunds are processed via the original payment method or as agreed with the customer.",
      "Refunds are processed within 3 to 7 business days after confirming eligibility.",
      "Exchanges based on customer requests may incur processing fees.",
    ],
  },
  {
    title: "Product Repair Support",
    icon: Ruler,
    points: [
      "Free repair support is provided once if the policy applies to the product.",
      "Only supports repairs from larger sizes to smaller sizes, e.g., fitted sheet to flat sheet.",
      "In cases requiring additional fabric or complex repairs, fees will be charged based on actual costs.",
    ],
  },
];

const importantNotes = [
  "Check the product immediately upon receipt and before use.",
  "Keep the invoice, packaging, and tags to ensure return rights.",
  "Do not use the product if you intend to request a return or exchange.",
  "All requests are only accepted through DreamGuard's official channels.",
];

const sectionMotion = {
  initial: { opacity: 1, y: 0 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0 },
};

export default function ReturnPolicyPage() {
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-page-hero]",
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.28, ease: "power1.out" }
      );

      const cards = gsap.utils.toArray<HTMLElement>("[data-page-card]").slice(0, 8);
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.24, stagger: 0.03, delay: 0.04, ease: "power1.out" }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="bg-slate-50 text-slate-800">
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-[#eff6ff] to-white">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4988c4]/50 to-transparent" />
        <div className="container mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20">
          <motion.div {...sectionMotion} data-page-hero className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4988c4]/15 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#4988c4] shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Return Policy
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-black uppercase tracking-tight text-[#4988c4]-950 sm:text-5xl lg:text-6xl">
              Transparent Return Policy for a Worry-Free Shopping Experience.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#4988c4]-600 sm:text-base">
              DreamGuard has established a clear return policy for mattresses, blankets, sheets,
              pillows, and accessories, helping customers know exactly when they are eligible for support,
              what they need to prepare, and how the process works.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={AppRoute.PRODUCTS}
                className="inline-flex items-center gap-2 rounded-full bg-[#4988c4] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#3a73a8]"
              >
                View Products
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={AppRoute.HOME}
                className="inline-flex items-center gap-2 rounded-full border border-[#4988c4]-300 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#4988c4]-700 transition hover:border-[#4988c4] hover:text-[#4988c4]"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>

          <motion.div
            {...sectionMotion}
            transition={{
              duration: 0.5,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1"
          >
            {timelineItems.map((item) => (
              <div
                key={item.label}
                data-page-card
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]-400">
                  Duration
                </p>
                <p className="mt-4 text-3xl font-black text-[#4988c4]">
                  {item.value}
                </p>
                <h2 className="mt-3 text-lg font-black uppercase tracking-wide text-[#4988c4]-900">
                  {item.label}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#4988c4]-600">
                  {item.detail}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <motion.div
          {...sectionMotion}
          className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="rounded-[32px] border border-[#4988c4]-200 bg-[#4988c4] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#bde8f5]">
              1. Scope of application
            </p>
            <h2 className="mt-4 text-3xl font-black uppercase tracking-tight">
              Which orders are eligible for returns
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#fff]">
              This policy applies to products purchased through DreamGuard's official system, excluding personalized orders or those in special clearance sales.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {scopeItems.map((item, index) => (
              <div
                key={item}
                data-page-card
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4988c4]/10 text-sm font-black text-[#4988c4]">
                  0{index + 1}
                </div>
                <p className="mt-4 text-sm leading-7 text-[#4988c4]-700">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="border-y border-[#4988c4]-200 bg-[#4988c4]-50/70">
        <div className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <motion.div {...sectionMotion}>
            <div className=" gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">
                  2. Eligibility requirements
                </p>
                <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">
                  Only accepted when the product is in its original condition
                </h2>
                <br/>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[#4988c4]-600">
                DreamGuard needs to accurately verify the condition of the product to protect
                the rights of both customers and the operational system.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {conditions.map((condition) => (
                <div
                  key={condition}
                  data-page-card
                  className="rounded-[24px] border border-[#4988c4]-200 bg-white p-5 shadow-[0_10px_40px_rgba(15,23,42,0.04)]"
                >
                  <BadgeCheck className="h-5 w-5 text-[#4988c4]" />
                  <p className="mt-4 text-sm leading-7 text-[#4988c4]-700">
                    {condition}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <motion.div {...sectionMotion}>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">
            3. Valid Cases
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">
            Distinguishing between manufacturing defects and exchange requests
          </h2>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            {validCases.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  data-page-card
                  className="rounded-[32px] border border-[#4988c4]-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#4988c4]/10 text-[#4988c4]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-wide text-[#4988c4]-950">
                          {item.title}
                        </h3>
                        <span className="mt-3 inline-flex rounded-full border border-[#4988c4]-200 bg-[#4988c4]-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#4988c4]-500">
                          {item.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {item.points.map((point) => (
                      <div
                        key={point}
                        className="flex gap-3 text-sm leading-7 text-[#4988c4]-700"
                      >
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#4988c4]" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-[24px] bg-[#4988c4] p-5 text-white">
                    <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#fff]">
                      Resolution Methods
                    </p>
                    <div className="mt-4 space-y-3">
                      {item.resolution.map((point) => (
                        <div
                          key={point}
                          className="flex gap-3 text-sm leading-7 text-[#fff]"
                        >
                          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#7dd3e8]" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="border-y border-[#4988c4]-200 bg-[linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(239,246,255,0.7)_100%)]">
        <div className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <motion.div
            {...sectionMotion}
            className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="rounded-[32px] border border-[#4988c4]/15 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">
                4. Excluded Cases
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">
                Requests That Will Be Denied
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#4988c4]-600">
                After the specified period or when the product no longer meets the original condition standards, DreamGuard reserves the right to refuse returns or exchanges for any reason.
              </p>
            </div>

            <div className="grid gap-4">
              {excludedCases.map((item) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-[24px] border border-[#4988c4]-200 bg-white px-5 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.04)]"
                >
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-7 text-[#4988c4]-700">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <motion.div {...sectionMotion}>
          <div className="gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">
                5. Process
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">
                4 steps from receiving to completion
              </h2>
              <br/>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[#4988c4]-600">
              To shorten the processing time, customers should prepare order information and images proving the product's condition from the first step.
            </p>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-4">
            {processSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="rounded-[28px] border border-[#4988c4]-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4988c4]/10 text-[#4988c4]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.24em] text-[#4988c4]-300">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-black uppercase tracking-wide text-[#4988c4]-950">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#4988c4]-600">
                    {step.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="border-y border-[#4988c4]-200 bg-[#4988c4] text-white">
        <div className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <motion.div {...sectionMotion} className="grid gap-6 lg:grid-cols-2">
            {refundAndRepair.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[32px] border border-white/10 bg-white/5 p-7 backdrop-blur"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 text-[#7dd3e8]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-2xl font-black uppercase tracking-tight">
                    {item.title}
                  </h2>
                  <div className="mt-5 space-y-3">
                    {item.points.map((point) => (
                      <div
                        key={point}
                        className="flex gap-3 text-sm leading-7 text-white"
                      >
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#7dd3e8]" />
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
        <motion.div
          {...sectionMotion}
          className="rounded-[36px] border border-[#4988c4]/15 bg-[linear-gradient(135deg,_rgba(73,136,196,0.08)_0%,_rgba(255,255,255,1)_48%,_rgba(189,232,245,0.26)_100%)] p-8 shadow-[0_24px_80px_rgba(73,136,196,0.08)] lg:p-10"
        >
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">
            6. Important Notes
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">
            Key Points to Retain to Protect Your Rights
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {importantNotes.map((note) => (
              <div
                key={note}
                className="rounded-[24px] border border-white bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)]"
              >
                <PackageCheck className="h-5 w-5 text-[#4988c4]" />
                <p className="mt-4 text-sm leading-7 text-[#4988c4]-700">{note}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
