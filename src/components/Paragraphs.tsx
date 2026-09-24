/** Renders plain text with blank-line paragraph breaks (copy edited in the admin panel). */
export function Paragraphs({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={`space-y-4 leading-relaxed ${className}`}>
      {parts.map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}
