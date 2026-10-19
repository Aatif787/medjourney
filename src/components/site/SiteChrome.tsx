import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Mail, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@/lib/brand";
import { BRAND } from "@/lib/brand";

const NAV = [
  { to: "/treatments", label: "Treatments" },
  { to: "/hospitals", label: "Hospitals" },
  { to: "/doctors", label: "Doctors" },
  { to: "/blog", label: "Guides" },
  { to: "/about", label: "About" },
] as const;

export function Logo({ settings }: { settings?: SiteSettings | null }) {
  const name = settings?.site_name || BRAND.name;
  return (
    <Link to="/" className="flex items-center gap-2" aria-label={`${name} home`}>
      {settings?.logo_url ? (
        <img src={settings.logo_url} alt="" className="h-8 w-auto" />
      ) : (
        <span
          aria-hidden
          className="grid h-9 w-9 place-items-center border border-primary font-display text-xl text-primary"
        >
          {name.charAt(0)}
        </span>
      )}
      <span className="font-display text-xl font-medium text-ink">{name}</span>
    </Link>
  );
}

export function SiteHeader({ settings }: { settings?: SiteSettings | null }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Logo settings={settings} />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button asChild>
            <Link to="/contact">Request an estimate</Link>
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden transition-transform duration-150 active:scale-90"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X className="h-6 w-6 transition-transform duration-200" />
          ) : (
            <Menu className="h-6 w-6 transition-transform duration-200" />
          )}
        </Button>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t bg-background/95 backdrop-blur-md md:hidden mobile-nav-panel shadow-lg overflow-hidden"
        >
          <div className="container-page flex flex-col py-3 space-y-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="mobile-nav-item rounded-lg px-3 py-2.5 text-base font-medium transition-all active:scale-[0.98] active:bg-muted/70 hover:bg-muted/50"
              >
                {n.label}
              </Link>
            ))}
            <div className="mobile-nav-item pt-2">
              <Button asChild className="w-full transition-transform duration-150 active:scale-[0.97]">
                <Link to="/contact" onClick={() => setOpen(false)}>
                  Request an estimate
                </Link>
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter({ settings }: { settings?: SiteSettings | null }) {
  const name = settings?.site_name || BRAND.name;
  return (
    <footer className="mt-16 border-t bg-surface text-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl">{name}</p>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Information and support for people considering treatment abroad.
          </p>
          {settings?.footer_note && (
            <p className="mt-6 max-w-md text-xs opacity-60">{settings.footer_note}</p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">Explore</p>
          <ul className="mt-3 space-y-2 text-sm opacity-80">
            <li>
              <Link to="/treatments">Treatments</Link>
            </li>
            <li>
              <Link to="/hospitals">Hospitals</Link>
            </li>
            <li>
              <Link to="/doctors">Doctors</Link>
            </li>
            <li>
              <Link to="/blog">Patient guides</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy policy</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Contact</p>
          <ul className="mt-3 space-y-2 text-sm opacity-80">
            {settings?.contact_email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" aria-hidden />
                <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
              </li>
            )}
            {settings?.contact_phone && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" aria-hidden />
                <a href={`tel:${settings.contact_phone.replace(/\s/g, "")}`}>
                  {settings.contact_phone}
                </a>
              </li>
            )}
            {settings?.whatsapp && (
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp {settings.whatsapp}
              </li>
            )}
            {settings?.address && <li>{settings.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t">
        <p className="container-page py-5 text-xs opacity-60">
          © {new Date().getFullYear()} {name}. We are a patient coordination service, not a
          healthcare provider.
        </p>
      </div>
    </footer>
  );
}
