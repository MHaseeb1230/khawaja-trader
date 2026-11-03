export function InfoPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-gray-900">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">{children}</div>
    </article>
  );
}
