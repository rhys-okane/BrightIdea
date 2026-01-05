import type { HonoApp } from "@src/App";
import { containerClient } from "@src/blobs/ContainerClient";
import { updateDesignQuery } from "@src/database/queries/UpdateDesign";
import { adminRequired } from "@src/middleware/AdminRequired";
import { getDesign } from "@src/middleware/GetDesign";

export function listenForDELETEMediaFileRequest(app: HonoApp) {
  app.delete("/designs/:id/:fileName", adminRequired, getDesign, async (context) => {
    const fileName = context.req.param("fileName");
    const design = context.var.design;
    if (!design.mediaFileNames.includes(fileName)) {
      return context.json({ message: "File not found in design." }, 404);
    }

    const updatedMediaFileNames = design.mediaFileNames.filter((name) => name !== fileName);

    await containerClient.deleteBlob(`${context.var.design.id}/${fileName}`);
    await updateDesignQuery({
      ...design,
      mediaFileNames: updatedMediaFileNames,
    });

    return context.json({ message: "Media file deleted successfully." });
  });
}
