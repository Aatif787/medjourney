import { createFileRoute, Link, useNavigate, useLoaderData } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  HeartPulse,
  Bone,
  Ribbon,
  Baby,
  Eye,
  Smile,
  Stethoscope,
  FileText,
  Plane,
  HeartHandshake,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHome } from "@/lib/public.functions";
import { HospitalCard, DoctorCard, PostCard, EmptyState } from "@/components/site/Cards";
import { PatientIntakeForm } from "@/components/site/PatientIntakeForm";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/")({
  loader: () => getHome(),
  head: () => ({
    meta: [
      { title: "MedJourney | Specialized Medical Care & Treatments" },
      {
        name: "description",
        content:
          "Find information about treatments, accredited hospitals, and expert doctors. Connect with a patient coordinator to discuss your options.",
      },
      { property: "og:title", content: "MedJourney | Specialized Medical Care & Treatments" },
      {
        property: "og:description",
        content: "Treatment information and personalized guidance for your medical journey.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  heart: HeartPulse,
  bone: Bone,
  ribbon: Ribbon,
  baby: Baby,
  eye: Eye,
  smile: Smile,
};

function Home() {
  const { specialties, hospitals, doctors, posts, treatments } = Route.useLoaderData();
  const navigate = useNavigate();
  const { settings } = useLoaderData({ from: "__root__" });
  const [q, setQ] = useState("");
  const match = q.trim()
    ? treatments.filter((t) => t.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 5)
    : [];

  return (
    <>
      {/* Hero: Full-Screen Responsive Cover Image with CSS clamp() */}
      <section className="home-hero border-b border-border/40">
        <img
          src="/images/hero.jpg"
          alt="MedJourney Healthcare Center"
          width={1920}
          height={1080}
          className="home-hero-image"
          fetchPriority="high"
        />
        <div className="container-page relative z-10 w-full">
          <div className="home-hero-panel">
            <span className="home-hero-eyebrow">Medical Care & Treatments</span>
            <h1 className="home-hero-title mt-3.5 font-semibold text-ink">
              {settings?.site_name || BRAND.name}
            </h1>
            <p className="home-hero-subtitle mt-3 font-display leading-snug text-foreground/90">
              A conversation is a good place to start.
            </p>
            <p className="home-hero-text mt-3 text-muted-foreground leading-relaxed">
              Explore accredited hospitals, certified specialists, and verified treatment options.
              Ask your questions and receive clear, personalized guidance tailored to your needs.
            </p>
            <form
              role="search"
              className="relative mt-6 max-w-xl"
              onSubmit={(e) => {
                e.preventDefault();
                if (match[0]) navigate({ to: "/treatments/$slug", params: { slug: match[0].slug } });
                else navigate({ to: "/treatments", search: { q: q.trim() || undefined } });
              }}
            >
              <label htmlFor="hero-search" className="sr-only">
                Search treatments
              </label>
              <div className="home-hero-search flex gap-2 rounded-xl p-1.5">
                <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3">
                  <Search className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden />
                  <input
                    id="hero-search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search medical treatments or procedures..."
                    className="h-10 sm:h-11 w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground text-sm sm:text-base font-normal"
                    autoComplete="off"
                  />
                </div>
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-lg shadow-sm"
                  aria-label="Search treatments"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
              {match.length > 0 && (
                <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border bg-card shadow-soft">
                  {match.map((t) => (
                    <li key={t.id}>
                      <Link
                        to="/treatments/$slug"
                        params={{ slug: t.slug }}
                        className="block px-4 py-3 text-sm hover:bg-muted font-medium"
                      >
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </form>
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#enquiry"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
              >
                Start Free Medical Assessment ↓
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                Ask a coordinator <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="container-page py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Specialties</p>
            <h2 className="mt-2 text-3xl font-medium text-ink md:text-4xl">
              What kind of care are you looking for?
            </h2>
          </div>
          <Link to="/treatments" className="text-sm font-medium text-primary">
            All treatments →
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((s) => {
            const Icon = ICONS[s.icon ?? ""] ?? Stethoscope;
            return (
              <Link
                key={s.id}
                to="/treatments/category/$slug"
                params={{ slug: s.slug }}
                className="group flex gap-4 border-t py-6 transition hover:border-primary"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <span>
                  <span className="block font-display text-lg font-semibold">{s.name}</span>
                  {s.description && (
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {s.description}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Hospitals */}
      <section className="bg-surface py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Hospitals</p>
              <h2 className="mt-2 text-3xl font-medium text-ink md:text-4xl">
                Get to know the hospitals
              </h2>
            </div>
            <Link to="/hospitals" className="text-sm font-medium text-primary">
              Hospital directory →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {hospitals.length ? (
              hospitals.map((h) => <HospitalCard key={h.id} h={h} />)
            ) : (
              <EmptyState title="No hospitals listed yet" />
            )}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="container-page py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Specialists</p>
            <h2 className="mt-2 text-3xl font-semibold text-ink md:text-4xl">Doctors</h2>
          </div>
          <Link to="/doctors" className="text-sm font-medium text-primary">
            All doctors →
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.length ? (
            doctors.map((d) => <DoctorCard key={d.id} d={d} />)
          ) : (
            <EmptyState title="No doctor profiles yet" />
          )}
        </div>
      </section>

      {/* Support */}
      <section className="bg-ink py-20 text-ink-foreground">
        <div className="container-page">
          <p className="eyebrow !text-ink-foreground/70">Patient support</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-medium md:text-4xl">
            From your first question to your return home
          </h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              {
                icon: FileText,
                t: "Tell us what you need",
                d: "A few details about the treatment you're considering are enough to begin. You don't need to send medical records.",
              },
              {
                icon: Stethoscope,
                t: "Talk through the options",
                d: "Discuss hospital and specialist options with a coordinator. Medical decisions stay with you and your doctor.",
              },
              {
                icon: HeartHandshake,
                t: "Understand the costs",
                d: "Ask for a hospital estimate and check what is included before making any plans.",
              },
              {
                icon: Plane,
                t: "Plan your time away",
                d: "Discuss travel, language support and follow-up. Check with your treating doctor when it is safe to travel.",
              },
            ].map((s, i) => (
              <li key={s.t}>
                <span className="grid h-11 w-11 place-items-center border border-ink-foreground/30">
                  <s.icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 text-sm opacity-60">Step {i + 1}</p>
                <h3 className="mt-1 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm opacity-80">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Articles */}
      <section className="container-page py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Patient guides</p>
            <h2 className="mt-2 text-3xl font-medium text-ink md:text-4xl">
              A little reading before you decide
            </h2>
          </div>
          <Link to="/blog" className="text-sm font-medium text-primary">
            All guides →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {posts.length ? (
            posts.map((p) => <PostCard key={p.id} p={p} />)
          ) : (
            <EmptyState title="No articles yet" />
          )}
        </div>
      </section>

      {/* Patient Intake Assessment Section */}
      <section className="bg-surface py-20" id="enquiry">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <p className="eyebrow">Personalized Patient Triage</p>
            <h2 className="mt-2 text-3xl font-medium text-ink md:text-4xl">
              Tell us about your medical needs.
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Complete our adaptive clinical assessment in 2 minutes. Our hospital liaisons will
              review your condition and return customized medical estimates from accredited
              international facilities.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
              {[
                "Condition-specific clinical triage tailored to your procedure.",
                "Direct hospital pricing without broker markups.",
                "Coordinator response within 2–4 hours via WhatsApp or Email.",
                "Strict health data confidentiality & 256-bit encryption.",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <PatientIntakeForm treatments={treatments.map((t) => ({ id: t.id, name: t.name }))} />
        </div>
      </section>
    </>
  );
}
