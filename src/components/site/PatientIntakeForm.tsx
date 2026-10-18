import { useState } from "react";
import {
  HeartPulse,
  Bone,
  Ribbon,
  Smile,
  Sparkles,
  Baby,
  Stethoscope,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Lock,
  Clock,
  ShieldCheck,
  Calendar,
  Globe2,
  Users,
  MessageSquare,
  FileCheck2,
} from "lucide-react";
import { submitEnquiry } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PatientIntakeFormProps {
  treatments?: { id: string; name: string }[];
  presetTreatment?: string;
  onDone?: () => void;
}

type SpecialtyId =
  "orthopaedics" | "cardiology" | "oncology" | "dental" | "cosmetic" | "fertility" | "general";

interface SpecialtyOption {
  id: SpecialtyId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SPECIALTIES: SpecialtyOption[] = [
  {
    id: "orthopaedics",
    label: "Orthopaedics & Spine",
    description: "Joint replacements, spine surgery, sports injury",
    icon: Bone,
  },
  {
    id: "cardiology",
    label: "Cardiology & Vascular",
    description: "Bypass surgery, valve repair, angioplasty, stents",
    icon: HeartPulse,
  },
  {
    id: "oncology",
    label: "Oncology & Cancer Care",
    description: "Surgical oncology, chemotherapy, second opinions",
    icon: Ribbon,
  },
  {
    id: "dental",
    label: "Dental Rehabilitation",
    description: "All-on-4/6 implants, crowns, veneers, full restoration",
    icon: Smile,
  },
  {
    id: "cosmetic",
    label: "Plastic & Cosmetic",
    description: "Rhinoplasty, body contouring, breast procedures",
    icon: Sparkles,
  },
  {
    id: "fertility",
    label: "Fertility & IVF",
    description: "IVF, ICSI, egg freezing, donor programs",
    icon: Baby,
  },
  {
    id: "general",
    label: "General / Other Needs",
    description: "Bariatrics, urology, health checkups, other concerns",
    icon: Stethoscope,
  },
];

const DESTINATIONS = [
  "No preference — recommend top accredited hospital",
  "Turkey (Istanbul / Antalya)",
  "India (Delhi / Chennai / Mumbai)",
  "Thailand (Bangkok / Phuket)",
  "Germany / Spain (Western Europe)",
  "United Arab Emirates (Dubai / Abu Dhabi)",
];

export function PatientIntakeForm({
  treatments = [],
  presetTreatment = "",
  onDone,
}: PatientIntakeFormProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [caseReference, setCaseReference] = useState("");

  // Form State
  const [specialty, setSpecialty] = useState<SpecialtyId>("orthopaedics");
  const [selectedTreatmentId, setSelectedTreatmentId] = useState("");
  const [treatmentInterest, setTreatmentInterest] = useState(presetTreatment);

  // Condition Specific Questions
  const [clinicalCondition, setClinicalCondition] = useState({
    jointArea: "Knee (Left or Right)",
    symptomsDuration: "6 to 12 months",
    mobilityStatus: "Walks with pain / uses assistance",
    previousInterventions: "Medications & Physical Therapy",
    hasRecentScans: "Yes, within the last 6 months",
    cardioDiagnosis: "Coronary artery disease / Bypass candidate",
    doctorRecommendation: "Surgery has been officially recommended",
    oncologyType: "Breast / Gynaecological",
    oncologyStage: "Stage II or III",
    oncologyGoal: "Second opinion & Surgical treatment abroad",
    dentalArea: "Multiple missing teeth / Need full arch implants",
    dentalScans: "Yes, have panoramic OPG X-ray",
    cosmeticArea: "Facial contouring / Rhinoplasty",
    fertilityStage: "First-time IVF planning",
    generalDescription: "",
  });

  // Logistics
  const [timeline, setTimeline] = useState("Within 1 to 2 months");
  const [destination, setDestination] = useState(DESTINATIONS[0]);
  const [travelCompanion, setTravelCompanion] = useState("Traveling with family / caregiver");

  // Contact & Demographics
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState<"whatsapp" | "email" | "phone">(
    "whatsapp",
  );
  const [patientNotes, setPatientNotes] = useState("");
  const [consent, setConsent] = useState(true);
  const [honeypot, setHoneypot] = useState("");

  // Step Validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!specialty) errs.specialty = "Please choose a medical category";
    }
    if (s === 4) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        errs.fullName = "Please enter your full name";
      }
      if (!country.trim()) {
        errs.country = "Please enter your country of residence";
      }
      if (!email.trim() || !email.includes("@")) {
        errs.email = "Please provide a valid email address";
      }
      if (!phone.trim() || phone.trim().length < 6) {
        errs.phone = "Please enter a valid telephone or WhatsApp number";
      }
      if (!consent) {
        errs.consent = "Consent is required to allow our coordinators to review your case";
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4) as any);
    }
  }

  function handleBack() {
    setStep((prev) => Math.max(prev - 1, 1) as any);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep(4)) return;

    setStatus("submitting");
    setErrorMessage("");

    const ref = `MJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Build structured medical summary
    const clinicalSummaryLines = [
      `[PATIENT INTAKE ASSESSMENT - Ref: ${ref}]`,
      `• Primary Specialty: ${SPECIALTIES.find((s) => s.id === specialty)?.label ?? specialty}`,
      treatmentInterest ? `• Procedure of Interest: ${treatmentInterest}` : null,
      ``,
      `--- Condition-Specific Evaluation ---`,
      specialty === "orthopaedics" && [
        `• Affected Area: ${clinicalCondition.jointArea}`,
        `• Symptoms Duration: ${clinicalCondition.symptomsDuration}`,
        `• Mobility Level: ${clinicalCondition.mobilityStatus}`,
        `• Previous Interventions: ${clinicalCondition.previousInterventions}`,
        `• Recent Imaging (X-Ray/MRI): ${clinicalCondition.hasRecentScans}`,
      ],
      specialty === "cardiology" && [
        `• Cardiac Diagnosis: ${clinicalCondition.cardioDiagnosis}`,
        `• Physician Recommendation: ${clinicalCondition.doctorRecommendation}`,
        `• Recent Medical Reports: ${clinicalCondition.hasRecentScans}`,
      ],
      specialty === "oncology" && [
        `• Cancer Site/Type: ${clinicalCondition.oncologyType}`,
        `• Staging / Status: ${clinicalCondition.oncologyStage}`,
        `• Primary Objective: ${clinicalCondition.oncologyGoal}`,
        `• Pathology/Biopsy Reports: ${clinicalCondition.hasRecentScans}`,
      ],
      specialty === "dental" && [
        `• Dental Need: ${clinicalCondition.dentalArea}`,
        `• Panoramic X-Ray (OPG): ${clinicalCondition.dentalScans}`,
      ],
      specialty === "cosmetic" && [
        `• Focus Procedure: ${clinicalCondition.cosmeticArea}`,
        `• Medical Clearance: ${clinicalCondition.hasRecentScans}`,
      ],
      specialty === "fertility" && [
        `• Treatment Stage: ${clinicalCondition.fertilityStage}`,
        `• Recent Hormone/Semen Analysis: ${clinicalCondition.hasRecentScans}`,
      ],
      specialty === "general" && [
        `• Patient Description: ${clinicalCondition.generalDescription || "Not specified"}`,
      ],
      ``,
      `--- Travel Logistics & Urgency ---`,
      `• Preferred Timeline: ${timeline}`,
      `• Destination Preference: ${destination}`,
      `• Travel Accompaniment: ${travelCompanion}`,
      patientNotes ? `• Additional Patient Notes: ${patientNotes}` : null,
    ]
      .flat()
      .filter(Boolean)
      .join("\n");

    try {
      const res = await submitEnquiry({
        data: {
          full_name: fullName.trim(),
          country: country.trim(),
          email: email.trim(),
          phone: phone.trim(),
          treatment_id: selectedTreatmentId || undefined,
          treatment_interest:
            treatmentInterest ||
            SPECIALTIES.find((s) => s.id === specialty)?.label ||
            "Medical Assessment",
          message: clinicalSummaryLines,
          preferred_contact: preferredContact,
          consent: true,
          website: honeypot || undefined,
        },
      });

      if (res && res.ok) {
        setCaseReference(ref);
        setStatus("success");
        onDone?.();
      } else {
        throw new Error("Unable to save assessment");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Unable to submit your request. Please try again.",
      );
    }
  }

  // Success Confirmation Card
  if (status === "success") {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-soft md:p-10" role="status">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <span className="mt-4 inline-block rounded-full border bg-muted/40 px-3 py-1 font-mono text-xs font-medium text-foreground">
          Case Reference: {caseReference}
        </span>
        <h3 className="mt-4 font-display text-2xl font-semibold text-ink md:text-3xl">
          Clinical Intake Received
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          Thank you, <strong className="text-foreground">{fullName}</strong>. Your medical details
          have been assigned to our Senior Patient Coordination team.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-xl border bg-surface/50 p-4 text-left text-xs text-muted-foreground space-y-2.5">
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <strong className="text-foreground">Expected Response:</strong> Within 2 to 4 business
              hours via <span className="capitalize">{preferredContact}</span>.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <strong className="text-foreground">Privacy Protected:</strong> Your case summary is
              accessible only by certified hospital liaisons and coordinating physicians.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <strong className="text-foreground">What to prepare:</strong> Please have any recent
              doctor letters, prescription lists, or imaging disks (MRI/CT) ready to share with your
              coordinator.
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="mt-8"
          onClick={() => {
            setStatus("idle");
            setStep(1);
          }}
        >
          Submit another inquiry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card shadow-soft overflow-hidden">
      {/* Header & Step Indicator */}
      <div className="border-b bg-surface/50 p-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="eyebrow !text-primary">Free Pre-Clinical Triage</span>
            <h3 className="font-display text-xl font-medium text-ink md:text-2xl">
              Patient Assessment & Estimate Request
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span>Step {step} of 4</span>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { num: 1, label: "Specialty" },
            { num: 2, label: "Assessment" },
            { num: 3, label: "Timeline" },
            { num: 4, label: "Contact" },
          ].map((item) => {
            const isDone = step > item.num;
            const isCurrent = step === item.num;
            return (
              <div key={item.num} className="space-y-1">
                <div
                  className={`h-1.5 w-full rounded-full transition-colors ${
                    isDone || isCurrent ? "bg-primary" : "bg-muted"
                  }`}
                />
                <span
                  className={`hidden text-[11px] md:inline-block ${
                    isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        {/* ================= STEP 1: Specialty Selection ================= */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <h4 className="text-base font-semibold text-foreground">
                Which medical specialty or treatment do you need?
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Select your condition category so we can ask the right clinical questions.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {SPECIALTIES.map((item) => {
                const Icon = item.icon;
                const isSelected = specialty === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setSpecialty(item.id)}
                    className={`flex items-start gap-3.5 rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                        : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional Specific Procedure Dropdown / Text */}
            <div className="pt-2">
              <Label htmlFor="specific-treatment" className="text-xs font-medium">
                Specific procedure or diagnosis (optional)
              </Label>
              <Input
                id="specific-treatment"
                placeholder="e.g. Total Hip Replacement, Dental Implants, Second Opinion..."
                value={treatmentInterest}
                onChange={(e) => setTreatmentInterest(e.target.value)}
                className="mt-1 text-sm"
              />
            </div>
          </div>
        )}

        {/* ================= STEP 2: Condition-Specific Assessment ================= */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <h4 className="text-base font-semibold text-foreground">
                Clinical Details: {SPECIALTIES.find((s) => s.id === specialty)?.label}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Help our medical coordinators understand your current status and needs.
              </p>
            </div>

            {/* ORTHOPAEDICS */}
            {specialty === "orthopaedics" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Joint / Bone Area</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={clinicalCondition.jointArea}
                    onChange={(e) =>
                      setClinicalCondition({ ...clinicalCondition, jointArea: e.target.value })
                    }
                  >
                    <option>Knee (Left or Right)</option>
                    <option>Both Knees (Bilateral)</option>
                    <option>Hip Joint</option>
                    <option>Spine / Cervical / Lumbar</option>
                    <option>Shoulder / Rotator Cuff</option>
                    <option>Ankle / Foot</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Symptoms Duration</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={clinicalCondition.symptomsDuration}
                    onChange={(e) =>
                      setClinicalCondition({
                        ...clinicalCondition,
                        symptomsDuration: e.target.value,
                      })
                    }
                  >
                    <option>Less than 3 months</option>
                    <option>3 to 6 months</option>
                    <option>6 to 12 months</option>
                    <option>Over 1 year</option>
                    <option>Multiple years / Chronic</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Current Mobility Status</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={clinicalCondition.mobilityStatus}
                    onChange={(e) =>
                      setClinicalCondition({ ...clinicalCondition, mobilityStatus: e.target.value })
                    }
                  >
                    <option>Walks independently with mild pain</option>
                    <option>Walks with pain / uses assistance</option>
                    <option>Requires cane, crutches, or walker</option>
                    <option>Requires wheelchair assistance</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Recent Scans (X-Ray / MRI)</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={clinicalCondition.hasRecentScans}
                    onChange={(e) =>
                      setClinicalCondition({ ...clinicalCondition, hasRecentScans: e.target.value })
                    }
                  >
                    <option>Yes, within the last 6 months</option>
                    <option>Yes, older than 6 months</option>
                    <option>No scans yet, need guidance</option>
                  </select>
                </div>
              </div>
            )}

            {/* CARDIOLOGY */}
            {specialty === "cardiology" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Cardiac Condition / Recommendation</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={clinicalCondition.cardioDiagnosis}
                    onChange={(e) =>
                      setClinicalCondition({
                        ...clinicalCondition,
                        cardioDiagnosis: e.target.value,
                      })
                    }
                  >
                    <option>Coronary artery disease / Bypass candidate</option>
                    <option>Heart valve disease / Repair or replacement</option>
                    <option>Arrhythmia / Pacemaker or ICD</option>
                    <option>Angioplasty / Stent evaluation</option>
                    <option>Diagnostic angiography checkup</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Physician Recommendation Status</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={clinicalCondition.doctorRecommendation}
                    onChange={(e) =>
                      setClinicalCondition({
                        ...clinicalCondition,
                        doctorRecommendation: e.target.value,
                      })
                    }
                  >
                    <option>Surgery has been officially recommended</option>
                    <option>Seeking a second opinion before deciding</option>
                    <option>Exploring preventative international options</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-xs">Cardiology Reports Available</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={clinicalCondition.hasRecentScans}
                    onChange={(e) =>
                      setClinicalCondition({ ...clinicalCondition, hasRecentScans: e.target.value })
                    }
                  >
                    <option>Yes, have recent Echo / Angiogram / ECG files</option>
                    <option>Have doctor notes, but no angiogram disk yet</option>
                    <option>Need hospital to perform diagnostics upon arrival</option>
                  </select>
                </div>
              </div>
            )}

            {/* ONCOLOGY */}
            {specialty === "oncology" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Cancer Type / Organ Site</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={clinicalCondition.oncologyType}
                    onChange={(e) =>
                      setClinicalCondition({ ...clinicalCondition, oncologyType: e.target.value })
                    }
                  >
                    <option>Breast / Gynaecological</option>
                    <option>Lung / Thoracic</option>
                    <option>Colorectal / Gastrointestinal</option>
                    <option>Prostate / Urological</option>
                    <option>Head, Neck, or Thyroid</option>
                    <option>Brain / Neuro-oncology</option>
                    <option>Blood / Lymphoma / Leukaemia</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Current Staging / Status</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={clinicalCondition.oncologyStage}
                    onChange={(e) =>
                      setClinicalCondition({ ...clinicalCondition, oncologyStage: e.target.value })
                    }
                  >
                    <option>Stage I or II (Localized)</option>
                    <option>Stage III (Locally Advanced)</option>
                    <option>Stage IV (Metastatic)</option>
                    <option>Biopsy pending / Staging unknown</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-xs">Primary Goal for Treatment Abroad</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={clinicalCondition.oncologyGoal}
                    onChange={(e) =>
                      setClinicalCondition({ ...clinicalCondition, oncologyGoal: e.target.value })
                    }
                  >
                    <option>Second opinion & Surgical tumor resection</option>
                    <option>Advanced radiation therapy (Proton, CyberKnife)</option>
                    <option>Systemic chemotherapy / Immunotherapy protocols</option>
                    <option>Affordable comprehensive cancer management</option>
                  </select>
                </div>
              </div>
            )}

            {/* DENTAL */}
            {specialty === "dental" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Dental Procedure Required</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={clinicalCondition.dentalArea}
                    onChange={(e) =>
                      setClinicalCondition({ ...clinicalCondition, dentalArea: e.target.value })
                    }
                  >
                    <option>All-on-4 / All-on-6 Full Arch Implants</option>
                    <option>Multiple individual dental implants</option>
                    <option>Porcelain Crowns / Zirconia Bridge</option>
                    <option>Smile Makeover / Porcelain Veneers</option>
                    <option>Full Mouth Rehabilitation</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Panoramic Dental X-Ray (OPG)</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm"
                    value={clinicalCondition.dentalScans}
                    onChange={(e) =>
                      setClinicalCondition({ ...clinicalCondition, dentalScans: e.target.value })
                    }
                  >
                    <option>Yes, have panoramic OPG X-ray ready</option>
                    <option>Have intraoral dental photos only</option>
                    <option>No X-rays yet — will take at clinic</option>
                  </select>
                </div>
              </div>
            )}

            {/* COSMETIC, FERTILITY, OR GENERAL */}
            {(specialty === "cosmetic" || specialty === "fertility" || specialty === "general") && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Brief Clinical Summary & Symptoms</Label>
                  <textarea
                    rows={4}
                    placeholder="Describe your current medical situation, any symptoms or diagnosed conditions, and the procedure you are seeking..."
                    value={clinicalCondition.generalDescription}
                    onChange={(e) =>
                      setClinicalCondition({
                        ...clinicalCondition,
                        generalDescription: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border bg-card p-3 text-sm placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 3: Timeline & Logistics ================= */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <h4 className="text-base font-semibold text-foreground">Timeline & Travel Plans</h4>
              <p className="text-xs text-muted-foreground mt-1">
                These preferences help our travel coordinators estimate flights and scheduling.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  When are you looking to receive treatment?
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    "Urgent (< 3 weeks)",
                    "1 to 2 months",
                    "3 to 6 months",
                    "Flexible / Exploring",
                  ].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setTimeline(t)}
                      className={`rounded-lg border p-2.5 text-xs font-medium text-center transition-all ${
                        timeline === t
                          ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs flex items-center gap-1.5">
                  <Globe2 className="h-3.5 w-3.5 text-primary" />
                  Preferred Treatment Country / Region
                </Label>
                <select
                  className="mt-1.5 h-10 w-full rounded-md border bg-card px-3 text-sm"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                >
                  {DESTINATIONS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Travel Accompaniment
                </Label>
                <select
                  className="mt-1.5 h-10 w-full rounded-md border bg-card px-3 text-sm"
                  value={travelCompanion}
                  onChange={(e) => setTravelCompanion(e.target.value)}
                >
                  <option>Traveling with family / caregiver (Companion package needed)</option>
                  <option>
                    Traveling solo (Full airport transfer and hospital escort requested)
                  </option>
                  <option>Undecided</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: Contact & Verification ================= */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <h4 className="text-base font-semibold text-foreground">
                Coordinator Contact & Delivery
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Where should our patient coordinator send your quote and hospital recommendations?
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="intake-name" className="text-xs">
                  Full Patient Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="intake-name"
                  placeholder="e.g. Eleanor Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1"
                />
                {fieldErrors.fullName && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="intake-country" className="text-xs">
                  Country of Residence <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="intake-country"
                  placeholder="e.g. United Kingdom, United States, Canada..."
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1"
                />
                {fieldErrors.country && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.country}</p>
                )}
              </div>

              <div>
                <Label htmlFor="intake-email" className="text-xs">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="intake-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="intake-phone" className="text-xs">
                  Mobile / WhatsApp Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="intake-phone"
                  type="tel"
                  placeholder="+44 7700 900123"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-destructive">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Preferred Contact Method */}
            <div>
              <Label className="text-xs">Preferred Way to Discuss Your Estimate</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { id: "whatsapp", label: "WhatsApp (Fastest)", icon: MessageSquare },
                  { id: "email", label: "Email Quote", icon: Lock },
                  { id: "phone", label: "Phone Call", icon: HeartPulse },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setPreferredContact(opt.id as any)}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                      preferredContact === opt.id
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <span className="capitalize">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <Label htmlFor="intake-notes" className="text-xs">
                Additional questions or physician preferences (optional)
              </Label>
              <textarea
                id="intake-notes"
                rows={2}
                placeholder="Mention any specific hospital preferences, budget boundaries, or family questions..."
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                className="mt-1 w-full rounded-md border bg-card p-2.5 text-xs placeholder:text-muted-foreground"
              />
            </div>

            {/* Honeypot for bot protection */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="sr-only"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Consent Box */}
            <div className="rounded-xl border bg-muted/20 p-3.5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground">
                  I consent to MedJourney securely storing my medical triage information and sharing
                  it with accredited partner hospitals for the sole purpose of preparing treatment
                  estimates. All information is protected under international health data privacy
                  standards.
                </span>
              </label>
              {fieldErrors.consent && (
                <p className="mt-1.5 text-xs text-destructive">{fieldErrors.consent}</p>
              )}
            </div>

            {errorMessage && (
              <p className="text-xs text-destructive font-medium" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        )}

        {/* Buttons / Actions */}
        <div className="flex items-center justify-between border-t pt-5">
          {step > 1 ? (
            <Button type="button" variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span>256-bit encrypted intake</span>
            </div>
          )}

          {step < 4 ? (
            <Button type="button" size="sm" onClick={handleNext}>
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" size="sm" disabled={status === "submitting"}>
              {status === "submitting" ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Submitting Intake...
                </>
              ) : (
                <>
                  Submit Medical Assessment <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
