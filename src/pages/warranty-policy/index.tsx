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
  "Applies to all blankets, sheets, pillows, and mattresses purchased through DreamGuard stores, showrooms, website, or authorized dealers.",
  "Each eligible product is issued with a warranty card or electronic warranty record activated through QR code or the system.",
  "Warranty duration is counted from the delivery date based on the invoice, order code, or warranty record.",
];

const durationHighlights = [
  {
    value: "5 - 15 years",
    label: "Mattresses",
    detail:
      "Natural latex, synthetic latex, and spring mattresses are covered based on product line.",
  },
  {
    value: "12 months",
    label: "Pillows & bedding",
    detail:
      "Rubber pillows, fiber pillows, blankets, and sheets are covered under product-specific conditions.",
  },
  {
    value: "6 months",
    label: "Accessories",
    detail:
      "Applies to selected accessories such as pillow covers, toppers, and protectors.",
  },
];

const warrantyGroups = [
  {
    title: "Mattresses",
    items: [
      "Natural latex and synthetic latex mattresses: 5 to 15 years.",
      "Spring mattresses: 5 to 15 years.",
      "Compressed foam mattresses: 5 to 10 years.",
    ],
  },
  {
    title: "Blankets, sheets, pillows, and accessories",
    items: [
      "Rubber pillows and fiber pillows: 12 months.",
      "Blankets and sheets: 12 months under special conditions.",
      "Accessories such as pillow covers, toppers, and protectors: 6 months.",
    ],
  },
];

const conditions = [
  "The product is still within the applicable warranty period.",
  "A valid warranty card or searchable electronic warranty record is available in the system.",
  "The customer can provide purchase proof such as invoice or order code.",
  "The product has been used and maintained according to the manufacturer's instructions.",
  "The issue is caused by manufacturing technique or material quality defects.",
];

const coveredDefects = [
  {
    title: "Covered for mattresses",
    badge: "Structural defects",
    icon: ShieldAlert,
    points: [
      "Excessive sagging beyond the accepted tolerance with loss of resilience.",
      "Latex core crumbling, breaking, or internal separation caused by material defects.",
      "Spring systems breaking, protruding, detaching, or deforming the mattress structure.",
      "Factory sewing and cover finishing defects such as seam opening or broken stitching.",
    ],
  },
  {
    title: "Covered for blankets, sheets, and pillows",
    badge: "Conditional replacement",
    icon: BadgeCheck,
    points: [
      "Color bleeding on the first wash when strong detergent is not used.",
      "Pilling or fiber clumping causing discomfort due to fabric faults.",
      "Weave cracking caused by material quality rather than snagging or tearing in use.",
      "Mattress outer covers are not included in the warranty scope.",
    ],
  },
];

const rejectedCases = [
  "The product is already outside the warranty period.",
  "No valid warranty card is available and the product cannot be found in the electronic warranty system.",
  "Damage is caused by improper use or storage, including placing mattresses on uneven floors or directly on tile surfaces.",
  "The mattress is exposed to strong sunlight, high heat sources, water damage, mold, or stains caused by moisture.",
  "Cuts, punctures, scratches, pet damage, or heavy impact are present on the product.",
  "The customer has dismantled, modified, or repaired the product without authorization.",
  "Natural wear from normal use does not affect the essential product quality.",
  "Damage results from disasters, fire, flooding, or other force majeure events.",
];

const processSteps = [
  {
    title: "Submit request",
    detail:
      "Contact the warranty center through hotline, website, fanpage, or official DreamGuard channels.",
    icon: PackageCheck,
  },
  {
    title: "Send verification data",
    detail:
      "Provide the warranty card, invoice, order code, and clear images or videos of the issue.",
    icon: ClipboardCheck,
  },
  {
    title: "Technical inspection",
    detail:
      "The technical team verifies the product condition within 3 to 10 working days.",
    icon: Truck,
  },
  {
    title: "Resolution method",
    detail:
      "Depending on eligibility, DreamGuard may repair, replace components, or exchange the product 1-for-1.",
    icon: RotateCcw,
  },
];

const costBlocks = [
  {
    title: "Warranty and transport costs",
    icon: CreditCard,
    points: [
      "If the defect is within warranty scope, customers do not pay inspection, repair, or replacement costs.",
      "For inner-city shipments, transport support may be partial or full depending on the current policy.",
      "For out-of-province shipments, transportation fees are agreed before processing.",
      "If the issue is outside warranty coverage, customers are responsible for related costs if any.",
    ],
  },
  {
    title: "Important customer notes",
    icon: BadgeCheck,
    points: [
      "Keep the warranty card or activate the electronic warranty immediately after purchase.",
      "Use and store the product according to DreamGuard care instructions.",
      "Contact support as soon as a defect is detected for faster handling.",
      "Customers may file a complaint if a warranty request is rejected incorrectly.",
    ],
  },
];

const mattressCareTips = [
  "Place the mattress on a flat, stable surface with a compatible bed frame.",
  "Do not place the mattress directly on the floor.",
  "Avoid direct sunlight, excessive heat, and high humidity.",
  "Use bed sheets and protectors to improve durability and hygiene.",
  "Do not wash the mattress with water or strong chemicals.",
  "Rotate the mattress every 3 to 6 months to reduce localized sagging.",
];

const sectionMotion = {
  initial: { opacity: 1, y: 0 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0 },
};

export default function WarrantyPolicyPage() {
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
        {" "}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4988c4]/50 to-transparent" />
        <div className="container mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20">
          <motion.div {...sectionMotion} data-page-hero className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4988c4]/15 bg-white/85 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#4988c4] shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Warranty Policy
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-black uppercase tracking-tight text-[#4988c4]-950 sm:text-5xl lg:text-6xl">
              Long-term warranty coverage designed for durable sleep products.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#4988c4]-600 sm:text-base">
              DreamGuard warranty policy clarifies the coverage period, valid
              defects, rejection cases, service process, transport support, and
              mattress care guidance so customers know exactly how support works
              after purchase.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={AppRoute.PRODUCTS}
                className="inline-flex items-center gap-2 rounded-full bg-[#4988c4] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#3a73a8]"
              >
                View products
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={AppRoute.RETURN_POLICY}
                className="inline-flex items-center gap-2 rounded-full border border-[#4988c4]-300 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#4988c4]-700 transition hover:border-[#4988c4] hover:text-[#4988c4]"
              >
                Return policy
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
            {durationHighlights.map((item) => (
              <div
                key={item.label}
                data-page-card
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]-400">
                  Coverage
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
              What is covered under warranty
            </h2>
            <p className="mt-4 text-sm leading-7 text-white">
              The policy applies to genuine DreamGuard sleep products and uses
              invoice data plus warranty records as the official basis for
              support.
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
                <p className="mt-4 text-sm leading-7 text-[#4988c4]-700">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="border-y border-[#4988c4]-100 bg-[#4988c4]-50/60">
        <div className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <motion.div {...sectionMotion}>
            <div className="gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">
                  2. Warranty duration
                </p>
                <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">
                  Coverage differs by product group
                </h2>
                <br />
              </div>
              <p className="max-w-xl text-sm leading-7 text-[#4988c4]-600">
                Exact duration for each item should match the warranty card,
                product detail page, or official DreamGuard website listing.
              </p>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              {warrantyGroups.map((group) => (
                <div
                  key={group.title}
                  data-page-card
                  className="rounded-[30px] border border-[#4988c4]-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.05)]"
                >
                  <h3 className="text-xl font-black uppercase tracking-wide text-[#4988c4]-950">
                    {group.title}
                  </h3>
                  <div className="mt-5 space-y-3">
                    {group.items.map((item) => (
                      <div
                        key={item}
                        className="flex gap-3 text-sm leading-7 text-[#4988c4]-700"
                      >
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#4988c4]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <motion.div {...sectionMotion}>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">
            3. Eligibility conditions
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">
            Free warranty applies only when all conditions are met
          </h2>

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

          <div className="mt-10 grid gap-6 xl:grid-cols-2">
            {coveredDefects.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[32px] border border-[#4988c4]-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
                >
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
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="border-y border-[#4988c4]-100 bg-[linear-gradient(180deg,_rgba(73,136,196,0.15)_0%,_rgba(73,136,196,0.08)_100%)]">
        <div className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <motion.div
            {...sectionMotion}
            className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="rounded-[32px] border border-[#4988c4]-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">
                4. Rejected cases
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">
                Requests outside policy will be declined
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#4988c4]-600">
                Most warranty rejections come from expired coverage, missing
                proof, or damage caused by improper storage and usage
                conditions.
              </p>
            </div>

            <div className="grid gap-4">
              {rejectedCases.map((item) => (
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
          <div className="gap-3 lg:flex-row">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">
                5. Warranty process
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">
                4 steps from request to final resolution
              </h2>
              <br />
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[#4988c4]-600">
              Preparing complete proof from the beginning helps shorten
              inspection time and reduces back-and-forth during technical
              review.
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

      <section className="border-y border-[#4988c4]-200 bg-[#4988c4]-950">
        <div className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <motion.div {...sectionMotion} className="grid gap-6 lg:grid-cols-2">
            {costBlocks.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[32px] border border-[#4988c4]/10 bg-[#4988c4]/5 p-7 backdrop-blur"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#4988c4]/10 text-[#4988c4]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-2xl font-black uppercase tracking-tight">
                    {item.title}
                  </h2>
                  <div className="mt-5 space-y-3">
                    {item.points.map((point) => (
                      <div
                        key={point}
                        className="flex gap-3 text-sm leading-7 text-[#4988c4]-100"
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
          className="rounded-[36px] border border-[#4988c4]/15 bg-[linear-gradient(135deg,_rgba(73,136,196,0.12)_0%,_rgba(255,255,255,1)_48%,_rgba(73,136,196,0.18)_100%)] p-8 shadow-[0_24px_80px_rgba(73,136,196,0.08)] lg:p-10"
        >
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">
            6. Mattress care guide
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">
            Storage and care directly affect warranty eligibility
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {mattressCareTips.map((tip) => (
              <div
                key={tip}
                className="rounded-[24px] border border-white bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-start gap-3">
                  <Ruler className="h-5 w-5 text-[#4988c4] shrink-0" />
                  <p className="text-sm leading-7 text-[#4988c4]-700">{tip}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
