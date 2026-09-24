import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();
  const account = user ? (
    <>
      {user.role === "ADMIN" && <Link href="/admin" className="text-gold-400 hover:text-gold-300">Admin</Link>}
      <Link href="/members/library" className="hover:text-gold-300">Members</Link>
      <Link href="/account" className="btn-gold !px-4 !py-2">My account</Link>
    </>
  ) : (
    <>
      <Link href="/login" className="hover:text-gold-300">Log in</Link>
      <Link href="/signup" className="btn-gold !px-4 !py-2">Create account</Link>
    </>
  );

  return (
    <header className="bg-navy-900 text-white">
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex shrink-0 items-center" aria-label="The 7 Billion Dollar Brain, home">
          <Image src="/logo.png" alt="The 7 Billion Dollar Brain" width={144} height={80} priority className="h-12 w-auto" />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm font-bold lg:flex">
          {NAV.map((n) => <Link key={n.href} href={n.href} className="hover:text-gold-300">{n.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-4 text-sm font-bold lg:flex">
          <form action="/search" role="search" className="relative">
            <label htmlFor="site-search" className="sr-only">Search the site</label>
            <input id="site-search" name="q" type="search" placeholder="Search" className="w-36 rounded-md bg-navy-800 px-3 py-1.5 text-sm text-white placeholder:text-white/50 focus:w-48 focus:outline-none" />
          </form>
          {account}
        </div>
        <details className="relative lg:hidden">
          <summary className="cursor-pointer list-none rounded-md border border-white/30 px-3 py-2 text-sm font-bold">Menu</summary>
          <div className="absolute right-0 z-50 mt-2 w-64 space-y-3 rounded-lg bg-navy-800 p-4 text-sm font-bold shadow-xl">
            <form action="/search" role="search">
              <label htmlFor="site-search-m" className="sr-only">Search the site</label>
              <input id="site-search-m" name="q" type="search" placeholder="Search" className="w-full rounded-md bg-navy-900 px-3 py-2 text-white placeholder:text-white/50" />
            </form>
            {NAV.map((n) => <Link key={n.href} href={n.href} className="block hover:text-gold-300">{n.label}</Link>)}
            <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-3">{account}</div>
          </div>
        </details>
      </div>
    </header>
  );
}
