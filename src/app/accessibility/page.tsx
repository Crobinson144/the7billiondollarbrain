import type { Metadata } from "next";
import { ContactDetails, LegalPage, Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Our commitment to making the7billiondollarbrain.com usable by everyone, and how to get help.",
};

export default function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility statement" intro={<p>We want everyone to be able to use our website, including people who use screen readers, keyboard navigation, magnification or other assistive technology.</p>}>
      <Section title="What we do">
        <p>We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1, level AA. The site uses clear headings, labeled form fields, text alternatives for images, visible keyboard focus, a &ldquo;skip to content&rdquo; link, sufficient color contrast and layouts that work on phones and when zoomed.</p>
      </Section>
      <Section title="Known limitations">
        <p>Some third-party features, such as the live-chat window and Stripe&apos;s checkout page, are provided by other companies, and we can&apos;t fully control how accessible they are. If one of them doesn&apos;t work for you, contact us another way and we&apos;ll help.</p>
      </Section>
      <Section title="Need help or found a problem?">
        <p>If anything on the site is hard to use, tell us what page and what happened. We&apos;ll help you get what you need another way (for example, by phone or email) and work to fix it.</p>
        <ContactDetails />
      </Section>
    </LegalPage>
  );
}
