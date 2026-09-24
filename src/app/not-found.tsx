import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page max-w-xl py-24 text-center">
      <h1 className="section-title">Page not found</h1>
      <p className="mt-3 text-muted">That page doesn&apos;t exist or has moved.</p>
      <Link href="/" className="btn-gold mt-8">Back to home</Link>
    </div>
  );
}
