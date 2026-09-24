import Link from "next/link";
import type { Metadata } from "next";
import { Bullets, ContactDetails, LegalPage, Section } from "@/components/LegalPage";
import { business } from "@/lib/env";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What personal information The 7 Billion Dollar Brain collects, why, who we share it with, and your choices.",
};

export default function PrivacyPage() {
  const us = business.legalName;
  return (
    <LegalPage
      title="Privacy Policy"
      intro={<p>This policy explains what personal information {us} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects when you use the7billiondollarbrain.com, how we use it, who we share it with, and the choices you have. <strong>We don&apos;t sell your personal information, and we don&apos;t use it for advertising.</strong></p>}
    >
      <Section title="1. Information we collect">
        <p><strong>Information you give us:</strong></p>
        <Bullets items={[
          <><strong>Account:</strong> your name, email address, optional phone number, and your password. We store only a scrambled (hashed) version of your password, never the password itself.</>,
          <><strong>Bookings:</strong> your name, address, phone number, email address, the service you want, your question or request, and the time you choose.</>,
          <><strong>Messages:</strong> what you send through our contact form, live chat or email.</>,
          <><strong>Purchases:</strong> what you bought, the amount, the date and your payment status. Card details are entered on Stripe&apos;s secure checkout page; we never see or store your full card number.</>,
          <><strong>Agreements:</strong> a record of when you accepted our Terms or subscription renewal terms, with the version accepted.</>,
        ]} />
        <p><strong>Information collected automatically:</strong></p>
        <Bullets items={[
          <><strong>A login cookie</strong> (<code>bdb_session</code>) that keeps you signed in for up to 30 days. It&apos;s strictly necessary for your account to work and isn&apos;t used for tracking.</>,
          <><strong>Your shopping cart</strong>, which is saved in your own browser (not on our servers) until you check out or clear it.</>,
          <><strong>Your IP address and browser details</strong>, which we use briefly to prevent abuse (for example, limiting repeated login attempts) and which our hosting providers log for security and reliability.</>,
        ]} />
        <p>We don&apos;t use analytics or advertising cookies, and we don&apos;t buy personal information about you from other companies.</p>
      </Section>

      <Section title="2. How we use it">
        <Bullets items={[
          "To create and run your account and give you access to what you've bought or subscribed to.",
          "To schedule, confirm and hold consultations, and to add them to our business calendar.",
          "To process payments, subscriptions and refunds, and to keep required business and tax records.",
          "To answer your questions and provide the services you ask for.",
          "To send service emails, such as email confirmations, password resets, receipts, subscription confirmations and required reminders.",
          "To keep the site secure, prevent fraud and abuse, and fix problems.",
          "To comply with the law and enforce our Terms.",
        ]} />
        <p>If we ever send marketing emails, we&apos;ll only do so in line with the law, and every one will include an unsubscribe link that we honor promptly.</p>
      </Section>

      <Section title="3. Who we share it with">
        <p>We share personal information only with service providers that help us run the business, under contracts that let them use it only to provide their services to us:</p>
        <Bullets items={[
          <><strong>Stripe</strong>: payments, subscriptions and the billing portal.</>,
          <><strong>Vercel</strong>: website hosting.</>,
          <><strong>Supabase</strong>: our database, hosted in the United States.</>,
          <><strong>Google</strong>: our business calendar, for bookings.</>,
          <><strong>Our email provider</strong>: to deliver the emails described above.</>,
          <><strong>Our live-chat provider</strong>: to deliver chat messages, if you use the chat. The chat widget may set its own cookies to keep your conversation going; see that provider&apos;s privacy policy.</>,
        ]} />
        <p>We may also disclose information if the law requires it, to protect rights, safety and property, or as part of a merger or sale of the business (in which case this policy would continue to apply to your information). We don&apos;t share your information with credit bureaus.</p>
      </Section>

      <Section title="4. How long we keep it">
        <Bullets items={[
          "Account information: while your account is open. If you ask us to delete your account, we'll delete or anonymize it within 30 days, except records we must keep.",
          "Purchase, payment and tax records: 7 years, as tax and accounting rules require.",
          "Records of what you agreed to: at least 3 years, or longer if the law requires.",
          "Bookings and messages: up to 3 years after your last contact with us, so we can follow up on your business.",
          "Login sessions: until they expire (30 days) or you log out. Abuse-prevention records: about a day.",
        ]} />
      </Section>

      <Section title="5. How we protect it">
        <p>We use encrypted connections (HTTPS) everywhere, store passwords only as strong one-way hashes, keep only scrambled versions of login and email-link tokens, limit repeated login attempts, restrict database access, and let a payment specialist (Stripe) handle card data. No system is perfectly secure, so please use a strong, unique password and tell us if you suspect a problem.</p>
      </Section>

      <Section title="6. Your choices and rights">
        <Bullets items={[
          <>You can see and update your details in <Link href="/account" className="underline">My account</Link>, and manage payments and subscriptions from Manage billing.</>,
          "You can ask us for a copy of your personal information, to correct it, or to delete it. We'll respond within 30 days. We may need to confirm your identity first, and we may keep information the law requires us to keep.",
          "You can unsubscribe from any marketing email using the link in it. We'll still send service emails about your account and purchases.",
        ]} />
        <p>Depending on where you live, you may have additional privacy rights under state law. Contact us to use them; we won&apos;t treat you differently for doing so.</p>
      </Section>

      <Section title="7. Do Not Track and other sites">
        <p>We don&apos;t track you across other websites, and we don&apos;t allow other companies to collect information about your browsing on our site for advertising. Because we don&apos;t do that kind of tracking, our site doesn&apos;t change its behavior in response to browser &ldquo;Do Not Track&rdquo; signals.</p>
      </Section>

      <Section title="8. Children">
        <p>Our site is for adults running or starting businesses. It isn&apos;t directed to children under 13, and you must be 18 or older to create an account. If we learn that we&apos;ve collected information from a child under 13, we&apos;ll delete it.</p>
      </Section>

      <Section title="9. California residents">
        <p>This policy is intended to meet the California Online Privacy Protection Act. You can review and update your account information as described in section 6, and we announce changes as described in section 10.</p>
      </Section>

      <Section title="10. Changes to this policy">
        <p>If we change this policy, we&apos;ll post the new version here with a new effective date. If the changes are significant, we&apos;ll also email account holders or show a notice on the site before they take effect.</p>
      </Section>

      <Section title="11. Contact us">
        <p>Questions or privacy requests:</p>
        <ContactDetails />
      </Section>
    </LegalPage>
  );
}
