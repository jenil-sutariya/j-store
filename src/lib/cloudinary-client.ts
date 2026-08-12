export type UploadedImage = {
  url: string;
  publicId: string;
};

async function uploadToCloudinary(file: File, resourceType: "image" | "raw"): Promise<UploadedImage> {
  const signatureResponse = await fetch("/api/uploads/cloudinary-signature", {
    method: "POST",
  });

  if (!signatureResponse.ok) {
    throw new Error("Could not get upload authorization.");
  }

  const { timestamp, signature, apiKey, cloudName, folder } = await signatureResponse.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorBody = await uploadResponse.json().catch(() => null);
    throw new Error(errorBody?.error?.message ?? "Upload failed.");
  }

  const result = await uploadResponse.json();
  return { url: result.secure_url as string, publicId: result.public_id as string };
}

export function uploadImageToCloudinary(file: File): Promise<UploadedImage> {
  return uploadToCloudinary(file, "image");
}

// .glb/.gltf files aren't images, so Cloudinary requires the "raw" resource
// type endpoint instead of "image" — same signed-upload flow otherwise.
export function uploadModelToCloudinary(file: File): Promise<UploadedImage> {
  return uploadToCloudinary(file, "raw");
}
