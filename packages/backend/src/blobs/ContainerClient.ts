import { ContainerClient, StorageSharedKeyCredential } from "@azure/storage-blob";

export const storageAccountName = process.env["STORAGE_ACCOUNT_NAME"]!;
export const storageAccountKey = process.env["STORAGE_ACCOUNT_KEY"]!;
export const mediaContainerName = process.env["MEDIA_CONTAINER_NAME"]!;

if (!storageAccountName) {
  throw new Error("STORAGE_ACCOUNT_NAME environment variable is not set");
}

if (!storageAccountKey) {
  throw new Error("STORAGE_ACCOUNT_KEY environment variable is not set");
}

if (!mediaContainerName) {
  throw new Error("MEDIA_CONTAINER_NAME environment variable is not set");
}

export const sharedKeyCredential = new StorageSharedKeyCredential(storageAccountName, storageAccountKey);

export const containerClient = new ContainerClient(
  `https://${storageAccountName}.blob.core.windows.net/${mediaContainerName}`,
  sharedKeyCredential
);
