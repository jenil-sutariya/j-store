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
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {updatedLabel && <p className="mt-1 text-sm text-muted-foreground">{updatedLabel}</p>}
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:text-sm [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
