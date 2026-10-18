import { describe, expect, it } from "vitest";
import { editorialImage } from "@/lib/editorial-images";

describe("Editorial image replacements", () => {
  it("preserves a hospital photograph uploaded through the CMS", () => {
    const source = "/media/hospitals/real-hospital.jpg";
    expect(editorialImage(source)).toEqual({ url: source });
  });
  it("marks replacement demo hospital photographs as illustrative", () => {
    for (const source of [
      "/images/hospital-1.jpg",
      "/images/hospital-2.jpg",
      "/images/hospital-3.jpg",
    ]) {
      expect(editorialImage(source)?.illustrative).toBe(true);
      expect(editorialImage(source)?.url).toBe(source);
    }
  });
});
