import { CollectionForm } from "@/components/admin/collection-form";

export default function NewCollectionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New collection</h1>
      <CollectionForm />
    </div>
  );
}
