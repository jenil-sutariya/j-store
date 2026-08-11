export function ViewerPlaceholder({ reason }: { reason: "no-model" | "unsupported" | "error" }) {
  const messages: Record<typeof reason, { title: string; detail: string }> = {
    "no-model": {
      title: "3D preview not available yet",
      detail: "No 3D model has been added for this product.",
    },
    unsupported: {
      title: "3D preview unavailable on this device",
      detail: "Showing product photos instead.",
    },
    error: {
      title: "3D preview couldn't load",
      detail: "Showing product photos instead.",
    },
  };

  const { title, detail } = messages[reason];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/40 p-8 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
