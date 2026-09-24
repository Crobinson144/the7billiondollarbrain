import Link from "next/link";
import Image from "next/image";
import { getContent } from "@/lib/content";
import { getCurrentUser } from "@/lib/auth";
import { publishedPlans, publishedServices } from "@/lib/queries/catalog";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [copy, user, services, plans] = await Promise.all([
    getContent(["home.tagline", "home.intro"]),
    getCurrentUser(),
    publishedServices(),
    publishedPlans(),
  ]);
  const featured = services.slice(0, 6);
  const pass = plans.find((p) => p.slug === "education-pass");

  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="container-page grid items-center gap-10 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div className="min-w-0">
            <p className="eyebrow">Business services</p>
            <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">{copy["home.tagline"]}</h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">{copy["home.intro"]}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services/schedule" className="btn-gold">Book a free 30-minute consultation</Link>
              {user ? (
                <Link href="/account" className="btn border border-white/40 text-white hover:bg-white hover:text-navy-900">Go to my account</Link>
              ) : (
                <>
                  <Link href="/signup" className="btn border border-white/40 text-white hover:bg-white hover:text-navy-900">Create an account</Link>
                  <Link href="/login" className="btn text-white underline-offset-4 hover:underline">Log in</Link>
                </>
              )}
            </div>
          </div>
          <div className="flex min-w-0 justify-center">
            <Image src="/logo.png" alt="" width={484} height={270} className="h-auto w-full max-w-xs sm:max-w-md" priority />
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">What we do</p>
            <h2 className="section-title mt-2">Services for every stage of your business</h2>
          </div>
          <Link href="/services" className="btn-outline">All services</Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((s) => (
            <Link key={s.id} href={`/services#${s.slug}`} className="card transition hover:border-gold-400">
              <h3 className="text-xl text-navy-900">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <div className="card bg-paper">
            <p className="eyebrow">Do it yourself</p>
            <h2 className="mt-2 text-2xl text-navy-900">Guides and video tutorials</h2>
            <p className="mt-2 text-muted">Practical eBooks and tutorials: a cost-effective way to answer many of your business questions yourself.</p>
            <Link href="/products" className="btn-navy mt-5">Browse products</Link>
          </div>
          <div className="card bg-paper">
            <p className="eyebrow">Ongoing support</p>
            <h2 className="mt-2 text-2xl text-navy-900">Monthly subscriptions</h2>
            <p className="mt-2 text-muted">
              Unlimited monthly consultation plans{pass ? `, and the Education Pass for ${formatCents(pass.monthlyPriceCents)} a month` : ""}.
            </p>
            <Link href="/subscriptions" className="btn-navy mt-5">See plans</Link>
          </div>
        </div>
      </section>
    </>
  );
}
