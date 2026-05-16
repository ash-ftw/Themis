import { createHash } from "node:crypto";

import type { DocumentAccessLevel } from "@/lib/api";
import { completeDocumentUpload, presignDocumentUpload } from "@/lib/api";

const textExtractionLimit = 50_000;

export async function uploadCaseDocumentFile(
  authToken: string,
  caseId: string,
  formData: FormData
) {
  const file = formData.get("document");
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || mimeTypeFromName(file.name);
  const documentType = valueOf(formData, "document_type") ?? "evidence";
  const accessLevel = (valueOf(formData, "access_level") ??
    "case_private") as DocumentAccessLevel;
  const fileHash = createHash("sha256").update(bytes).digest("hex");
  const uploadMetadata = {
    access_level: accessLevel,
    case_id: caseId,
    document_type: documentType,
    file_hash: fileHash,
    file_size: file.size,
    metadata: {},
    mime_type: mimeType,
    original_file_name: file.name
  };
  const presigned = await presignDocumentUpload(authToken, uploadMetadata);
  const uploadResponse = await fetch(presigned.upload_url, {
    body: new Blob([bytes], { type: mimeType }),
    headers: presigned.headers,
    method: presigned.method
  });

  if (!uploadResponse.ok) {
    throw new Error("The document could not be stored.");
  }

  const extractedText = mimeType.startsWith("text/")
    ? bytes.toString("utf8").slice(0, textExtractionLimit)
    : undefined;

  return completeDocumentUpload(authToken, {
    ...uploadMetadata,
    extracted_text: extractedText,
    object_key: presigned.object_key
  });
}

function valueOf(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || undefined;
}

function mimeTypeFromName(fileName: string) {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".pdf")) {
    return "application/pdf";
  }
  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (lowerName.endsWith(".png")) {
    return "image/png";
  }
  if (lowerName.endsWith(".webp")) {
    return "image/webp";
  }
  if (lowerName.endsWith(".doc")) {
    return "application/msword";
  }
  if (lowerName.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (lowerName.endsWith(".txt")) {
    return "text/plain";
  }
  return "application/octet-stream";
}
