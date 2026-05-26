import { z } from "zod";

export const analyzeInputSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(2048, "URL is too long")
    .refine(
      (val) => {
        // Accept both bare domains (stripe.com) and full URLs
        const urlLike = val.includes("://") ? val : `https://${val}`;
        try {
          new URL(urlLike);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid URL format" }
    ),
});

export type AnalyzeInput = z.infer<typeof analyzeInputSchema>;
