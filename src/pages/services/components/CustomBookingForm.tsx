import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  User,
  Wrench,
} from "lucide-react";
import { serviceCategories, serviceItems, timeSlots } from "../data";
import type { CustomBookingData, ServiceType } from "../types";

/* ---------- animation ---------- */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const STEPS = [
  { label: "Service", icon: Wrench },
  { label: "Items", icon: ShoppingCart },
  { label: "Schedule", icon: CalendarDays },
  { label: "Contact", icon: User },
  { label: "Confirm", icon: Check },
] as const;

export default function CustomBookingForm() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [form, setForm] = useState<CustomBookingData>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    serviceType: "",
    items: [],
    scheduledDate: "",
    scheduledTime: "",
    address: { street: "", ward: "", district: "", city: "" },
    notes: "",
  });

  /* ---- derived ---- */
  const filteredItems = useMemo(
    () =>
      form.serviceType
        ? serviceItems.filter((i) => i.serviceType === form.serviceType)
        : [],
    [form.serviceType],
  );

  const orderTotal = useMemo(
    () =>
      form.items.reduce((sum, sel) => {
        const item = serviceItems.find((si) => si.id === sel.itemId);
        return sum + (item ? item.unitPrice * sel.quantity : 0);
      }, 0),
    [form.items],
  );

  /* ---- navigation ---- */
  const go = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    setStep((s) => s + dir);
  }, []);

  /* ---- field helpers ---- */
  const set = useCallback(
    <K extends keyof CustomBookingData>(k: K, v: CustomBookingData[K]) =>
      setForm((prev) => ({ ...prev, [k]: v })),
    [],
  );

  const setAddr = useCallback(
    (key: keyof CustomBookingData["address"], val: string) =>
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: val },
      })),
    [],
  );

  const adjustItem = useCallback((itemId: string, delta: number) => {
    setForm((prev) => {
      const existing = prev.items.find((i) => i.itemId === itemId);
      let next: CustomBookingData["items"];
      if (existing) {
        const qty = existing.quantity + delta;
        next =
          qty <= 0
            ? prev.items.filter((i) => i.itemId !== itemId)
            : prev.items.map((i) =>
                i.itemId === itemId ? { ...i, quantity: qty } : i,
              );
      } else {
        next = delta > 0 ? [...prev.items, { itemId, quantity: 1 }] : prev.items;
      }
      return { ...prev, items: next };
    });
  }, []);

  const getQty = useCallback(
    (itemId: string) =>
      form.items.find((i) => i.itemId === itemId)?.quantity ?? 0,
    [form.items],
  );

  /* ---- validation ---- */
  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return !!form.serviceType;
      case 1:
        return form.items.length > 0;
      case 2:
        return !!form.scheduledDate && !!form.scheduledTime;
      case 3:
        return (
          !!form.customerName &&
          !!form.customerPhone &&
          !!form.address.street &&
          !!form.address.district &&
          !!form.address.city
        );
      default:
        return true;
    }
  }, [step, form]);

  const handleSubmit = useCallback(() => {
    alert("Custom booking submitted!\n\n" + JSON.stringify(form, null, 2));
  }, [form]);

  /* ---- active category info ---- */
  const activeCat = serviceCategories.find(
    (c) => c.type === form.serviceType,
  );

  /* ========== render ========== */
  return (
    <div className="max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={s.label} className="flex-1 flex flex-col items-center relative">
              {i > 0 && (
                <div
                  className={`absolute top-5 -left-1/2 w-full h-0.5 ${
                    done ? "bg-[var(--color-primary)]" : "bg-gray-200"
                  }`}
                />
              )}
              <div
                className={`relative z-10 flex items-center justify-center h-10 w-10 rounded-full border-2 text-sm font-bold transition-all ${
                  done
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                    : active
                      ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-white"
                      : "border-gray-200 text-gray-400 bg-white"
                }`}
              >
                {done ? <Check className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={`mt-2 text-xs font-medium hidden sm:block ${
                  done || active ? "text-[var(--color-primary)]" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step body */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25 }}
        >
          {/* ---- Step 0: Service Type ---- */}
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">
                Choose Service Type
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                What would you like us to clean?
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {serviceCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.type}
                      type="button"
                      onClick={() => {
                        set("serviceType", cat.type as ServiceType);
                        set("items", []);
                      }}
                      className={`text-left flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        form.serviceType === cat.type
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow"
                          : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-lg ${
                          form.serviceType === cat.type
                            ? "bg-[var(--color-primary)] text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block font-semibold text-gray-900 text-sm">
                          {cat.title}
                        </span>
                        <span className="text-xs text-gray-400">
                          From {cat.priceFrom}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---- Step 1: Items ---- */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Select Items
                  </h3>
                  {activeCat && (
                    <p className="text-sm text-gray-500">
                      {activeCat.title} — pick what you need
                    </p>
                  )}
                </div>
                {orderTotal > 0 && (
                  <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full">
                    ${orderTotal}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {filteredItems.map((item) => {
                  const qty = getQty(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        qty > 0
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                          : "border-gray-100"
                      }`}
                    >
                      <div>
                        <span className="font-medium text-gray-900 text-sm">
                          {item.name}
                        </span>
                        <span className="block text-xs text-gray-400">
                          ${item.unitPrice} each
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => adjustItem(item.id, -1)}
                          disabled={qty === 0}
                          className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustItem(item.id, 1)}
                          className="h-8 w-8 rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary)] text-white flex items-center justify-center hover:bg-[var(--color-primary-dark)] transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---- Step 2: Schedule ---- */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">
                Pick a Date & Time
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <CalendarDays className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                  Date
                </label>
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => set("scheduledDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Clock className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                  Time Slot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((ts) => (
                    <button
                      key={ts}
                      type="button"
                      onClick={() => set("scheduledTime", ts)}
                      className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                        form.scheduledTime === ts
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                          : "border-gray-200 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {ts}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---- Step 3: Contact & Address ---- */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-900">
                Your Information
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    value={form.customerName}
                    onChange={(e) => set("customerName", e.target.value)}
                    placeholder="John Doe"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    value={form.customerPhone}
                    onChange={(e) => set("customerPhone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => set("customerEmail", e.target.value)}
                  placeholder="john@example.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4" /> Address *
                </label>
                <input
                  value={form.address.street}
                  onChange={(e) => setAddr("street", e.target.value)}
                  placeholder="Street address"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 mb-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    value={form.address.ward}
                    onChange={(e) => setAddr("ward", e.target.value)}
                    placeholder="Ward"
                    className="border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm"
                  />
                  <input
                    value={form.address.district}
                    onChange={(e) => setAddr("district", e.target.value)}
                    placeholder="District *"
                    className="border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm"
                  />
                  <input
                    value={form.address.city}
                    onChange={(e) => setAddr("city", e.target.value)}
                    placeholder="City *"
                    className="border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={3}
                  placeholder="Any special instructions…"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* ---- Step 4: Confirm ---- */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">
                Review & Confirm
              </h3>

              <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                {/* Service type */}
                <div className="p-4">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    Service
                  </span>
                  <p className="font-bold text-gray-900">
                    {activeCat?.title ?? form.serviceType}
                  </p>
                </div>

                {/* Items */}
                <div className="p-4">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    Items
                  </span>
                  <ul className="mt-2 space-y-1.5">
                    {form.items.map((sel) => {
                      const item = serviceItems.find(
                        (si) => si.id === sel.itemId,
                      );
                      if (!item) return null;
                      return (
                        <li
                          key={sel.itemId}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-700">
                            {item.name}{" "}
                            <span className="text-gray-400">
                              × {sel.quantity}
                            </span>
                          </span>
                          <span className="font-medium text-gray-900">
                            ${item.unitPrice * sel.quantity}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="flex justify-between mt-3 pt-3 border-t border-dashed text-base font-bold">
                    <span>Total</span>
                    <span className="text-[var(--color-primary)]">
                      ${orderTotal}
                    </span>
                  </div>
                </div>

                {/* Schedule */}
                <div className="p-4 flex gap-8">
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">
                      Date
                    </span>
                    <p className="font-medium text-gray-900">
                      {form.scheduledDate}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">
                      Time
                    </span>
                    <p className="font-medium text-gray-900">
                      {form.scheduledTime}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="p-4">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    Contact
                  </span>
                  <p className="text-sm text-gray-700 mt-1">
                    {form.customerName} · {form.customerPhone}
                  </p>
                  <p className="text-sm text-gray-500">
                    {[
                      form.address.street,
                      form.address.ward,
                      form.address.district,
                      form.address.city,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>

              {form.notes && (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
                  <strong>Notes:</strong> {form.notes}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={step === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={() => go(1)}
            disabled={!canContinue}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-primary-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
          >
            <Check className="h-5 w-5" /> Confirm Booking
          </button>
        )}
      </div>
    </div>
  );
}
