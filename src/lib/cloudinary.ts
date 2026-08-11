import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UPLOAD_FOLDER = "jewellry-shop";

export function createUploadSignature(paramsToSign: Record<string, string | number>) {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { ...paramsToSign, timestamp, folder: UPLOAD_FOLDER },
    process.env.CLOUDINARY_API_SECRET as string,
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: UPLOAD_FOLDER,
  };
}

export async function deleteCloudinaryAsset(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
