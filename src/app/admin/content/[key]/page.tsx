import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContentBlockForm } from "@/components/admin/content-block-form";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const block = await prisma.siteContent.findUnique({ where: { key } });

  if (!block) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{block.label}</h1>
      <ContentBlockForm
        contentKey={block.key}
        defaultValues={{
          title: block.title ?? "",
          tagline: block.tagline ?? "",
          body: block.body ?? "",
          imageUrl: block.imageUrl ?? "",
          imagePublicId: block.imagePublicId ?? "",
          linkLabel: block.linkLabel ?? "",
          linkHref: block.linkHref ?? "",
        }}
      />
    </div>
  );
}
