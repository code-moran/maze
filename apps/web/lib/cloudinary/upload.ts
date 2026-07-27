export async function uploadToCloudinary(
  file: File,
  folder: string = "maze"
): Promise<string> {
  const sigRes = await fetch("/api/admin/cloudinary-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });

  if (!sigRes.ok) {
    throw new Error("Failed to authenticate image upload signature.");
  }

  const sigData = await sigRes.json();
  if (!sigData.ok || !sigData.cloudName) {
    throw new Error(sigData.error || "Invalid Cloudinary configuration.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", sigData.uploadPreset || "public");
  formData.append("folder", sigData.folder || folder);

  if (sigData.signature && sigData.apiKey && sigData.timestamp) {
    formData.append("api_key", sigData.apiKey);
    formData.append("timestamp", String(sigData.timestamp));
    formData.append("signature", sigData.signature);
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const errorJson = await uploadRes.json().catch(() => ({}));
    throw new Error(
      errorJson.error?.message || "Failed to upload image to Cloudinary."
    );
  }

  const uploadJson = await uploadRes.json();
  if (!uploadJson.secure_url) {
    throw new Error("Cloudinary response did not return a valid secure URL.");
  }

  return uploadJson.secure_url;
}

export async function uploadMultipleToCloudinary(
  files: FileList | File[],
  folder: string = "maze/products"
): Promise<string[]> {
  const fileArray = Array.from(files);
  const urls: string[] = [];

  for (const file of fileArray) {
    const url = await uploadToCloudinary(file, folder);
    urls.push(url);
  }

  return urls;
}
