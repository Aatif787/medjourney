// Fallback brand values. Live values come from Admin › Settings (site_settings table).
export const BRAND = {
  name: "MedJourney",
  tagline: "Guidance for treatment abroad, from first question to follow-up.",
};

export type SiteSettings = {
  site_name: string;
  tagline: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp: string | null;
  address: string | null;
  logo_url: string | null;
  footer_note: string | null;
};

export const ENQUIRY_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "awaiting_information", label: "Awaiting Information" },
  { value: "under_review", label: "Under Review" },
  { value: "quotation_ready", label: "Quotation Ready" },
  { value: "follow_up", label: "Follow-up" },
  { value: "closed", label: "Closed" },
] as const;

export const VERIFICATION_LABEL: Record<string, string> = {
  verified: "Verified",
  pending: "Verification pending",
  unverified: "Not yet verified",
};
