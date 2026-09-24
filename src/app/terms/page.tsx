import Link from "next/link";
import type { Metadata } from "next";
import { Bullets, ContactDetails, LegalPage, Section, governingLawText, venueText } from "@/components/LegalPage";
import { business } from "@/lib/env";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use the7billiondollarbrain.com, create an account, or buy our services, guides and subscriptions.",
};

export default function TermsPage() {
  const us = business.legalName;
  return (
    <LegalPage
      title="Terms of Service"
      intro={<p>These Terms are an agreement between you and {us} (&ldquo;we&rdquo;, &ldquo;us&rdquo;). They apply when you use this website, create an account, book a session, or buy anything from us. Please read them together with our <Link href="/privacy" className="underline">Privacy Policy</Link> and <Link href="/refunds" className="underline">Refund and Cancellation Policy</Link>, which are part of these Terms.</p>}
    >
      <Section title="1. Agreeing to these Terms">
        <p>You accept these Terms when you tick the box to agree while creating an account or checking out. If you don&apos;t agree, please don&apos;t use the site or buy from us. You must be at least 18 years old and able to enter a binding contract. If you use the site for a business, you confirm you&apos;re authorized to accept these Terms for it.</p>
      </Section>

      <Section title="2. What we offer">
        <p>We provide business consulting and support services (including start-up support, business planning, market research, idea development, business turnaround and human-resources services), educational eBooks and video tutorials, service packages, add-ons, and monthly subscriptions. Descriptions and prices on the site are part of the offer. We may change, add or discontinue offerings, but changes won&apos;t affect anything you&apos;ve already paid for.</p>
      </Section>

      <Section title="3. Your account">
        <Bullets items={[
          "Give accurate information and keep it current, including your email address.",
          "Keep your password private. You're responsible for activity on your account; tell us right away if you think someone else has used it.",
          "We may ask you to confirm your email address before you can check out.",
          "Basic membership is free. Premium membership comes with an active subscription that includes it, and ends when that subscription ends.",
        ]} />
      </Section>

      <Section title="4. Prices, payment and taxes">
        <Bullets items={[
          "Prices are in U.S. dollars and are the prices shown at checkout. We may correct obvious pricing errors and will offer you a refund if we can't honor an order.",
          "Payments are processed by Stripe. We never see or store your full card number.",
          "You're responsible for any taxes that apply to your purchase, which we'll show at checkout where required.",
          "If a payment fails, we may pause access or services until it's resolved.",
        ]} />
      </Section>

      <Section id="installments" title="5. Installment plans for packages">
        <p>Some packages can be paid in 3, 6 or 9 monthly installments. Choosing installments doesn&apos;t change the total price, and we don&apos;t charge interest or fees for it. The first payment is taken at checkout and the rest on the same day in each following month, and billing stops automatically after the last payment. If you stop paying, we may pause work on the package. Cancelling the remaining payments doesn&apos;t cancel what you owe for work already delivered, as explained in our <Link href="/refunds" className="underline">Refund and Cancellation Policy</Link>.</p>
      </Section>

      <Section id="subscriptions" title="6. Subscriptions">
        <p><strong>Fixed-term consulting plans</strong> (for example, 3, 6 or 12 months) bill the monthly price shown, starting at checkout, for the stated number of months. They end automatically after the last payment and do not renew.</p>
        <p><strong>The Education Pass</strong> bills the monthly price shown, starting at checkout, and <strong>renews automatically every month until you cancel</strong>. Before you subscribe we show the price and renewal terms and ask you to agree to them separately.</p>
        <p><strong>Cancelling:</strong> you can cancel any subscription online at any time from <Link href="/account" className="underline">My account</Link> → Manage billing. Cancellation takes effect at the end of the month you&apos;ve already paid for, and you keep access until then. We don&apos;t refund partial months except as our Refund and Cancellation Policy says. We&apos;ll email you a confirmation when you subscribe and when you cancel.</p>
        <p><strong>Price changes:</strong> we&apos;ll give you at least 30 days&apos; notice by email before changing the price of a subscription you already have, so you can cancel first.</p>
        <p id="fair-use"><strong>&ldquo;Unlimited&rdquo; consultation:</strong> unlimited consultation plans cover as many consulting sessions as you need for your own business during the plan, booked through our scheduling page in our business hours (Monday to Friday, 9 AM to 7 PM Eastern) and subject to availability. They don&apos;t cover work for other businesses, reselling our advice, or services we sell separately (such as packages, add-ons and quoted work).</p>
      </Section>

      <Section title="7. Bookings and consultations">
        <p>Session times are Monday to Friday, 9 AM to 7 PM Eastern, and are confirmed by us. The first 30-minute consultation is free. Please give us at least 24 hours&apos; notice if you need to reschedule. We may reschedule a session if something unavoidable comes up and will offer you another time.</p>
      </Section>

      <Section title="8. Digital content license">
        <p>When you buy an eBook or video, or open one through the Education Pass or a free account, we give you a personal, non-exclusive, non-transferable license to use it for your own business education. You may not copy, share, resell, publicly post or distribute it, share your login, or remove copyright notices. Education Pass access to the library ends when the Pass ends; content you bought individually stays available to you while we operate the library.</p>
      </Section>

      <Section title="9. No guarantee of results; not professional advice">
        <Bullets items={[
          "We give our honest, experienced guidance, but business outcomes depend on many things outside our control. We do not guarantee any particular result, including revenue, profit, funding, loan approval, credit scores or business survival.",
          "Our services and content are for general business guidance and education. They are not legal, tax, accounting, investment or financial advice, and we are not your lawyer or accountant. For those matters, consult a licensed professional.",
          "Any examples or client stories on the site describe individual experiences and aren't a promise that you'll get the same results.",
        ]} />
      </Section>

      <Section id="credit" title="10. Business credit services">
        <p>Any service that helps you build business credit is provided under a separate written agreement that sets out exactly what we&apos;ll do, the price, the timeline and your cancellation rights, and that agreement controls if it conflicts with these Terms. We don&apos;t sell or rent credit accounts (&ldquo;tradelines&rdquo;), we don&apos;t offer credit privacy numbers (CPNs) or any &ldquo;new credit identity,&rdquo; we don&apos;t promise any credit score or approval, and we don&apos;t report your payments to credit bureaus unless a separate agreement says we do. Lenders, vendors and credit bureaus make their own decisions.</p>
      </Section>

      <Section title="11. Acceptable use">
        <p>Don&apos;t use the site to break the law, infringe anyone&apos;s rights, send spam, upload malware, try to access accounts or systems that aren&apos;t yours, overload or scrape the site, or give false information in a booking, contact form or chat.</p>
      </Section>

      <Section title="12. Your content and feedback">
        <p>You keep ownership of what you send us (such as booking details, messages and business information). You give us permission to use it to provide our services and run the site, as described in our <Link href="/privacy" className="underline">Privacy Policy</Link>. If you send suggestions about our services, we may use them without owing you anything.</p>
      </Section>

      <Section title="13. Our intellectual property">
        <p>The site, our name and logo, and our guides, videos, templates and other materials belong to us or our licensors and are protected by copyright and trademark law. Except for the license in section 8, these Terms don&apos;t give you any rights in them.</p>
      </Section>

      <Section title="14. Third-party services">
        <p>We use trusted providers to run parts of the site, including Stripe (payments), Google (calendar), our email and live-chat providers, and our hosting providers. Their services are subject to their own terms. Links to other websites are for convenience; we aren&apos;t responsible for their content.</p>
      </Section>

      <Section title="15. Disclaimers">
        <p>We provide our services with reasonable care and skill. Otherwise, to the fullest extent the law allows, the site and our content are provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; and we disclaim all other warranties, express or implied, including merchantability, fitness for a particular purpose and non-infringement. We don&apos;t promise that the site will always be available or error-free.</p>
      </Section>

      <Section title="16. Limitation of liability">
        <p>To the fullest extent the law allows: (a) we won&apos;t be liable for indirect, incidental, special, consequential or punitive damages, or for lost profits, revenue, data or business opportunities; and (b) our total liability for any claim relating to the site or our services is limited to the amount you paid us in the 12 months before the claim arose. Some jurisdictions don&apos;t allow these limits, so they may not all apply to you. Nothing in these Terms limits liability that can&apos;t legally be limited.</p>
      </Section>

      <Section title="17. Indemnity">
        <p>If someone brings a claim against us because you broke these Terms or the law, or misused the site, you agree to cover our reasonable losses and costs from that claim, to the extent the law allows.</p>
      </Section>

      <Section title="18. Suspension and termination">
        <p>You can close your account at any time by contacting us. We may suspend or close an account that breaks these Terms, is used for fraud, or puts other users or the site at risk. If we close your account without cause, we&apos;ll refund any prepaid amounts for services we haven&apos;t delivered. Sections that by their nature should survive (such as 8, 9, 13, 15, 16, 17 and 19) survive termination.</p>
      </Section>

      <Section title="19. Disputes and governing law">
        <p>If you have a problem, please contact us first; most issues can be solved quickly. If we can&apos;t resolve it informally within 30 days, either of us may bring a claim in small claims court if it qualifies. {venueText()}</p>
        <p>{governingLawText()}</p>
      </Section>

      <Section title="20. Copyright complaints">
        <p>If you believe material on the site infringes your copyright, email us with a description of the work, where it appears on the site, your contact details, and a statement that you have a good-faith belief the use isn&apos;t authorized. We&apos;ll review it and remove infringing material.</p>
      </Section>

      <Section title="21. Changes to these Terms">
        <p>We may update these Terms. We&apos;ll post the new version with a new effective date, and for material changes we&apos;ll email account holders or ask you to accept them again. Changes don&apos;t apply to purchases made before they take effect.</p>
      </Section>

      <Section title="22. General">
        <p>These Terms, together with the policies they mention and any separate written service agreement, are the whole agreement between us about their subject. If a court finds part of them unenforceable, the rest still applies. If we don&apos;t enforce a right right away, we haven&apos;t given it up. You may not transfer your rights under these Terms without our consent.</p>
      </Section>

      <Section title="23. Contact us">
        <ContactDetails />
      </Section>
    </LegalPage>
  );
}
