import { designsContainer } from "../connection";
import { designDataModelSchema, type DesignDataModel } from "../types/Design";

export async function getDesignByIdQuery(
  id: string
): Promise<DesignDataModel | undefined> {
  const item = (await designsContainer.item(id, id).read<DesignDataModel>())
    .resource;

  return designDataModelSchema.parse(item);
}
