// lib/uploadToCloudinary.ts
import { api } from "@/lib/api"; // your Axios/Fetch wrapper to backend

type UploadResp = { url: string; id: string };

export async function uploadToCloudinary(file: File, folder?: string): Promise<UploadResp> {
  // signed upload: get signature from your backend
  const { data: sign } = await api.post("/cloudinary/sign", { folder });

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  if (folder) form.append("folder", folder);
  form.append("signature", sign.signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`;
  const res = await fetch(endpoint, { method: "POST", body: form });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return { url: data.secure_url as string, id: data.public_id as string };
}
