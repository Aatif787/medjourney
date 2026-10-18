import consultation from "@/assets/consultation.jpg.asset.json";
import hospital from "@/assets/hospital.jpg.asset.json";
import hospitalExterior from "@/assets/hospital-exterior.jpg.asset.json";
import hospitalInterior from "@/assets/hospital-interior.jpg.asset.json";
import notes from "@/assets/notes.jpg.asset.json";
import travel from "@/assets/travel.jpg.asset.json";

/** Only replace the original generated demo images; keep CMS uploads untouched. */
export function editorialImage(
  source?: string | null,
): { url: string; alt?: string; illustrative?: boolean } | null {
  if (!source) return null;
  const path = source.split("?")[0];
  if (path === "/images/hospital-1.jpg")
    return {
      url: hospitalExterior.url,
      alt: "Hospital building surrounded by trees",
      illustrative: true,
    };
  if (path === "/images/hospital-2.jpg")
    return {
      url: hospitalInterior.url,
      alt: "Hospital interior with a reception area",
      illustrative: true,
    };
  if (path === "/images/hospital-3.jpg") {
    return {
      url: hospital.url,
      alt: "Operating room with surgical lights and equipment",
      illustrative: true,
    };
  }
  if (path === "/images/blog-1.jpg")
    return { url: travel.url, alt: "View of an aircraft wing above the clouds" };
  if (path === "/images/blog-2.jpg")
    return { url: notes.url, alt: "Fountain pen on handwritten notes" };
  if (path === "/images/blog-3.jpg")
    return { url: consultation.url, alt: "Doctor holding a phone" };
  return { url: source };
}
