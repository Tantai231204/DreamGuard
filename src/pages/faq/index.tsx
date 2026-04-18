import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as Accordion from "@radix-ui/react-accordion";
import gsap from "gsap";
import {
  ArrowRight,
  ChevronDown,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { AppRoute } from "@/lib/constants";

const faqGroups = [
  {
    title: "Ordering and payment",
    items: [
      {
        question: "How do I place an order on DreamGuard?",
        answer:
          "To place an order, you need to sign in first. If you don't have an account yet, please register before ordering. Then choose products from the website, add them to your cart, and complete checkout with the correct variant, quantity, delivery information, and payment method.",
      },
      {
        question: "Can I change my order after placing it?",
        answer:
          "Order updates depend on the current processing stage. Contact DreamGuard support as early as possible with your order code so the team can confirm whether quantity, address, or product changes are still possible.",
      },
      {
        question: "Which payment methods are typically supported?",
        answer:
          "Supported payment methods are VNPay and COD (cash on delivery).",
      },
    ],
  },
  {
    title: "Shipping and delivery",
    items: [
      {
        question: "How is delivery time calculated?",
        answer:
          "Delivery time usually depends on product availability, delivery area, and order confirmation timing. The support team can verify the current order status and estimated handoff window for you.",
      },
      {
        question: "What should I do if my package arrives damaged or incomplete?",
        answer:
          "Check the package immediately, keep all packaging materials, and contact DreamGuard with your order code plus images or videos showing the issue. This helps the team handle exchange, return, or shipping claims faster.",
      },
      {
        question: "Can DreamGuard support delivery outside the city?",
        answer:
          "Yes, but delivery coverage and transport fees may vary by destination and product type. The exact arrangement should be confirmed during order processing or through customer support.",
      },
    ],
  },
  {
    title: "Returns and warranty",
    items: [
      {
        question: "When is a product eligible for return or exchange?",
        answer:
          "Eligibility depends on purchase channel, return window, product condition, and whether the item is defective or custom-made. See the full return requirements on the Return Policy page.",
      },
      {
        question: "What documents are needed for a warranty request?",
        answer:
          "Customers should prepare the warranty card or electronic warranty information, the invoice or order code, and images or videos showing the defect for technical review.",
      },
      {
        question: "Are all product defects covered by warranty?",
        answer:
          "No. Warranty only applies to eligible manufacturing or material defects within the valid coverage period. Damage from misuse, moisture, sharp objects, or unauthorized repair is typically excluded.",
      },
    ],
  },
  {
    title: "Product care and support",
    items: [
      {
        question: "How should I care for my mattress to keep support eligibility?",
        answer:
          "Use a flat and stable base, avoid direct sunlight and moisture, do not wash the mattress with water, and rotate it periodically. Following care instructions helps maintain product condition and warranty eligibility.",
      },
      {
        question: "Where should I contact DreamGuard for the fastest support?",
        answer:
          "For the fastest help, call hotline 0357968555 or chat with us directly on the website.",
      },
      {
        question: "Where can I find policy details without contacting support first?",
        answer:
          "The Help Center, Return Policy page, and Warranty Policy page provide the main policy information, conditions, and support flow before you submit a request.",
      },
    ],
  },
];

const shortcuts = [
  {
    title: "Help Center",
    description: "Find the right support channel and next steps.",
    to: AppRoute.HELP_CENTER,
    icon: MessageCircle,
  },
  {
    title: "Return Policy",
    description: "Review exchanges, return windows, and product conditions.",
    to: AppRoute.RETURN_POLICY,
    icon: PackageCheck,
  },
  {
    title: "Warranty Policy",
    description: "Understand covered defects and warranty workflow.",
    to: AppRoute.WARRANTY_POLICY,
    icon: ShieldCheck,
  },
];

export default function FAQPage() {
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

      const cards = gsap.utils.toArray<HTMLElement>("[data-page-card]").slice(0, 6);
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
        <div className="container mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div data-page-hero className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4988c4]/15 bg-white/85 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#4988c4] shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              FAQ
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-black uppercase tracking-tight text-[#4988c4]-950 sm:text-5xl lg:text-6xl">
              Quick answers for the questions customers ask most often.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#4988c4]-600 sm:text-base">
              Browse the FAQ before contacting support to find fast guidance about ordering, shipping, returns, warranty coverage, and product care.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {shortcuts.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  to={item.to}
                  data-page-card
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4988c4]/10 text-[#4988c4]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-black uppercase tracking-wide text-[#4988c4]-950">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#4988c4]-600">{item.description}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#4988c4]">
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div>
          <div className="gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">Common questions</p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">Grouped answers for the main support topics</h2>
              <br/>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#4988c4]-600">
              If your case is still unclear after reviewing the FAQ, move to the Help Center and contact the most appropriate support channel.
            </p>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            {faqGroups.map((group) => (
              <div key={group.title} data-page-card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-black uppercase tracking-wide text-[#4988c4]-950">{group.title}</h3>
                <Accordion.Root type="single" collapsible className="mt-5 space-y-3">
                  {group.items.map((item, index) => (
                    <Accordion.Item
                      key={item.question}
                      value={`${group.title}-${index}`}
                      className="overflow-hidden rounded-[22px] border border-[#4988c4]-100 bg-[#4988c4]-50/40"
                    >
                      <Accordion.Header>
                        <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                          <span className="text-sm font-black uppercase tracking-[0.12em] text-[#4988c4]-900">
                            {item.question}
                          </span>
                          <ChevronDown className="h-4 w-4 shrink-0 text-[#4988c4] transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        </Accordion.Trigger>
                      </Accordion.Header>
                      <Accordion.Content className="px-5 pb-5 text-sm leading-7 text-[#4988c4]-700 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        {item.answer}
                      </Accordion.Content>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}