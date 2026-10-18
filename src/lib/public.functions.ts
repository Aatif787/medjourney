import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";
import { publicClient } from "./public-client.server";

const PAGE_SIZE = 9;

function must<T>(res: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (res.error) throw new Error(res.error.message);
  return res.data as NonNullable<T>;
}

const HOSPITAL_CARD = "id,name,slug,cover_url,logo_url,country,city,overview,accreditations";
const DOCTOR_CARD = "id,name,slug,photo_url,title,experience_years,languages,verification_status";
const TREATMENT_CARD = "id,name,slug,summary,category:categories(name,slug)";
const POST_CARD =
  "id,title,slug,excerpt,featured_image,featured_image_alt,published_at,author_name,category:categories(name,slug)";

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  return must(await sb.from("site_settings").select("*").eq("id", 1).maybeSingle());
});

export const getHome = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [specialties, hospitals, doctors, posts, treatments] = await Promise.all([
    sb
      .from("categories")
      .select("id,name,slug,description,icon")
      .eq("kind", "specialty")
      .order("sort_order"),
    sb.from("hospitals").select(HOSPITAL_CARD).eq("is_featured", true).order("name").limit(3),
    sb.from("doctors").select(DOCTOR_CARD).eq("is_featured", true).order("name").limit(4),
    sb
      .from("posts")
      .select(POST_CARD)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(3),
    sb.from("treatments").select("id,name,slug").order("name"),
  ]);
  return {
    specialties: must(specialties),
    hospitals: must(hospitals),
    doctors: must(doctors),
    posts: must(posts),
    treatments: must(treatments),
  };
});

export const listTreatmentOptions = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  return must(await sb.from("treatments").select("id,name,slug").order("name"));
});

export const listTreatmentsPage = createServerFn({ method: "GET" })
  .inputValidator((d: { q?: string }) => z.object({ q: z.string().max(100).optional() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    let tq = sb
      .from("treatments")
      .select(TREATMENT_CARD + ",category_id")
      .order("name");
    if (data.q) tq = tq.ilike("name", `%${data.q}%`);
    const [cats, treatments] = await Promise.all([
      sb
        .from("categories")
        .select("id,name,slug,description")
        .eq("kind", "specialty")
        .order("sort_order"),
      tq,
    ]);
    return { categories: must(cats), treatments: must(treatments) as any[] };
  });

export const getSpecialty = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(120) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const cat = must(
      await sb
        .from("categories")
        .select("*")
        .eq("kind", "specialty")
        .eq("slug", data.slug)
        .maybeSingle(),
    );
    if (!cat) throw notFound();
    const [treatments, hs, ds] = await Promise.all([
      sb.from("treatments").select(TREATMENT_CARD).eq("category_id", cat.id).order("name"),
      sb
        .from("hospital_specialties")
        .select(`hospital:hospitals(${HOSPITAL_CARD})`)
        .eq("category_id", cat.id),
      sb
        .from("doctor_specialties")
        .select(`doctor:doctors(${DOCTOR_CARD})`)
        .eq("category_id", cat.id),
    ]);
    return {
      category: cat,
      treatments: must(treatments),
      hospitals: (must(hs) as any[]).map((r) => r.hospital).filter(Boolean),
      doctors: (must(ds) as any[]).map((r) => r.doctor).filter(Boolean),
    };
  });

export const getTreatment = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(120) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const t = must(
      await sb
        .from("treatments")
        .select("*, category:categories(name,slug)")
        .eq("slug", data.slug)
        .maybeSingle(),
    );
    if (!t) throw notFound();
    const [hs, ds] = await Promise.all([
      sb
        .from("hospital_treatments")
        .select(`hospital:hospitals(${HOSPITAL_CARD})`)
        .eq("treatment_id", t.id),
      sb
        .from("doctor_treatments")
        .select(`doctor:doctors(${DOCTOR_CARD})`)
        .eq("treatment_id", t.id),
    ]);
    return {
      treatment: t as any,
      hospitals: (must(hs) as any[]).map((r) => r.hospital).filter(Boolean),
      doctors: (must(ds) as any[]).map((r) => r.doctor).filter(Boolean),
    };
  });

const listSchema = z.object({
  q: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  specialty: z.string().max(120).optional(),
  page: z.number().int().min(1).max(500).optional(),
});

export const listHospitals = createServerFn({ method: "GET" })
  .inputValidator((d: z.infer<typeof listSchema>) => listSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const page = data.page ?? 1;
    let ids: string[] | null = null;
    if (data.specialty) {
      const cat = must(
        await sb
          .from("categories")
          .select("id")
          .eq("kind", "specialty")
          .eq("slug", data.specialty)
          .maybeSingle(),
      );
      ids = cat
        ? (
            must(
              await sb.from("hospital_specialties").select("hospital_id").eq("category_id", cat.id),
            ) as any[]
          ).map((r) => r.hospital_id)
        : [];
    }
    let q = sb.from("hospitals").select(HOSPITAL_CARD, { count: "exact" }).order("name");
    if (data.q) q = q.ilike("name", `%${data.q}%`);
    if (data.country) q = q.eq("country", data.country);
    if (ids) q = q.in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const res = await q.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    const [countries, specialties] = await Promise.all([
      sb.from("hospitals").select("country"),
      sb.from("categories").select("name,slug").eq("kind", "specialty").order("sort_order"),
    ]);
    const countryList = Array.from(
      new Set((must(countries) as any[]).map((c) => c.country).filter(Boolean)),
    ).sort();
    return {
      items: must(res) as any[],
      total: res.count ?? 0,
      page,
      pageSize: PAGE_SIZE,
      countries: countryList as string[],
      specialties: must(specialties),
    };
  });

export const getHospital = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const h = must(await sb.from("hospitals").select("*").eq("slug", data.slug).maybeSingle());
    if (!h) throw notFound();
    const [sp, tr, dr] = await Promise.all([
      sb
        .from("hospital_specialties")
        .select("category:categories(name,slug)")
        .eq("hospital_id", h.id),
      sb
        .from("hospital_treatments")
        .select(`treatment:treatments(${TREATMENT_CARD})`)
        .eq("hospital_id", h.id),
      sb.from("doctor_hospitals").select(`doctor:doctors(${DOCTOR_CARD})`).eq("hospital_id", h.id),
    ]);
    return {
      hospital: h as any,
      specialties: (must(sp) as any[]).map((r) => r.category).filter(Boolean),
      treatments: (must(tr) as any[]).map((r) => r.treatment).filter(Boolean),
      doctors: (must(dr) as any[]).map((r) => r.doctor).filter(Boolean),
    };
  });

export const listDoctors = createServerFn({ method: "GET" })
  .inputValidator((d: z.infer<typeof listSchema>) => listSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const page = data.page ?? 1;
    let ids: string[] | null = null;
    if (data.specialty) {
      const cat = must(
        await sb
          .from("categories")
          .select("id")
          .eq("kind", "specialty")
          .eq("slug", data.specialty)
          .maybeSingle(),
      );
      ids = cat
        ? (
            must(
              await sb.from("doctor_specialties").select("doctor_id").eq("category_id", cat.id),
            ) as any[]
          ).map((r) => r.doctor_id)
        : [];
    }
    let q = sb
      .from("doctors")
      .select(DOCTOR_CARD + ",doctor_specialties(category:categories(name))", { count: "exact" })
      .order("name");
    if (data.q) q = q.ilike("name", `%${data.q}%`);
    if (ids) q = q.in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const res = await q.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    const specialties = must(
      await sb.from("categories").select("name,slug").eq("kind", "specialty").order("sort_order"),
    );
    return {
      items: must(res) as any[],
      total: res.count ?? 0,
      page,
      pageSize: PAGE_SIZE,
      specialties,
    };
  });

export const getDoctor = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const d = must(await sb.from("doctors").select("*").eq("slug", data.slug).maybeSingle());
    if (!d) throw notFound();
    const [sp, hs, tr] = await Promise.all([
      sb.from("doctor_specialties").select("category:categories(name,slug)").eq("doctor_id", d.id),
      sb
        .from("doctor_hospitals")
        .select(`hospital:hospitals(${HOSPITAL_CARD})`)
        .eq("doctor_id", d.id),
      sb.from("doctor_treatments").select("treatment:treatments(name,slug)").eq("doctor_id", d.id),
    ]);
    return {
      doctor: d as any,
      specialties: (must(sp) as any[]).map((r) => r.category).filter(Boolean),
      hospitals: (must(hs) as any[]).map((r) => r.hospital).filter(Boolean),
      treatments: (must(tr) as any[]).map((r) => r.treatment).filter(Boolean),
    };
  });

export const listPosts = createServerFn({ method: "GET" })
  .inputValidator((d: { page?: number; category?: string }) =>
    z
      .object({
        page: z.number().int().min(1).max(500).optional(),
        category: z.string().max(120).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    const page = data.page ?? 1;
    let q = sb
      .from("posts")
      .select(POST_CARD + ",category_id", { count: "exact" })
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false });
    const cats = must(
      await sb.from("categories").select("id,name,slug").eq("kind", "blog").order("sort_order"),
    );
    if (data.category) {
      const c = cats.find((x) => x.slug === data.category);
      q = q.eq("category_id", c?.id ?? "00000000-0000-0000-0000-000000000000");
    }
    const res = await q.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    return {
      items: must(res) as any[],
      total: res.count ?? 0,
      page,
      pageSize: PAGE_SIZE,
      categories: cats,
    };
  });

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const p = must(
      await sb
        .from("posts")
        .select("*, category:categories(name,slug)")
        .eq("slug", data.slug)
        .maybeSingle(),
    );
    if (!p) throw notFound();
    const [tr, hs] = await Promise.all([
      sb
        .from("post_treatments")
        .select(`treatment:treatments(${TREATMENT_CARD})`)
        .eq("post_id", p.id),
      sb.from("post_hospitals").select(`hospital:hospitals(${HOSPITAL_CARD})`).eq("post_id", p.id),
    ]);
    return {
      post: p as any,
      treatments: (must(tr) as any[]).map((r) => r.treatment).filter(Boolean),
      hospitals: (must(hs) as any[]).map((r) => r.hospital).filter(Boolean),
    };
  });

const enquirySchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your name").max(150),
  country: z.string().trim().min(2, "Please enter your country").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  treatment_interest: z.string().trim().max(200).optional().or(z.literal("")),
  treatment_id: z.string().uuid().optional().or(z.literal("")),
  message: z.string().trim().max(3000).optional().or(z.literal("")),
  preferred_contact: z.enum(["email", "phone", "whatsapp"]),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
  website: z.string().max(0).optional(), // honeypot
});
export type EnquiryInput = z.infer<typeof enquirySchema>;
export { enquirySchema };

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((d: EnquiryInput) => enquirySchema.parse(d))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true }; // silently drop bots
    const sb = publicClient();
    const { error } = await sb.from("enquiries").insert({
      full_name: data.full_name,
      country: data.country,
      email: data.email,
      phone: data.phone || null,
      treatment_interest: data.treatment_interest || null,
      treatment_id: data.treatment_id || null,
      message: data.message || null,
      preferred_contact: data.preferred_contact,
      consent: true,
    });
    if (error) {
      console.error("enquiry insert failed", error.message);
      throw new Error("We couldn't save your enquiry. Please try again.");
    }
    return { ok: true };
  });
