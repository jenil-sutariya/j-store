import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ContentPage() {
  const blocks = await prisma.siteContent.findMany({ orderBy: { section: "asc" } });

  const sections = Array.from(new Set(blocks.map((block) => block.section)));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Site content</h1>

      {sections.map((section) => (
        <div key={section} className="space-y-4">
          <h2 className="text-lg font-semibold">{section}</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Block</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks
                .filter((block) => block.section === section)
                .map((block) => (
                  <TableRow key={block.key}>
                    <TableCell>{block.label}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        render={<Link href={`/admin/content/${block.key}`} />}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ))}

      {blocks.length === 0 && <p className="text-muted-foreground">No content blocks yet.</p>}
    </div>
  );
}
