import { getStoreSettings } from "@/lib/queries/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <SettingsForm
        defaultValues={{
          storeName: settings.storeName,
          tagline: settings.tagline ?? "",
          logoUrl: settings.logoUrl ?? "",
          logoPublicId: settings.logoPublicId ?? "",
          legalEntityName: settings.legalEntityName ?? "",
          gstin: settings.gstin ?? "",
          registeredAddress: settings.registeredAddress ?? "",
          supportEmail: settings.supportEmail ?? "",
          supportPhone: settings.supportPhone ?? "",
          instagramUrl: settings.instagramUrl ?? "",
          facebookUrl: settings.facebookUrl ?? "",
          shippingFlatFee: settings.shippingFlatFee,
          freeShippingThreshold: settings.freeShippingThreshold,
        }}
      />
    </div>
  );
}
