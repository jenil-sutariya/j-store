import { prisma } from "@/lib/prisma";

export type SiteContentBlock = {
  key: string;
  title: string | null;
  tagline: string | null;
  body: string | null;
  imageUrl: string | null;
  linkLabel: string | null;
  linkHref: string | null;
};

export async function getSiteContent(key: string): Promise<SiteContentBlock | null> {
  const block = await prisma.siteContent.findUnique({ where: { key } });
  if (!block) return null;

  return {
    key: block.key,
    title: block.title,
    tagline: block.tagline,
    body: block.body,
    imageUrl: block.imageUrl,
    linkLabel: block.linkLabel,
    linkHref: block.linkHref,
  };
}

export async function getSiteContentMap(keys: string[]): Promise<Record<string, SiteContentBlock>> {
  const blocks = await prisma.siteContent.findMany({ where: { key: { in: keys } } });
  return Object.fromEntries(
    blocks.map((block) => [
      block.key,
      {
        key: block.key,
        title: block.title,
        tagline: block.tagline,
        body: block.body,
        imageUrl: block.imageUrl,
        linkLabel: block.linkLabel,
        linkHref: block.linkHref,
      },
    ]),
  );
}
