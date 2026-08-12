export function LegalContent({
  title,
  updatedLabel,
  children,
}: {
  title: string;
  updatedLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p className="mb-2 text-xs tracking-[0.2em] text-muted-foreground uppercase">Aurelia</p>
      <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
      {updatedLabel && <p className="mt-2 text-sm text-muted-foreground">{updatedLabel}</p>}
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:text-sm [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
