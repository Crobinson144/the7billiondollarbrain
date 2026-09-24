import Link from "next/link";
import type { Metadata } from "next";
import { Bullets, ContactDetails, LegalPage, Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy",
  description: "How refunds and cancellations work for The 7 Billion Dollar Brain's guides, packages, add-ons and subscriptions.",
};

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund and Cancellation Policy"
      intro={<p>We want you to be glad you worked with us. This policy explains when you can get your money back and how to cancel. It&apos;s part of our <Link href="/terms" className="underline">Terms of Service</Link>.</p>}
    >
      <Section title="1. eBooks and video tutorials">
        <Bullets items={[
          "If you haven't opened or downloaded a guide or video, you can ask for a full refund within 7 days of buying it.",
          "Once you've opened or downloaded it, the sale is final, because digital content can't be returned.",
          "We'll always fix or refund a guide or video that doesn't work or that you were charged for twice.",
        ]} />
      </Section>

      <Section title="2. Service packages">
        <Bullets items={[
          <><strong>Before we start work:</strong> full refund if you cancel.</>,
          <><strong>After we start:</strong> we refund the price of the parts of the package we haven&apos;t delivered yet. Work already delivered (for example, completed consulting months, a finished website outline or completed setup steps) isn&apos;t refundable.</>,
          <><strong>Third-party costs</strong> we paid on your behalf with your approval (such as government filing fees, domain registrations or other providers&apos; subscriptions) aren&apos;t refundable once paid.</>,
        ]} />
      </Section>

      <Section title="3. Installment plans">
        <p>If you&apos;re paying for a package in monthly installments and want to stop, contact us. We&apos;ll stop the remaining payments and work out what&apos;s owed using section 2: if you&apos;ve paid more than the value of what we&apos;ve delivered, we&apos;ll refund the difference; if you&apos;ve paid less, the remaining amount for delivered work is still owed. Installments never cost more than paying in full.</p>
      </Section>

      <Section title="4. Add-ons and quoted work">
        <Bullets items={[
          "Add-ons (such as a logo or name change) are refundable in full before we begin, and not after the work has been delivered to you.",
          "Quoted work follows the refund terms written in your quote.",
        ]} />
      </Section>

      <Section title="5. Consulting subscriptions (fixed terms)">
        <p>You can cancel the remaining payments of a 3-, 6- or 12-month consulting plan at any time from <Link href="/account" className="underline">My account</Link> → Manage billing. Cancellation takes effect at the end of the month you&apos;ve paid for; you can keep booking consultations until then. We don&apos;t refund partial months. The plan ends on its own after the last payment and never renews.</p>
      </Section>

      <Section title="6. Education Pass (monthly, renews automatically)">
        <p>Cancel anytime online from My account → Manage billing. You keep library access until the end of the month you&apos;ve paid for, and you won&apos;t be charged again. We don&apos;t refund partial months, but if you were charged for a renewal you didn&apos;t intend and haven&apos;t used the library since, contact us within 7 days and we&apos;ll refund that charge.</p>
      </Section>

      <Section title="7. Free consultation and free guides">
        <p>The free 30-minute consultation and free guides cost nothing, so there&apos;s nothing to refund.</p>
      </Section>

      <Section title="8. How to ask for a refund">
        <Bullets items={[
          "Email us (details below) with your name, the email on your account and what you bought.",
          "We'll reply within 3 business days. Approved refunds go back to your original payment method, usually within 5 to 10 business days depending on your bank.",
          "If you see a charge you don't recognize or a double charge, please contact us before disputing it with your bank. We'll sort it out quickly.",
        ]} />
      </Section>

      <Section title="9. Your legal rights">
        <p>This policy doesn&apos;t limit any refund or cancellation rights you have under the law.</p>
      </Section>

      <Section title="10. Contact us">
        <ContactDetails />
      </Section>
    </LegalPage>
  );
}
