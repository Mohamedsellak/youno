export type Confidence = "low" | "medium" | "high";

export type TechCategory =
  | "frontend"
  | "backend"
  | "analytics"
  | "crm_marketing"
  | "support_chat"
  | "payments"
  | "infra_security"
  | "other";

export type TechItem = {
  name: string;
  category: TechCategory;
  evidence?: string;
};

export type GtmSignal = {
  name: string;
  value: boolean;
  evidence?: string;
};

export type FitScore = {
  score: number; // 0..10
  label: "low" | "medium" | "high";
  reasons: string[];
};

export type CompanyInfo = {
  name: string | null;
  description: string | null;
  industry: string | null;
  sizeBucket: "solo" | "small" | "mid" | "enterprise" | null;
  confidence: Confidence;
};

export type ContactsInfo = {
  domain: string;
  source: "hunter";
  emails?: Array<{
    value: string;
    type?: string;
    confidence?: string;
    firstName?: string;
    lastName?: string;
    position?: string;
  }>;
};

export type AnalysisResult = {
  input: { url: string; normalizedUrl: string };
  company: CompanyInfo;
  techStack: TechItem[];
  gtmSignals: GtmSignal[];
  contacts?: ContactsInfo;
  fitScore?: FitScore;
  meta: {
    fetchedAt: string;
    httpStatus?: number;
    timingsMs?: Record<string, number>;
  };
  debug?: {
    title?: string;
    metaDescription?: string;
    linksSample?: string[];
  };
};

/** Shape returned by the LLM enrichment */
export type LLMEnrichmentResult = {
  company: {
    name: string | null;
    description: string | null;
    industry: string | null;
    sizeBucket: "solo" | "small" | "mid" | "enterprise" | null;
    confidence: Confidence;
  };
  techStackAdditions?: TechItem[];
  gtmSignalsAdditions?: GtmSignal[];
};

/** Intermediate extraction result from HTML scraping */
export type ExtractionResult = {
  title: string | null;
  metaDescription: string | null;
  ogSiteName: string | null;
  ogDescription: string | null;
  links: string[];
  textSnippet: string;
  headers: Record<string, string>;
};
