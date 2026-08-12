"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteAddress } from "@/lib/actions/address";
import { AddressForm } from "@/components/storefront/address-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
  type: "SHIPPING" | "BILLING";
};

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function handleSaved() {
    setIsAddOpen(false);
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this address?")) return;
    setPendingDeleteId(id);
    const result = await deleteAddress(id);
    setPendingDeleteId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger render={<Button />}>Add new address</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add address</DialogTitle>
          </DialogHeader>
          <AddressForm onSaved={handleSaved} />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <div key={address.id} className="border border-border bg-card p-4 text-sm sm:p-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <p className="font-medium break-words">{address.fullName}</p>
              {address.isDefault && <Badge variant="secondary">Default</Badge>}
            </div>
            <p className="break-words text-muted-foreground">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
            </p>
            <p className="text-muted-foreground">
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p className="text-muted-foreground">{address.phone}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Dialog
                open={editingId === address.id}
                onOpenChange={(open) => setEditingId(open ? address.id : null)}
              >
                <DialogTrigger render={<Button variant="outline" size="sm" />}>Edit</DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit address</DialogTitle>
                  </DialogHeader>
                  <AddressForm
                    addressId={address.id}
                    defaultValues={{
                      ...address,
                      line2: address.line2 ?? "",
                      landmark: address.landmark ?? "",
                    }}
                    onSaved={handleSaved}
                  />
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="sm"
                disabled={pendingDeleteId === address.id}
                onClick={() => handleDelete(address.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        {addresses.length === 0 && (
          <p className="text-muted-foreground">No saved addresses yet.</p>
        )}
      </div>
    </div>
  );
}
