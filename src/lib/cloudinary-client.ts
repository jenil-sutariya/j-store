export type UploadedImage = {
  url: string;
  publicId: string;
};

export async function uploadImageToCloudinary(file: File): Promise<UploadedImage> {
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

  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorBody = await uploadResponse.json().catch(() => null);
    throw new Error(errorBody?.error?.message ?? "Image upload failed.");
  }

  const result = await uploadResponse.json();
  return { url: result.secure_url as string, publicId: result.public_id as string };
}
