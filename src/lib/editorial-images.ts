/**
 * Resolves editorial and illustrative image paths for demo and CMS records.
 * Uses local static images served from /images/*, preserving CMS uploads and labelling illustrative photos.
 */
export function editorialImage(
  source?: string | null,
): { url: string; alt?: string; illustrative?: boolean } | null {
  if (!source) return null;
  const path = source.split("?")[0];
  if (path === "/images/hospital-1.jpg")
    return {
      url: "/images/hospital-1.jpg",
      alt: "Modern hospital building surrounded by trees and water",
      illustrative: true,
    };
  if (path === "/images/hospital-2.jpg")
    return {
      url: "/images/hospital-2.jpg",
      alt: "Hospital campus with modern architectural facilities",
      illustrative: true,
    };
  if (path === "/images/hospital-3.jpg") {
    return {
      url: "/images/hospital-3.jpg",
      alt: "State-of-the-art clinic examination room and diagnostic equipment",
      illustrative: true,
    };
  }
  if (path === "/images/blog-1.jpg")
    return {
      url: "/images/blog-1.jpg",
      alt: "Traveller with medical documents and passport preparing for care abroad",
    };
  if (path === "/images/blog-2.jpg")
    return {
      url: "/images/blog-2.jpg",
      alt: "Doctor reviewing neurological imaging and MRI scan with patient",
    };
  if (path === "/images/blog-3.jpg")
    return {
      url: "/images/blog-3.jpg",
      alt: "Physical therapy and rehabilitation session for recovery",
    };
  return { url: source };
}
