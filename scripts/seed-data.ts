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

export const SEED_PRODUCTS = [
  {
    slug: "ultimate-business-success-package", name: "Ultimate Business Success Package", kind: "PACKAGE" as const,
    description: "Everything you need to get your business up and running successfully with business credit and tradelines.",
    features: ["Business website (free website outline included; monthly subscription not included)", "Virtual office (monthly subscription not included)", "5 business tradeline purchases", "Business phone system (monthly subscription not included)", "3 months of round-the-clock consulting"].join("\n"),
    priceCents: 379900, allowInstallments: true,
    // Draft until the tradeline offering has been researched and approved for public listing.
    published: false,
  },
  {
    slug: "bare-bones-business-tradelines-package", name: "Bare Bones Business Tradelines Package", kind: "PACKAGE" as const,
    description: "Tradelines with reporting, plus consulting.",
    features: ["5 tradelines with 3 months of reporting", "3 months of round-the-clock consulting"].join("\n"),
    priceCents: 325000, allowInstallments: true, published: false,
  },
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
].map((p, i) => ({ description: "", features: "", priceNote: "", allowInstallments: false, published: true, ...p, sortOrder: i }));

export const SEED_PLANS = [
  { slug: "consulting-12-month", name: "Unlimited Monthly Consultation: 12-month plan", description: "Unlimited business consultation each month for 12 months.", monthlyPriceCents: 100000, termMonths: 12, grantsPremium: true },
  { slug: "consulting-6-month", name: "Unlimited Monthly Consultation: 6-month plan", description: "Unlimited business consultation each month for 6 months.", monthlyPriceCents: 150000, termMonths: 6, grantsPremium: true },
  { slug: "consulting-3-month", name: "Unlimited Monthly Consultation: 3-month plan", description: "Unlimited business consultation each month for 3 months.", monthlyPriceCents: 180000, termMonths: 3, grantsPremium: true },
  { slug: "education-pass", name: "Education Pass", description: "Unlimited access to our digital library: every eBook and tutorial on the products page, for one monthly fee.", monthlyPriceCents: 2199, termMonths: null, grantsPremium: true },
].map((p, i) => ({ ...p, sortOrder: i }));
