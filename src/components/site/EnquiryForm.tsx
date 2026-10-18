import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { submitEnquiry, enquirySchema } from "@/lib/public.functions";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

type Errors = Partial<Record<string, string>>;

function Field({
  id,
  label,
  error,
  required,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      <div className="mt-1.5">{children}</div>
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-md border bg-card px-3 aria-[invalid=true]:border-destructive";

export function EnquiryForm({
  treatments,
  presetTreatment,
  onDone,
}: {
  treatments: { id: string; name: string }[];
  presetTreatment?: string;
  /** Called after a successful submit; when omitted the form shows its own thank-you state. */
  onDone?: () => void;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverError, setServerError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const tId = f.get("treatment_id")?.toString() ?? "";
    const tName = treatments.find((t) => t.id === tId)?.name;
    const raw = {
      full_name: f.get("full_name")?.toString() ?? "",
      country: f.get("country")?.toString() ?? "",
      email: f.get("email")?.toString() ?? "",
      phone: f.get("phone")?.toString() ?? "",
      treatment_id: tId,
      treatment_interest: tName ?? f.get("treatment_other")?.toString() ?? "",
      message: f.get("message")?.toString() ?? "",
      preferred_contact: (f.get("preferred_contact")?.toString() ?? "email") as "email",
      consent: f.get("consent") === "on",
      website: f.get("website")?.toString() ?? "",
    };
    const parsed = enquirySchema.safeParse(raw);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) errs[issue.path[0] as string] ??= issue.message;
      if (raw.preferred_contact !== "email" && !raw.phone)
        errs.phone = "Please add a phone/WhatsApp number";
      setErrors(errs);
      document.getElementById(Object.keys(errs)[0] ?? "")?.focus();
      return;
    }
    if (raw.preferred_contact !== "email" && !raw.phone) {
      setErrors({ phone: "Please add a phone/WhatsApp number" });
      document.getElementById("phone")?.focus();
      return;
    }
    setErrors({});
    setState("sending");
    try {
      await submitEnquiry({ data: parsed.data });
      setState("done");
      onDone?.();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  if (state === "done" && !onDone) {
    return (
      <div className="py-10 text-center" role="status">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" aria-hidden />
        <h3 className="mt-6 text-2xl font-semibold">Thank you for getting in touch.</h3>
        <p className="mt-3 text-muted-foreground">
          We've received your enquiry. A coordinator will reply in the way you chose. Please wait to
          hear from us before sending medical records.
        </p>
        <Button asChild variant="outline" className="mt-8">
          <Link to="/">Back to top</Link>
        </Button>
      </div>
    );
  }

  const preset = presetTreatment
    ? treatments.find((t) => t.name.toLowerCase() === presetTreatment.toLowerCase())
    : undefined;
  const err = (k: string) => ({
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `${k}-err` : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 border-t pt-6 md:grid-cols-2">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <Field id="full_name" label="Full name" required error={errors.full_name}>
        <input
          id="full_name"
          name="full_name"
          autoComplete="name"
          className={inputCls}
          {...err("full_name")}
        />
      </Field>
      <Field id="country" label="Country of residence" required error={errors.country}>
        <input
          id="country"
          name="country"
          autoComplete="country-name"
          className={inputCls}
          {...err("country")}
        />
      </Field>
      <Field id="email" label="Email" required error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className={inputCls}
          {...err("email")}
        />
      </Field>
      <Field id="phone" label="Phone / WhatsApp" error={errors.phone}>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className={inputCls}
          {...err("phone")}
        />
      </Field>
      <Field id="treatment_id" label="Treatment or specialty of interest">
        <select
          id="treatment_id"
          name="treatment_id"
          defaultValue={preset?.id ?? ""}
          className={inputCls}
        >
          <option value="">Not sure / other</option>
          {treatments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </Field>
      <Field id="treatment_other" label="Another treatment (optional)">
        <input
          id="treatment_other"
          name="treatment_other"
          defaultValue={!preset && presetTreatment ? presetTreatment : ""}
          className={inputCls}
        />
      </Field>
      <div className="md:col-span-2">
        <Field
          id="message"
          label="Message"
          hint="A short description is enough. Please don't include detailed medical records."
          error={errors.message}
        >
          <textarea
            id="message"
            name="message"
            rows={5}
            maxLength={3000}
            className="w-full rounded-md border bg-card p-3"
            {...err("message")}
          />
        </Field>
      </div>
      <fieldset className="md:col-span-2">
        <legend className="text-sm font-medium">Preferred contact method</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {[
            ["email", "Email"],
            ["phone", "Phone"],
            ["whatsapp", "WhatsApp"],
          ].map(([v, l]) => (
            <label key={v} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="preferred_contact"
                value={v}
                defaultChecked={v === "email"}
                className="accent-primary"
              />
              {l}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="md:col-span-2">
        <label className="flex items-start gap-3 text-sm">
          <input
            id="consent"
            type="checkbox"
            name="consent"
            className="mt-1 h-4 w-4 accent-primary"
            {...err("consent")}
          />
          <span>
            I agree that my details may be used to respond to this enquiry, as described in the{" "}
            <Link to="/privacy" className="text-primary underline">
              privacy policy
            </Link>
            .{" "}
            <span className="text-destructive" aria-hidden>
              *
            </span>
          </span>
        </label>
        {errors.consent && (
          <p id="consent-err" role="alert" className="mt-1 text-sm text-destructive">
            {errors.consent}
          </p>
        )}
      </div>
      {state === "error" && (
        <p
          role="alert"
          className="md:col-span-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {serverError}
        </p>
      )}
      <div className="md:col-span-2">
        <Button type="submit" size="lg" disabled={state === "sending"}>
          {state === "sending" && <Loader2 className="animate-spin" aria-hidden />}
          {state === "sending" ? "Sending…" : "Send enquiry"}
        </Button>
      </div>
    </form>
  );
}
