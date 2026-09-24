import Link from "next/link";
import { publicEnv } from "@/lib/env";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-navy-950 text-white/80">
      <div className="container-page grid gap-8 py-12 text-sm sm:grid-cols-3">
        <div>
          <p className="font-display text-lg text-white">The 7 Billion Dollar Brain</p>
          <p className="mt-2">Leveling the playing field for small businesses.</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-2">
          <Link href="/services" className="hover:text-gold-300">Services</Link>
          <Link href="/products" className="hover:text-gold-300">Products</Link>
          <Link href="/subscriptions" className="hover:text-gold-300">Subscriptions</Link>
          <Link href="/about" className="hover:text-gold-300">About us</Link>
          <Link href="/contact" className="hover:text-gold-300">Contact</Link>
          <Link href="/services/schedule" className="hover:text-gold-300">Schedule a session</Link>
        </nav>
        <div>
          <p className="font-bold text-white">Contact</p>
          <p className="mt-2"><a href={`mailto:${publicEnv.contactEmail}`} className="text-gold-400 hover:text-gold-300">{publicEnv.contactEmail}</a></p>
          {publicEnv.contactPhone && <p><a href={`tel:${publicEnv.contactPhone}`} className="hover:text-gold-300">{publicEnv.contactPhone}</a></p>}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} The 7 Billion Dollar Brain™. All rights reserved.
      </div>
    </footer>
  );
}
