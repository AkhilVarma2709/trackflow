export type Company = {
  id: string;
  name: string;
  industry: string;
  lastResearched: string;
  latestSignal: string;
  website: string;
  initials: string;
};

export const companies: Company[] = [
  { id: "novatech", name: "NovaTech", industry: "SaaS", lastResearched: "May 28, 2025", latestSignal: "Raised $40M Series B", website: "novatech.io", initials: "NT" },
  { id: "peaklabs", name: "PeakLabs", industry: "Fintech", lastResearched: "May 27, 2025", latestSignal: "Launched new payments API", website: "peaklabs.co", initials: "PL" },
  { id: "aster-ai", name: "Aster AI", industry: "AI", lastResearched: "May 26, 2025", latestSignal: "Hired ex-OpenAI VP of Research", website: "aster.ai", initials: "AA" },
  { id: "northlane", name: "Northlane", industry: "MarTech", lastResearched: "May 25, 2025", latestSignal: "Opened London office", website: "northlane.com", initials: "NL" },
  { id: "meridian", name: "Meridian Co.", industry: "Enterprise Software", lastResearched: "May 24, 2025", latestSignal: "Acquired analytics startup Quill", website: "meridian.co", initials: "MC" },
];

export type Signal = {
  category: "Product" | "Funding" | "Leadership" | "Hiring";
  company: string;
  description: string;
  date: string;
};

export const recentSignals: Signal[] = [
  { category: "Funding", company: "NovaTech", description: "Closed $40M Series B led by Accel.", date: "2d ago" },
  { category: "Leadership", company: "Aster AI", description: "Appointed new VP of Research from OpenAI.", date: "3d ago" },
  { category: "Product", company: "PeakLabs", description: "Shipped programmable payments API v2.", date: "4d ago" },
  { category: "Hiring", company: "Meridian Co.", description: "Opened 23 new engineering roles globally.", date: "5d ago" },
];
