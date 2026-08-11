import Link from "next/link";
import { getAllCollections } from "@/lib/queries/collection";
import { deleteCollection } from "@/lib/actions/collection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function CollectionsPage() {
  const collections = await getAllCollections();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Collections</h1>
        <Button render={<Link href="/admin/collections/new" />}>New collection</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.map((collection) => (
            <TableRow key={collection.id}>
              <TableCell>
                {collection.name}
                {collection.isFeatured && (
                  <Badge variant="secondary" className="ml-2">
                    Featured
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{collection.slug}</TableCell>
              <TableCell>{collection._count.products}</TableCell>
              <TableCell>
                <Badge variant={collection.isActive ? "default" : "secondary"}>
                  {collection.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href={`/admin/collections/${collection.id}`} />}
                >
                  Edit
                </Button>
                <DeleteButton onDelete={deleteCollection.bind(null, collection.id)} />
              </TableCell>
            </TableRow>
          ))}
          {collections.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No collections yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
