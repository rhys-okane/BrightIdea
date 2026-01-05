import type { HonoApp } from "@src/App";
import { adminRequired } from "@src/middleware/AdminRequired";
import { getDesign } from "@src/middleware/GetDesign";

import { BlobSASPermissions, generateBlobSASQueryParameters } from "@azure/storage-blob";
import { ulid } from "ulid";
import { mediaContainerName, sharedKeyCredential, storageAccountName } from "@src/blobs/ContainerClient";

export function listenForGETMediaUploadUrl(honoApp: HonoApp) {
  honoApp.get("/designs/:id/media-upload-url", adminRequired, getDesign, async (context) => {
    const expiresOn = new Date(new Date().getTime() + 15 * 60 * 1000); // 15 minutes from now
    const permissions = BlobSASPermissions.parse("cw"); // Create and write permissions

    const contentType = context.req.query("contentType");
    if (!contentType) {
      return context.json({ message: "contentType query parameter is required" }, 400);
    }

    if (contentType !== "video/mp4" && contentType !== "video/mov" && contentType !== "video/avi") {
      return context.json({ message: "Unsupported content type" }, 400);
    }

    const fileExtension = contentType.split("/")[1];

    const designId = context.req.param("id");
    const fileName = `${ulid()}.${fileExtension}`;
    const blobName = `${designId}/${fileName}`;
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: mediaContainerName,
        blobName,
        permissions: permissions,
        expiresOn: expiresOn,
        contentType,
      },
      sharedKeyCredential
    ).toString();

    const uploadUrl = `https://${storageAccountName}.blob.core.windows.net/${mediaContainerName}/${blobName}?${sasToken}`;

    return context.json({ uploadUrl, fileName });
  });
}
