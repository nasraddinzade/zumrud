"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { STORE, type StoreId } from "@/config";
import { formatPrice, formatVolume } from "@/lib/format";
import { isValidPhone, simulatePayment } from "@/lib/payment";
import { useI18n } from "@/components/providers/LanguageProvider";
import { useCart } from "@/components/providers/CartProvider";
import { ChevronLeft, Spinner } from "@/components/Icons";

type Method = "delivery" | "pickup";

type Form = {
  name: string;
  phone: string;
  method: Method;
  address: string;
  comment: string;
  storeId: StoreId | "";
};

type Errors = Partial<Record<keyof Form, string>>;

function Steps({ step }: { step: 1 | 2 }) {
  const { t } = useI18n();
  const labels = [t.checkout.step1, t.checkout.step2];
  return (
    <ol className="mt-4 flex gap-3" aria-label={t.checkout.title}>
      {labels.map((label, i) => {
        const n = (i + 1) as 1 | 2;
        const active = n === step;
        const done = n < step;
        return (
          <li key={label} className="flex flex-1 items-center gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                active || done ? "bg-gold-500 text-emerald-900" : "bg-white text-ink-500 ring-1 ring-ink-500/20"
              }`}
            >
              {n}
            </span>
            <span className={`text-xs sm:text-sm ${active ? "text-ink-900" : "text-ink-500"}`}>
              <span className="sr-only">
                {t.checkout.step} {n} {t.checkout.of} 2.{" "}
              </span>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function CheckoutView() {
  const { t } = useI18n();
  const router = useRouter();
  const { lines, count, total, hydrated, clear } = useCart();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<Form>({
    name: "",
    phone: "",
    method: "delivery",
    address: "",
    comment: "",
    storeId: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!form.name.trim()) next.name = t.checkout.errors.required;
    if (!form.phone.trim()) next.phone = t.checkout.errors.required;
    else if (!isValidPhone(form.phone)) next.phone = t.checkout.errors.phone;
    if (form.method === "delivery" && !form.address.trim()) next.address = t.checkout.errors.required;
    if (form.method === "pickup" && !form.storeId) next.storeId = t.checkout.errors.store;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onStep1Submit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setStep(2);
      window.scrollTo({ top: 0 });
    }
  };

  const onPay = async () => {
    if (paying) return;
    setPaying(true);
    const amount = total;
    const { orderId } = await simulatePayment();
    setDone(true);
    clear();
    router.push(`/checkout/success?order=${encodeURIComponent(orderId)}&total=${amount}`);
  };

  if (!hydrated) {
    return (
      <div className="container-x py-10">
        <h1 className="font-serif text-2xl font-semibold text-emerald-900 sm:text-3xl">{t.checkout.title}</h1>
      </div>
    );
  }

  if (lines.length === 0 && !done) {
    return (
      <div className="container-x py-10 sm:py-16">
        <h1 className="font-serif text-2xl font-semibold text-emerald-900 sm:text-3xl">{t.checkout.title}</h1>
        <div className="card mt-6 px-6 py-14 text-center">
          <p className="text-ink-500">{t.checkout.emptyCart}</p>
          <Link href="/catalog" className="btn-gold mt-6">
            {t.cart.toCatalog}
          </Link>
        </div>
      </div>
    );
  }

  const selectedStore = STORE.stores.find((s) => s.id === form.storeId);

  return (
    <div className="container-x py-6 sm:py-10">
      <h1 className="font-serif text-2xl font-semibold text-emerald-900 sm:text-3xl">{t.checkout.title}</h1>
      <Steps step={step} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        {step === 1 ? (
          <form onSubmit={onStep1Submit} noValidate className="card space-y-5 p-5 sm:p-6">
            <div>
              <label htmlFor="co-name" className="label-caps mb-1.5 block">
                {t.checkout.name}
              </label>
              <input
                id="co-name"
                className={`input ${errors.name ? "border-red-600" : ""}`}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder={t.checkout.namePlaceholder}
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "co-name-err" : undefined}
              />
              {errors.name ? (
                <p id="co-name-err" className="mt-1 text-xs text-red-700">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="co-phone" className="label-caps mb-1.5 block">
                {t.checkout.phone}
              </label>
              <input
                id="co-phone"
                type="tel"
                inputMode="tel"
                className={`input ${errors.phone ? "border-red-600" : ""}`}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder={t.checkout.phonePlaceholder}
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby="co-phone-hint"
              />
              <p id="co-phone-hint" className={`mt-1 text-xs ${errors.phone ? "text-red-700" : "text-ink-500"}`}>
                {errors.phone ?? t.checkout.phoneHint}
              </p>
            </div>

            <fieldset>
              <legend className="label-caps mb-2">{t.checkout.method}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["delivery", "pickup"] as Method[]).map((m) => (
                  <label
                    key={m}
                    className={`flex cursor-pointer items-start gap-3 rounded border p-3 ${
                      form.method === m ? "border-gold-500 bg-gold-300/10" : "border-ink-500/20 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={m}
                      checked={form.method === m}
                      onChange={() => set("method", m)}
                      className="mt-1 accent-gold-500"
                    />
                    <span>
                      <span className="block text-sm font-medium text-ink-900">
                        {m === "delivery" ? t.checkout.delivery : t.checkout.pickup}
                      </span>
                      <span className="block text-xs text-ink-500">
                        {m === "delivery" ? t.checkout.deliveryHint : t.checkout.pickupHint}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {form.method === "delivery" ? (
              <>
                <div>
                  <label htmlFor="co-address" className="label-caps mb-1.5 block">
                    {t.checkout.address}
                  </label>
                  <input
                    id="co-address"
                    className={`input ${errors.address ? "border-red-600" : ""}`}
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder={t.checkout.addressPlaceholder}
                    autoComplete="street-address"
                    aria-invalid={Boolean(errors.address)}
                  />
                  {errors.address ? <p className="mt-1 text-xs text-red-700">{errors.address}</p> : null}
                </div>
                <div>
                  <label htmlFor="co-comment" className="label-caps mb-1.5 block">
                    {t.checkout.comment}
                  </label>
                  <textarea
                    id="co-comment"
                    rows={2}
                    className="input"
                    value={form.comment}
                    onChange={(e) => set("comment", e.target.value)}
                    placeholder={t.checkout.commentPlaceholder}
                  />
                </div>
              </>
            ) : (
              <fieldset>
                <legend className="label-caps mb-2">{t.checkout.pickupPoint}</legend>
                <div className="grid gap-2">
                  {STORE.stores.map((s, i) => (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-start gap-3 rounded border p-3 ${
                        form.storeId === s.id ? "border-gold-500 bg-gold-300/10" : "border-ink-500/20 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="store"
                        value={s.id}
                        checked={form.storeId === s.id}
                        onChange={() => set("storeId", s.id)}
                        className="mt-1 accent-gold-500"
                      />
                      <span>
                        <span className="block text-sm font-medium text-ink-900">
                          {i === 0 ? t.about.store1 : t.about.store2}
                        </span>
                        <span className="block text-xs text-ink-500">{s.address}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {errors.storeId ? <p className="mt-1 text-xs text-red-700">{errors.storeId}</p> : null}
              </fieldset>
            )}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
              <Link href="/cart" className="btn-ghost">
                <ChevronLeft size={18} />
                {t.checkout.back}
              </Link>
              <button type="submit" className="btn-gold min-h-12 sm:min-w-48">
                {t.checkout.next}
              </button>
            </div>
          </form>
        ) : (
          <div className="card space-y-6 p-5 sm:p-6">
            <section>
              <h2 className="label-caps">{t.checkout.recipient}</h2>
              <p className="mt-1 text-sm text-ink-900">
                {form.name}, {form.phone}
              </p>
            </section>
            <section>
              <h2 className="label-caps">{t.checkout.receiving}</h2>
              <p className="mt-1 text-sm text-ink-900">
                {form.method === "delivery" ? (
                  <>
                    {t.checkout.delivery}: {form.address}
                    {form.comment ? <span className="block text-ink-500">{form.comment}</span> : null}
                  </>
                ) : (
                  <>
                    {t.checkout.pickup}: {selectedStore?.address}
                  </>
                )}
              </p>
            </section>
            <section>
              <h2 className="label-caps">
                {t.checkout.items} ({count})
              </h2>
              <ul className="mt-2 divide-y divide-ink-500/10">
                {lines.map(({ product, qty }) => (
                  <li key={product.slug} className="flex items-center gap-3 py-2.5">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-cream-50 bg-white">
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-ink-900">
                        {product.brand} {product.name}
                      </div>
                      <div className="text-xs text-ink-500">
                        {formatVolume(product.volumeMl)} × {qty}
                      </div>
                    </div>
                    <div className="text-sm font-medium tabular-nums">{formatPrice(product.price * qty)}</div>
                  </li>
                ))}
              </ul>
            </section>
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep(1)} disabled={paying} className="btn-ghost">
                <ChevronLeft size={18} />
                {t.checkout.back}
              </button>
              <button
                type="button"
                onClick={onPay}
                disabled={paying}
                className="btn-gold min-h-12 sm:min-w-48"
                aria-busy={paying}
              >
                {paying ? (
                  <>
                    <Spinner size={18} />
                    {t.checkout.paying}
                  </>
                ) : (
                  <>
                    {t.checkout.pay} {formatPrice(total)}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <aside className="card p-5 lg:sticky lg:top-40">
          <h2 className="font-serif text-lg font-semibold text-emerald-900">{t.checkout.yourOrder}</h2>
          <div className="mt-3 flex items-baseline justify-between text-sm text-ink-500">
            <span>
              {t.checkout.items} ({count})
            </span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t border-ink-500/10 pt-3">
            <span className="font-medium text-ink-900">{t.checkout.total}</span>
            <span className="font-serif text-2xl font-semibold text-gold-500">{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
