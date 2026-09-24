/** Default copy for every editable block. The admin panel edits these; the seed script loads them. */
export const CONTENT_DEFAULTS: Record<string, { label: string; body: string }> = {
  "home.tagline": { label: "Home: tagline", body: "Leveling the playing field for small businesses" },
  "home.intro": {
    label: "Home: introduction",
    body: "The 7 Billion Dollar Brain is a business services and consulting firm. We help founders start, plan, grow and turn around small businesses, and we publish practical guides for owners who prefer to do it themselves.",
  },
  "services.intro": {
    label: "Services: introduction",
    body: "We offer a 30-minute free consultation to help us both determine your exact needs. Choose a service below and schedule a session.",
  },
  "products.intro": {
    label: "Products: introduction",
    body: "This page includes all of our educational eBooks and video tutorials. Our content is a more cost-effective do-it-yourself solution to many of your questions and concerns about your business.",
  },
  "products.installments": {
    label: "Products: installments note",
    body: "Because we want to help, all packages are eligible for 3, 6 or 9 monthly installments.",
  },
  "subscriptions.intro": {
    label: "Subscriptions: introduction",
    body: "Monthly plans for ongoing support. Our consulting fee is normally $200 per hour after the first hour; a subscription gives you the same quality of service for much less.",
  },
  "about.body": {
    label: "About us",
    body: [
      "We are a homegrown, modern consulting firm built on 33 years of real-world business experience. Our founder started his first business at 14 and has been starting, running, advising and turning around businesses ever since.",
      "Our consultants, researchers and idea specialists combine classical training with hands-on experience, which gives you the balance of both to increase your chances of success.",
      "Because we are small and modern, we are more attentive to your needs and concerns. We specialize in helping small businesses thrive, gain the knowledge needed for lasting success, and revitalize their missions. If your business is failing or about to fail, we can help.",
      "We look forward to assisting you. Thank you for considering The 7 Billion Dollar Brain Consulting Firm.",
    ].join("\n\n"),
  },
  "contact.intro": { label: "Contact: introduction", body: "Reach us by live chat, phone or email, or send a message below." },
  "investments.notice": {
    label: "Investments: members notice",
    body: "Our investment and Business in a Box opportunities will open to members here. Check back soon.",
  },
};
