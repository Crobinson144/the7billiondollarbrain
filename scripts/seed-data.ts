/** Starting catalog, taken from the site spec. Everything here can be edited in the admin panel. */
export const SEED_SERVICES = [
  { slug: "consulting", title: "Consulting", summary: "Guidance on licensing, local laws, architectural placement, general questions, industry-specific questions and more. No question or task is too small.", body: "We have a broad range of business experience to consult you on. We offer a 30-minute FREE consultation, which helps us both determine your exact needs." },
  { slug: "start-up-support", title: "Start-up support", summary: "We support your start-up dream and turn it into a reality, from point A to point Z.", body: "Every step of the way, we assist you." },
  { slug: "business-planning", title: "Business planning", summary: "We help you plan your business and customize the process to make it less stressful and more productive.", body: "" },
  { slug: "market-research", title: "Market research", summary: "From demographics to your main competitors, we research everything that shapes your likelihood of success in the business you want.", body: "" },
  { slug: "idea-farming", title: "Idea farming", summary: "We help refine your idea to make it as successful as possible.", body: "" },
  { slug: "business-turnaround", title: "Business turnaround", summary: "We help you turn around a struggling business, from daily business practices to locating funding sources to work with you.", body: "" },
  { slug: "human-resources", title: "Human resources", summary: "We take over your human resource needs, including employee testing, onboarding, hiring and loss prevention, so you can focus on the bottom line.", body: "" },
  { slug: "employee-testing", title: "Employee testing", summary: "We choose the best employment test and handle administration, scoring and results.", body: "" },
  { slug: "hiring-services", title: "Hiring services", summary: "We help you pick and hire the best candidates for your business.", body: "" },
  { slug: "loss-prevention", title: "Loss prevention", summary: "We monitor all areas of your business, including financial records, to find where you are taking a loss, and present our suggestions after 30 days of observation.", body: "" },
].map((s, i) => ({ ...s, sortOrder: i }));

/**
 * Business credit packages. Structured as setup and coaching in the client's own business name, never as buying or
 * renting someone else's credit accounts; see the research notes in the project docs. Drafts until reviewed by an attorney.
 */
const CREDIT_PACKAGES = [
  {
    slug: "ultimate-business-success-package", name: "Ultimate Business Success Package", kind: "PACKAGE" as const,
    description: "Everything you need to get your business set up properly and start building business credit in its own name. Vendor approvals and credit reporting are decided by the vendors and credit bureaus; we can't guarantee any score or approval.",
    features: [
      "Business website outline (free; hosting and monthly subscription not included)",
      "Virtual office setup (monthly subscription not included)",
      "Business credit foundation: EIN, D-U-N-S number and consistent business listings, plus help applying for 5 vendor accounts in your business's name that report to business credit bureaus",
      "Business phone system setup (monthly subscription not included)",
      "3 months of round-the-clock consulting",
    ].join("\n"),
    priceCents: 379900, allowInstallments: true, published: false,
  },
  {
    // Slug kept from the first version so re-running the seed doesn't create a duplicate.
    slug: "bare-bones-business-tradelines-package", name: "Business Credit Foundation Package", kind: "PACKAGE" as const,
    description: "We set up your business so it can build credit in its own name, help you open vendor accounts that report to the business credit bureaus, and coach you for 3 months. Vendor approvals and credit reporting are decided by third parties; we can't guarantee any score or approval.",
    features: [
      "Business credit profile setup: EIN, D-U-N-S number, business address and phone listed consistently",
      "Help applying for 5 net-30 vendor accounts in your business's name that report to business credit bureaus",
      "A 3-month payment calendar and a review of your business credit reports each month",
      "3 months of round-the-clock consulting",
    ].join("\n"),
    priceCents: 325000, allowInstallments: true, published: false,
  },
];

/**
 * Starter library (researched September 2026). All drafts: publish each one from the admin panel once its file or
 * video link is added. priceCents 0 = free with an account; null + membersOnly = Education Pass only.
 */
const LIBRARY = [
  { slug: "start-smart-launch-checklist", name: "The Start-Smart Launch Checklist", kind: "EBOOK" as const, priceCents: 0,
    description: "The 25 steps to open your business legally and ready for credit, in the right order. Free with an account.",
    features: ["Gut-check your idea", "Check your name and domain", "Choose a business structure", "Get your EIN", "Open a business bank account", "Licenses and permits", "Basic bookkeeping", "What to do next"] },
  { slug: "business-health-check", name: "The 10-Minute Business Health Check", kind: "EBOOK" as const, priceCents: 0,
    description: "Score your cash, sales, team and debt in ten minutes and see where your business is losing money. Free with an account.",
    features: ["Cash runway", "Profit margin check", "Customer concentration", "Overdue bills", "Staffing", "Red-flag score and what it means"] },
  { slug: "from-idea-to-open", name: "From Idea to Open: The First-Time Founder's Launch Guide", kind: "EBOOK" as const, priceCents: 1900,
    description: "Go from idea to a legally open business in 30 to 60 days without wasting money.",
    features: ["Validate the idea", "Estimate startup costs", "Business structure basics", "Registrations and EIN", "Name, logo and trademark basics", "Phone, virtual office and domain", "Your first 90 days"] },
  { slug: "lender-ready-business-plan-workbook", name: "The Lender-Ready Business Plan Workbook", kind: "EBOOK" as const, priceCents: 2700,
    description: "Write a business plan a banker or community lender will actually read, with a fill-in workbook.",
    features: ["Executive summary", "Market and competition", "Operations", "Marketing", "Startup budget", "12-month cash flow and break-even", "A sample plan with lender comments"] },
  { slug: "business-credit-foundations", name: "Business Credit Foundations", kind: "EBOOK" as const, priceCents: 2700,
    description: "How business credit files work and how to build one the legitimate way, in your business's own name.",
    features: ["Separate personal and business finances", "The business credit bureaus", "Consistent entity, address and phone", "Vendor (net-30) accounts that report", "Monitoring and disputes", "Red flags: CPNs and \"guaranteed\" offers", "Realistic timelines"] },
  { slug: "cash-flow-survival-guide", name: "Cash Flow Survival Guide", kind: "EBOOK" as const, priceCents: 1900,
    description: "See a cash crunch 13 weeks before it hits, with a forecast spreadsheet.",
    features: ["Profit vs. cash", "Build a 13-week forecast", "Get paid faster", "Negotiate with vendors", "Cut costs without cutting growth", "When to get help"] },
  { slug: "funding-roadmap", name: "Funding Roadmap: Loans, Microloans, CDFIs and Grants", kind: "EBOOK" as const, priceCents: 1900,
    description: "Match your business to the right source of money and avoid expensive, predatory lending.",
    features: ["Bootstrapping", "SBA microloans and 7(a) loans", "Community development lenders (CDFIs)", "Grants and grant scams", "What merchant cash advances really cost", "Loan-readiness checklist"] },
  { slug: "know-your-market-on-a-shoestring", name: "Know Your Market on a Shoestring", kind: "EBOOK" as const, priceCents: 1700,
    description: "Find out whether people will buy before you spend money, using free data and simple tests.",
    features: ["Define your customer", "Free Census and SBA data", "Competitor check", "Ten customer interviews", "Pre-sale tests", "Go/no-go scorecard"] },
  { slug: "hire-right-the-first-time", name: "Hire Right the First Time", kind: "EBOOK" as const, priceCents: 2700,
    description: "Hire, test and onboard your first employees without costly mistakes. Includes templates.",
    features: ["Write the job description", "Lawful interviewing basics", "Skills testing", "Reference checks", "30/60/90-day onboarding", "Keeping records"] },
  { slug: "stop-the-leaks", name: "Stop the Leaks: Loss Prevention for Small Shops", kind: "EBOOK" as const, priceCents: null, membersOnly: true,
    description: "Find where your shop is losing money to shrink, cash handling and inventory problems. Education Pass only.",
    features: ["Where shrink comes from", "Cash-handling controls", "Inventory counts", "Internal-theft red flags", "Policies and training"] },
  { slug: "set-up-your-business-the-right-way", name: "Set Up Your Business the Right Way", kind: "VIDEO" as const, priceCents: 3900,
    description: "Six short lessons (about 45 minutes) on business structure, EIN, bank account and licenses.",
    features: ["Choosing a structure", "Filing and registered agent", "EIN", "Business bank account", "Licenses and permits", "Setup checklist"] },
  { slug: "build-your-business-plan-in-a-weekend", name: "Build Your Business Plan in a Weekend", kind: "VIDEO" as const, priceCents: 5900,
    description: "Eight short lessons (about 70 minutes) that walk you through a complete, lender-ready plan.",
    features: ["Plan outline", "Market section", "Operations", "Marketing", "Startup budget", "Cash flow", "Break-even", "Final review"] },
  { slug: "business-credit-101", name: "Business Credit 101 Walkthrough", kind: "VIDEO" as const, priceCents: 4900,
    description: "Seven short lessons (about 55 minutes) on building business credit legitimately.",
    features: ["How business credit works", "D-U-N-S and bureau files", "Consistent business details", "Vendor accounts that report", "Paying on time and monitoring", "Disputes", "Scams to avoid"] },
  { slug: "cash-flow-forecast-in-one-spreadsheet", name: "Cash Flow Forecast in One Spreadsheet", kind: "VIDEO" as const, priceCents: 3900,
    description: "Five short lessons (about 35 minutes) to build and use a 13-week cash forecast.",
    features: ["Set up the sheet", "Money in", "Money out", "Reading the forecast", "Acting on it"] },
  { slug: "your-first-10-customers", name: "Your First 10 Customers", kind: "VIDEO" as const, priceCents: 3900,
    description: "Six short lessons (about 45 minutes) on finding and winning your first paying customers.",
    features: ["Who buys first", "Your offer", "Where to find them", "Outreach scripts", "Closing the sale", "Getting referrals"] },
  { slug: "validate-your-idea", name: "Validate Your Idea Before You Spend a Dime", kind: "VIDEO" as const, priceCents: 2900,
    description: "Five short lessons (about 35 minutes) to test demand before you invest.",
    features: ["Assumptions to test", "Customer interviews", "Simple landing-page test", "Pre-sales", "Decide: go, change or stop"] },
  { slug: "hiring-and-onboarding-your-first-employee", name: "Hiring and Onboarding Your First Employee", kind: "VIDEO" as const, priceCents: 4900,
    description: "Six short lessons (about 45 minutes) on hiring and onboarding your first employee. Employment rules vary by state.",
    features: ["Are you ready to hire?", "Job description", "Interviews and testing", "Offer and paperwork", "First-week onboarding", "30/60/90-day check-ins"] },
  { slug: "price-for-profit", name: "Price for Profit", kind: "VIDEO" as const, priceCents: null, membersOnly: true,
    description: "Four short lessons (about 30 minutes) on setting prices that cover your costs and grow profit. Education Pass only.",
    features: ["Know your true costs", "Value-based pricing", "Testing price changes", "Raising prices without losing customers"] },
].map((item) => ({
  ...item,
  features: item.features.join("\n"),
  includedWithPremium: true,
  published: false,
}));

const OTHER_PRODUCTS = [
  { slug: "additional-90-days-consulting", name: "Additional 90 days of round-the-clock consulting", kind: "ADDON" as const, priceCents: 100000 },
  { slug: "name-change", name: "Name change", kind: "ADDON" as const, priceCents: 27500 },
  { slug: "business-logo", name: "Business logo", kind: "ADDON" as const, priceCents: 30000 },
  { slug: "copyright", name: "Copyright", kind: "ADDON" as const, priceCents: 15000 },
  { slug: "trademark", name: "Trademark", kind: "QUOTE" as const, priceCents: null },
  { slug: "corporation-formation", name: "Corporation formation", kind: "QUOTE" as const, priceCents: null },
  { slug: "domain-services", name: "Domain services", kind: "QUOTE" as const, priceCents: null },
  { slug: "virtual-office", name: "Virtual office", kind: "QUOTE" as const, priceCents: null, priceNote: "Monthly subscription not included" },
  { slug: "business-phone-system", name: "Business phone system", kind: "QUOTE" as const, priceCents: null, priceNote: "Monthly subscription not included" },
  { slug: "custom-service", name: "Custom service", kind: "QUOTE" as const, priceCents: null },
];

type SeedProduct = {
  slug: string; name: string; kind: "EBOOK" | "VIDEO" | "PACKAGE" | "ADDON" | "QUOTE"; priceCents: number | null;
  description?: string; features?: string; priceNote?: string; allowInstallments?: boolean; published?: boolean;
  includedWithPremium?: boolean; membersOnly?: boolean;
};

export const SEED_PRODUCTS = ([...CREDIT_PACKAGES, ...OTHER_PRODUCTS, ...LIBRARY] as SeedProduct[]).map((p, i) => ({
  description: "", features: "", priceNote: "", allowInstallments: false, published: true, includedWithPremium: false, membersOnly: false,
  ...p, sortOrder: i,
}));

export const SEED_PLANS = [
  { slug: "consulting-12-month", name: "Unlimited Monthly Consultation: 12-month plan", description: "Unlimited business consultation each month for 12 months.", monthlyPriceCents: 100000, termMonths: 12, grantsPremium: true },
  { slug: "consulting-6-month", name: "Unlimited Monthly Consultation: 6-month plan", description: "Unlimited business consultation each month for 6 months.", monthlyPriceCents: 150000, termMonths: 6, grantsPremium: true },
  { slug: "consulting-3-month", name: "Unlimited Monthly Consultation: 3-month plan", description: "Unlimited business consultation each month for 3 months.", monthlyPriceCents: 180000, termMonths: 3, grantsPremium: true },
  { slug: "education-pass", name: "Education Pass", description: "Unlimited access to our digital library: every eBook and tutorial on the products page, for one monthly fee.", monthlyPriceCents: 2199, termMonths: null, grantsPremium: true },
].map((p, i) => ({ ...p, sortOrder: i }));
