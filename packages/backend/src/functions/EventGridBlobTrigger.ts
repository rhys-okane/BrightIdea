import "@azure/functions-extensions-blob"; // This is the mandatory first import for SDK binding
import { app, InvocationContext } from "@azure/functions";
import type { StorageBlobClient } from "@azure/functions-extensions-blob";
import { getDesignByIdQuery } from "@src/database/queries/GetDesignById";
import { updateDesignQuery } from "@src/database/queries/UpdateDesign";

const mediaBlobContainerName = process.env.MEDIA_CONTAINER_NAME;

if (!mediaBlobContainerName) {
  throw new Error("MEDIA_CONTAINER_NAME environment variable is not set");
}

app.setup({
  enableHttpStream: true,
});

app.storageBlob("EventGridBlobTrigger", {
  sdkBinding: true,
  path: `${mediaBlobContainerName}/{designId}/{fileName}`,
  connection: "AzureWebJobsMediaContainer",
  source: "EventGrid",
  // @ts-expect-error Bad types from the Azure library
  handler: storageBlobTrigger,
});

export async function storageBlobTrigger(blob: StorageBlobClient, context: InvocationContext): Promise<void> {
  if (!context.triggerMetadata?.fileName || !context.triggerMetadata?.designId) {
    context.error("Missing trigger metadata: fileName or designId");
    return;
  }
  const designId = context.triggerMetadata?.designId as string;
  context.log(`Media uploaded for design ID: ${designId}`);
  const [fileName, extension] = (context.triggerMetadata.fileName as string).split(".");
  context.log("Uploaded file name:", fileName);
  context.log("Uploaded file extension:", extension);

  const design = await getDesignByIdQuery(designId);
  if (!design) {
    context.error(`Design with ID ${designId} not found`);
    return;
  }

  await updateDesignQuery({
    ...design,
    mediaFileNames: [...design.mediaFileNames, `${fileName}.${extension}`],
  });
}
