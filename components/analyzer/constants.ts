export const EXAMPLE_SITES = [
  "stripe.com",
  "notion.so",
  "intercom.com",
  "vercel.com",
  "linear.app",
  "figma.com",
];

export const CATEGORY_COLORS: Record<string, string> = {
  frontend: "bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/25",
  backend: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25",
  analytics: "bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/25",
  crm_marketing: "bg-purple-500/15 text-purple-400 border-purple-500/20 hover:bg-purple-500/25",
  support_chat: "bg-pink-500/15 text-pink-400 border-pink-500/20 hover:bg-pink-500/25",
  payments: "bg-green-500/15 text-green-400 border-green-500/20 hover:bg-green-500/25",
  infra_security: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/25",
  other: "bg-gray-500/15 text-gray-400 border-gray-500/20 hover:bg-gray-500/25",
};

export const FIT_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  low: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    bar: "bg-red-500",
  },
  medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    bar: "bg-amber-500",
  },
  high: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    bar: "bg-emerald-500",
  },
};

export const CONFIDENCE_BADGES: Record<string, string> = {
  low: "bg-red-500/15 text-red-400 border-red-500/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  high: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};
